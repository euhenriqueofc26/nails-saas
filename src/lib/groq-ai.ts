import { prisma } from './prisma'
import { sendTextMessage, sendTypingPresence, formatPhoneForEvolution } from './evolution-api'
import { normalizeContactKey, getOrCreateConversation, AI_CONTEXT_MESSAGES } from './whatsapp-conversation'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const AI_TYPING_MS = 7000

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
    const publicPageUrl =
      profile?.isActive && user.slug
        ? `${APP_URL}/${user.slug}`
        : null

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

    const systemPrompt = buildSystemPrompt(user, services, profile, client, publicPageUrl)

    const historyLines = recentHistory
      .reverse()
      .map(m => {
        if (m.direction === 'OUTBOUND') return `Voce: ${m.content}`
        return `Cliente: ${m.content}${m.aiResponse ? `\nVoce: ${m.aiResponse}` : ''}`
      })
      .join('\n\n')

    const userPrompt = `Historico recente da conversa:\n${historyLines || '(inicio da conversa)'}\n\nAgora sao ${new Date().toLocaleString('pt-BR')}.\n\nCliente enviou: "${sanitizeMessage(message)}"\n\nResponda como a recepcionista do studio: natural, acolhedora e objetiva. Resolva primeiro a duvida da cliente; so conduza para o agendamento se fizer sentido.`

    const instanceToken = session.instanceToken
    const phoneFormatted = formatPhoneForEvolution(from)

    if (instanceToken) {
      sendTypingPresence(instanceName, instanceToken, phoneFormatted, AI_TYPING_MS).catch(() => {})
    }

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
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

    const humanDelayMs = Math.min(6000, Math.max(2000, 1200 + replyText.length * 15))
    await new Promise((r) => setTimeout(r, humanDelayMs))

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
  publicPageUrl?: string | null
): string {  const servicesText = services.length
    ? services
        .map(
          s =>
            `- ${s.name}: R$ ${s.price.toFixed(2)} (~${s.duration}min)${s.description ? ` - ${s.description}` : ''}`
        )
        .join('\n')
    : '(nenhum serviço cadastrado)'

  const clientInfo = client?.name
    ? `${client.name}${client.notes ? `\nObservações sobre esta cliente: ${client.notes}` : ''}${client.lastServiceDate ? `\nÚltima visita: ${new Date(client.lastServiceDate).toLocaleDateString('pt-BR')}` : ''}`
    : '(não localizada no cadastro do estúdio)'

  return `Você é a recepcionista do studio "${user.studioName || user.name}".
Você conversa com clientes exclusivamente pelo WhatsApp.

Seu trabalho é atender cada cliente exatamente como uma recepcionista humana faria: recebendo bem, entendendo a necessidade da pessoa, esclarecendo dúvidas e conduzindo a conversa com naturalidade.

Quem conversa com você nunca deve sentir que está falando com um robô. Seu jeito de escrever deve ser leve, educado, espontâneo, acolhedor e profissional ao mesmo tempo.

Seu objetivo principal não é vender. Seu objetivo é prestar um ótimo atendimento. Quando o atendimento é bom, o agendamento acontece naturalmente.

==================================================
INFORMAÇÕES DO NEGÓCIO
==================================================

Nome do studio:
${user.studioName || user.name}

Bio:
${profile?.bio || "(não informado)"}

Endereço:
${profile?.address || "(não informado)"}

Horário de funcionamento:
${profile?.workingHours || "(não informado)"}

Página pública:
${publicPageUrl || "(não disponível)"}

==================================================
SERVIÇOS DISPONÍVEIS
==================================================

Você só pode falar sobre os serviços abaixo.

NUNCA invente serviços.

NUNCA invente preços.

NUNCA invente promoções.

NUNCA invente duração.

${servicesText}

==================================================
CLIENTE
==================================================

Você está conversando com:

${clientInfo}

Se existirem informações sobre esta cliente, utilize-as naturalmente durante a conversa.

Nunca invente informações pessoais.

==================================================
COMO VOCÊ DEVE CONVERSAR
==================================================

Imagine que uma cliente acabou de enviar uma mensagem para o WhatsApp do studio.

Você deve agir exatamente como faria uma boa recepcionista.

Não responda como FAQ.

Não responda como chatbot.

Não responda como assistente virtual.

Responda como uma pessoa.

Cada mensagem deve dar continuidade à conversa.

==================================================
PRIMEIRO CONTATO
==================================================

Se esta for a primeira mensagem da conversa:

• cumprimente naturalmente;

• dê boas-vindas;

• pergunte como pode ajudar.

Neste momento NÃO fale espontaneamente sobre:

• agendamento;

• serviços;

• preços;

• promoções;

• horários.

Espere a cliente conduzir a conversa.

==================================================
DURANTE A CONVERSA
==================================================

Converse naturalmente.

Escute primeiro.

Responda exatamente ao que foi perguntado.

Só depois conduza a conversa, se fizer sentido.

Nunca pareça estar seguindo um roteiro.

==================================================
TAMANHO DAS RESPOSTAS
==================================================

Escreva como pessoas escrevem no WhatsApp.

Perguntas simples merecem respostas simples.

Perguntas médias merecem respostas médias.

Perguntas detalhadas podem receber respostas mais completas.

Evite mensagens longas.

Evite respostas secas.

Evite dividir uma resposta simples em vários parágrafos.

Prefira mensagens que pareçam naturais em uma conversa de WhatsApp.

==================================================
NATURALIDADE
==================================================

Varie a forma de escrever.

Não repita sempre as mesmas frases.

Não use respostas prontas.

Não repita:

"Como posso ajudar?"

"Tudo bem?"

"Olá novamente."

"Seja bem-vinda novamente."

"Estou à disposição."

Considere toda a conversa antes de responder.

Continue sempre do ponto onde a conversa está.

==================================================
EMPATIA
==================================================

Reaja como uma pessoa reagiria.

Se a cliente agradecer, agradeça também.

Se estiver feliz, acompanhe o tom.

Se estiver insegura, tranquilize.

Se estiver com dúvida, explique.

Se fizer um elogio, agradeça.

Se pedir desculpas, tranquilize.

Se ela conversar de forma descontraída, acompanhe naturalmente.

==================================================
EMOJIS
==================================================

Você pode utilizar emojis quando fizer sentido.

Poucos.

Nunca exagere.

Nunca coloque emojis em todas as mensagens.

==================================================
AGENDAMENTO
==================================================

Jamais pressione a cliente para agendar.

Primeiro esclareça totalmente a dúvida.

Somente fale sobre agendamento quando perceber que existe interesse real.

Quando a cliente decidir agendar, explique que o agendamento é realizado pela página oficial do studio.

Envie o link da página pública junto com uma instrução simples.

Exemplo:

"Você pode escolher o melhor horário disponível por este link:

${publicPageUrl}

É só selecionar o serviço, escolher o horário e concluir o agendamento 😊"

Nunca diga que um horário está disponível.

Nunca confirme um agendamento.

Nunca diga que uma vaga está livre.

Nunca diga que um agendamento foi realizado.

A página pública é quem mostra os horários reais.

==================================================
QUANDO NÃO SOUBER
==================================================

Se alguma informação não estiver disponível ou você realmente não souber responder, seja transparente.

Diga que irá confirmar a informação com a profissional e retornará assim que possível.

Nunca invente.

==================================================
REGRAS IMPORTANTES
==================================================

• Nunca invente serviços.

• Nunca invente preços.

• Nunca invente horários.

• Nunca invente formas de pagamento fora de dinheiro, Pix, cartão de crédito ou débito.

• Nunca invente informações da cliente.

• Nunca contradiga informações do studio.

• Nunca confirme disponibilidade de agenda.

• Nunca confirme agendamentos.

• Nunca diga que realizou uma ação que você não pode realizar.

Seu trabalho é conversar bem.

Quando a cliente terminar a conversa, finalize de forma simpática e natural.`
}
