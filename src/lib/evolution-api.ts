const EVOLUTION_BASE_URL = process.env.EVOLUTION_API_URL || ''
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''

interface EvolutionApiKey {
  apikey?: string
}

interface EvolutionResponse {
  success?: boolean
  error?: string
  qrcode?: {
    code: string
    base64: string
  }
  instance?: {
    instanceName: string
    status: string
  }
  connectionState?: string
}

async function evolutionFetch(path: string, options: RequestInit = {}) {
  const url = `${EVOLUTION_BASE_URL}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (EVOLUTION_API_KEY) {
    headers['apikey'] = EVOLUTION_API_KEY
  }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Evolution API error (${res.status}): ${text}`)
  }

  return res.json()
}

export async function createInstance(instanceName: string) {
  return evolutionFetch('/instance/create', {
    method: 'POST',
    body: JSON.stringify({
      instanceName,
      qrcode: true,
    } as EvolutionApiKey & { instanceName: string; qrcode: boolean }),
  }) as Promise<EvolutionResponse>
}

export async function getConnectionState(instanceName: string) {
  return evolutionFetch(`/instance/connectionState/${instanceName}`)
}

export async function logoutInstance(instanceName: string) {
  return evolutionFetch(`/instance/logout/${instanceName}`, {
    method: 'POST',
  })
}

export async function deleteInstance(instanceName: string) {
  return evolutionFetch(`/instance/delete/${instanceName}`, {
    method: 'DELETE',
  })
}

export async function sendTextMessage(
  instanceName: string,
  to: string,
  text: string,
  delay: number = 5000
) {
  const body: Record<string, unknown> = {
    number: to,
    text,
    delay,
  }

  if (EVOLUTION_API_KEY) {
    body.apikey = EVOLUTION_API_KEY
  }

  return evolutionFetch(`/message/send/${instanceName}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function formatPhoneForEvolution(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (!cleaned.startsWith('55')) {
    return '55' + cleaned
  }
  return cleaned
}

export function generateMessageVariations(baseMessages: string[]): string[] {
  const greetings = ['Olá', 'Oi', 'Oie']
  const emojis = ['💅', '✨', '🌟', '😊', '❤️']
  const signoffs = [
    'Qualquer dúvida, estamos por aqui!',
    'Agradecemos a preferência!',
    'Tenha um ótimo dia!',
    '',
  ]

  const variations: string[] = []

  for (const base of baseMessages) {
    for (const greeting of greetings) {
      for (const emoji of emojis.slice(0, 2)) {
        for (const signoff of signoffs.slice(0, 2)) {
          const parts = [base]
          if (signoff) parts.push('\n\n' + signoff)
          variations.push(`${greeting}! ${parts.join('')}`)
        }
      }
    }
  }

  return shuffleArray(variations)
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function generateDelay(): number {
  return Math.floor(Math.random() * (30000 - 20000 + 1)) + 20000
}

export const WHATSAPP_PLAN_LIMIT = 'premium'
