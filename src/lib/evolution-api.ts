const EVOLUTION_BASE_URL = process.env.EVOLUTION_API_URL || ''
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''

export async function createInstance(instanceName: string, token: string) {
  const url = `${EVOLUTION_BASE_URL}/instance/create`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY },
    body: JSON.stringify({ name: instanceName, token }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Evolution createInstance error (${res.status}): ${text}`)
  }
  return res.json()
}

export async function deleteInstance(instanceName: string) {
  const url = `${EVOLUTION_BASE_URL}/instance/delete/${instanceName}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { apikey: EVOLUTION_API_KEY },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Evolution deleteInstance error (${res.status}): ${text}`)
  }
  return res.json()
}

export async function sendTextMessage(
  instanceToken: string,
  to: string,
  text: string,
) {
  const url = `${EVOLUTION_BASE_URL}/send/text`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: instanceToken },
    body: JSON.stringify({ number: to, text }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Evolution sendText error (${res.status}): ${text}`)
  }
  return res.json()
}

export async function getInstanceInfo(instanceName: string) {
  const all = await listAllInstances()
  const instances = all?.data || all?.instances || []
  const found = instances.find((inst: any) => inst.name === instanceName)
  if (!found) {
    throw new Error(`Evolution instance not found: ${instanceName}`)
  }
  const url = `${EVOLUTION_BASE_URL}/instance/info/${found.id}`
  const res = await fetch(url, {
    headers: { apikey: EVOLUTION_API_KEY },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Evolution getInstanceInfo error (${res.status}): ${text}`)
  }
  return res.json()
}

export async function listAllInstances() {
  const url = `${EVOLUTION_BASE_URL}/instance/all`
  const res = await fetch(url, {
    headers: { apikey: EVOLUTION_API_KEY },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Evolution listInstances error (${res.status}): ${text}`)
  }
  return res.json()
}

export async function logoutInstance(instanceToken: string) {
  const url = `${EVOLUTION_BASE_URL}/instance/logout`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: instanceToken },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Evolution logoutInstance error (${res.status}): ${text}`)
  }
  return res.json()
}

export async function connectInstance(instanceName: string, webhookUrl: string) {
  const url = `${EVOLUTION_BASE_URL}/instance/connect`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY },
    body: JSON.stringify({
      name: instanceName,
      webhookUrl,
      subscribe: ['ALL'],
      immediate: false,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Evolution connectInstance error (${res.status}): ${text}`)
  }
  return res.json()
}

export async function getInstanceQrCode(instanceName: string) {
  const url = `${EVOLUTION_BASE_URL}/instance/qr`
  const res = await fetch(url, {
    headers: { apikey: EVOLUTION_API_KEY },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Evolution getInstanceQrCode error (${res.status}): ${text}`)
  }
  return res.json()
}

export async function getConnectionState(instanceName: string) {
  const all = await listAllInstances()
  const instances = all?.data || all?.instances || []
  const found = instances.find((inst: any) => inst.name === instanceName)
  if (!found) {
    throw new Error(`Evolution instance not found: ${instanceName}`)
  }
  const url = `${EVOLUTION_BASE_URL}/instance/info/${found.id}`
  const res = await fetch(url, {
    headers: { apikey: EVOLUTION_API_KEY },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Evolution getConnectionState error (${res.status}): ${text}`)
  }
  return res.json()
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
