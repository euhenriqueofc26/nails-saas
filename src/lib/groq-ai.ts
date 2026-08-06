import { prisma } from './prisma'
import { sendTextMessage, formatPhoneForEvolution } from './evolution-api'
import { normalizeContactKey, getOrCreateConversation, AI_CONTEXT_MESSAGES } from './whatsapp-conversation'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

interface ReplyResult {
  replied: boolean
  response?: string
}

function sanitizeMessage(input: string): string {
  return input
    .normalize('NFC')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[^\w\s.,!?\-@:;/()áàâãéèêíïóôõúüçÁÀÂÃÉÈÊÍÏÓÔÕÚÜÇ]/gi, '')
    .trim()
    .slice(0, 500)
}

export async function processIncomingMessage(
  sessionId: string,
  from: string,
  message: string,
  instanceName: string,
  messageId?: string,
  contactKey?: string,
): Promise<ReplyResult> {
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY not configured')
    return { replied: false }
  }

  try {
    const session = await prisma.whatsAppSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            studioName: true,
            slug: true,
            aiEnabled: true,
            services: { where: { isActive: true } },
            publicProfile: true,
            plan: { select: { slug: true } },
          },
        },
      },
    })

    if (!session?.user) {
      return { replied: false }
    }

    const user = session.user
    const planSlug = user.plan?.slug || 'free'

    if (!user.aiEnabled || planSlug !== 'premium') {
      return { replied: false }
    }

    const services = user.services || []
    const profile = user.publicProfile

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.clubnailsbrasil.com.br'
    const publicPageInfo =
      profile?.isActive && user.slug
        ? `\n- Pagina publica: ${APP_URL}/${user.slug}`
        : ''

    const key = contactKey || normalizeContactKey(from)

    const clients = await prisma.client.findMany({
      where: { userId: user.id },
      select: { name: true, notes: true, lastServiceDate: true, whatsapp: true },
    })

    const client =
      clients.find(c => normalizeContactKey(c.whatsapp) === key) ||
      clients.find(c => {
        const stored = normalizeContactKey(c.whatsapp)
        return (stored.length >= 10 && key.endsWith(stored.slice(-10))) ||
               (key.length >= 10 && stored.endsWith(key.slice(-10)))
      })

    const conversation = await getOrCreateConversation(session.id, key)

    if (client?.name) {
      await prisma.whatsAppConversation.updateMany({
        where: { id: conversation.id, customerName: null },
        data: { customerName: client.name },
      })
    }

    const recentHistory = await prisma.whatsAppMessage.findMany({
      where: {
        conversationId: conversation.id,
        NOT: { aiResponse: { startsWith: '[timeout' } },
      },
      orderBy: { timestamp: 'desc' },
      take: AI_CONTEXT_MESSAGES,
    })

    const systemPrompt = buildSystemPrompt(user, services, profile, client, publicPageInfo)

    const historyLines = recentHistory
      .reverse()
      .map(m => {
        if (m.direction === 'OUTBOUND') return `Voce: ${m.content}`
        return `Cliente: ${m.content}${m.aiResponse ? `\nVoce: ${m.aiResponse}` : ''}`
      })
      .join('\n\n')

    const userPrompt = `Historico recente da conversa:\n${historyLines || '(inicio da conversa)'}\n\nAgora sao ${new Date().toLocaleString('pt-BR')}.\n\nCliente enviou: "${sanitizeMessage(message)}"\n\nResponda como a recepcionista do studio: natural, acolhedora e objetiva. Resolva primeiro a duvida da cliente; so conduza para o agendamento se fizer sentido.`

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    if (!groqResponse.ok) {
      const errText = await groqResponse.text()
      console.error('Groq API error:', groqResponse.status, errText)
      return { replied: false }
    }

    const data = await groqResponse.json()
    const replyText = data.choices?.[0]?.message?.content?.trim()

    if (!replyText) {
      return { replied: false }
    }

    const phoneFormatted = formatPhoneForEvolution(from)

    const instanceToken = session.instanceToken
    if (!instanceToken) {
      return { replied: false }
    }

    await sendTextMessage(instanceToken, phoneFormatted, replyText)

    if (messageId) {
      await prisma.whatsAppMessage.update({
        where: { id: messageId },
        data: { aiProcessed: true, aiResponse: replyText },
      })
    } else {
      const pendingMessage = await prisma.whatsAppMessage.findFirst({
        where: { sessionId, from, aiProcessed: false },
        orderBy: { timestamp: 'desc' },
      })
      if (pendingMessage) {
        await prisma.whatsAppMessage.update({
          where: { id: pendingMessage.id },
          data: { aiProcessed: true, aiResponse: replyText },
        })
      }
    }

    return { replied: true, response: replyText }
  } catch (error) {
    console.error('[groq-ai] Error:', {
      sessionId,
      from,
      instanceName,
      message: error instanceof Error ? error.message : String(error),
    })
    return { replied: false }
  }
}

