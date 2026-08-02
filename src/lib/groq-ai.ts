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
          include: {
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

    const systemPrompt = buildSystemPrompt(user, services, profile, client)

    const historyLines = recentHistory
      .reverse()
      .map(m => {
        if (m.direction === 'OUTBOUND') return `Voce: ${m.content}`
        return `Cliente: ${m.content}${m.aiResponse ? `\nVoce: ${m.aiResponse}` : ''}`
      })
      .join('\n\n')

    const userPrompt = `Historico recente da conversa:\n${historyLines || '(inicio da conversa)'}\n\nCliente enviou: "${sanitizeMessage(message)}"\n\nResponda como se fosse a profissional. Natural, curto, direto. Conduza para o agendamento se for o caso.`

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
  client?: { name?: string; notes?: string | null; lastServiceDate?: Date | null } | null
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

  return `Voce e a secretaria virtual do studio "${user.studioName || user.name}".

INFORMACOES DO NEGOCIO:
- Nome do studio: ${user.studioName || user.name}
- Bio: ${profile?.bio || '(nao informado)'}
- Endereco: ${profile?.address || '(nao informado)'}
- Horarios: ${profile?.workingHours || '(nao informado)'}

SERVICOS DISPONIVEIS (apenas estes - NUNCA invente servicos ou precos):
${servicesText}${clientInfo}

REGRAS ABSOLUTAS:
1. NUNCA invente servicos, precos ou horarios que nao estao na lista acima
2. NUNCA trate a cliente por "amiga", "querida", "meu bem" - use o nome dela ou "voce"
3. Seja educada, profissional e natural - como se fosse a propria profissional respondendo
4. Responda CURTO e DIRETO (maximo 3 frases)
5. Se a cliente quiser agendar, conduza para isso educadamente
6. Se nao souber responder, diga "Vou transferir para a profissional"
7. Responda SEMPRE em portugues brasileiro
8. Use pontuacao normal, sem exageros`
}
