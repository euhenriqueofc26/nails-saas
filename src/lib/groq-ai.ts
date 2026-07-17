import { prisma } from './prisma'
import { sendTextMessage, formatPhoneForEvolution } from './evolution-api'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

interface ReplyResult {
  replied: boolean
  response?: string
}

export async function processIncomingMessage(
  sessionId: string,
  from: string,
  message: string,
  instanceName: string
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
          },
        },
      },
    })

    if (!session?.user) return { replied: false }

    const user = session.user

    if (!user.aiEnabled || user.planId !== 'premium') {
      return { replied: false }
    }

    const services = user.services || []
    const profile = user.publicProfile

    const recentHistory = await prisma.whatsAppMessage.findMany({
      where: { sessionId, direction: 'INBOUND', aiProcessed: true },
      orderBy: { timestamp: 'desc' },
      take: 5,
    })

    const systemPrompt = buildSystemPrompt(user, services, profile)

    const historyLines = recentHistory
      .reverse()
      .map((m: { content: string; aiResponse: string | null }) => `Cliente: ${m.content}${m.aiResponse ? `\nVoce: ${m.aiResponse}` : ''}`)
      .join('\n\n')

    const userPrompt = `Historico recente da conversa:\n${historyLines || '(inicio da conversa)'}\n\nCliente enviou: "${message}"\n\nResponda como se fosse a profissional. Natural, curto, direto. Conduza para o agendamento se for o caso.`

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
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

    if (!replyText) return { replied: false }

    const phoneFormatted = formatPhoneForEvolution(from)

    const instanceToken = session.instanceToken
    if (!instanceToken) {
      console.error('No instanceToken for session', sessionId)
      return { replied: false }
    }
    await sendTextMessage(instanceToken, phoneFormatted, replyText)

    await prisma.whatsAppMessage.updateMany({
      where: { sessionId, from, aiProcessed: false },
      data: { aiProcessed: true, aiResponse: replyText },
    })

    return { replied: true, response: replyText }
  } catch (error) {
    console.error('Groq AI process error:', error)
    return { replied: false }
  }
}

function buildSystemPrompt(
  user: { name: string; studioName: string },
  services: { name: string; price: number; duration: number; description: string | null }[],
  profile: { bio?: string | null; address?: string | null; workingHours?: string | null } | null
): string {
  const servicesText = services.length
    ? services
        .map(
          (s) =>
            `- ${s.name}: R$ ${s.price.toFixed(2)} (~${s.duration}min)${s.description ? ` - ${s.description}` : ''}`
        )
        .join('\n')
    : '(nenhum serviço cadastrado)'

  return `Voce e a secretaria virtual do studio "${user.studioName || user.name}".

INFORMACOES DO NEGOCIO:
- Nome do studio: ${user.studioName || user.name}
- Bio: ${profile?.bio || '(nao informado)'}
- Endereco: ${profile?.address || '(nao informado)'}
- Horarios: ${profile?.workingHours || '(nao informado)'}

SERVICOS DISPONIVEIS (apenas estes - NUNCA invente servicos ou precos):
${servicesText}

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