function buildSystemPrompt(
  user: { name: string; studioName: string },
  services: { name: string; price: number; duration: number; description: string | null }[],
  profile: { bio?: string | null; address?: string | null; workingHours?: string | null } | null,
  client?: { name?: string; notes?: string | null; lastServiceDate?: Date | null } | null,
  publicPageInfo?: string
): string {
  const servicesText = services.length
    ? services
        .map(
          s =>
            `- ${s.name}: R$ ${s.price.toFixed(2)} (~${s.duration}min)${s.description ? ` - ${s.description}` : ''}`
        )
        .join('\n')
    : '(nenhum serviço cadastrado)'

  const clientInfo = client?.name
    ? `\n\nVOCE ESTA FALANDO COM: ${client.name}${client.notes ? `\nObservacoes sobre esta cliente: ${client.notes}` : ''}${client.lastServiceDate ? `\nUltima visita: ${new Date(client.lastServiceDate).toLocaleDateString('pt-BR')}` : ''}`
    : ''

  return `Voce e a recepcionista do studio "${user.studioName || user.name}".

INFORMACOES DO NEGOCIO:
- Nome do studio: ${user.studioName || user.name}
- Bio: ${profile?.bio || '(nao informado)'}
- Endereco: ${profile?.address || '(nao informado)'}
- Horarios: ${profile?.workingHours || '(nao informado)'}${publicPageInfo}

SERVICOS DISPONIVEIS (apenas estes - NUNCA invente servicos ou precos):
${servicesText}${clientInfo}

REGRAS ABSOLUTAS:
1. NUNCA invente servicos, precos ou horarios que nao estao na lista acima
2. NUNCA trate a cliente por "amiga", "querida", "meu bem" - use o nome dela ou "voce"
3. Fale como uma pessoa real em texto, nunca como chatbot: seja acolhedora, espontanea e demonstre interesse genuino
4. Seja objetiva, mas completa: use as frases necessarias para resolver a duvida com naturalidade - nem resposta seca demais, nem texto longo
5. PRIMEIRO resolva totalmente a duvida da cliente. SO ofereca agendamento quando houver sinal claro de interesse
6. Se nao souber responder, diga que vai confirmar com a profissional e ja retorna
7. Responda SEMPRE em portugues brasileiro, com pontuacao normal e emojis com moderacao
8. NAO repita cumprimentos, apresentacoes ou perguntas ja feitas no mesmo atendimento (ex.: "tudo bem?", "como posso ajudar?"). Depois do primeiro cumprimento, va direto ao assunto
9. Quando a cliente quiser agendar, envie o link da pagina publica: "Voce pode escolher o servico e o horario direto por aqui: [link]" + uma instrucao curta. NUNCA confirme horario disponivel - a pagina mostra os horarios reais
10. Se a pagina publica nao estiver ativa, nao envie link; diga que vai confirmar com a profissional e ela retorna`
}
