import { PrismaClient } from '@prisma/client'
import { normalizeContactKey } from '../src/lib/whatsapp-conversation'

const prisma = new PrismaClient()

async function main() {
  const sessions = await prisma.whatsAppSession.findMany({ select: { id: true } })
  console.log(`Sessoes: ${sessions.length}`)

  for (const session of sessions) {
    const messages = await prisma.whatsAppMessage.findMany({
      where: { sessionId: session.id },
      select: { id: true, from: true, to: true, direction: true, content: true, timestamp: true },
      orderBy: { timestamp: 'asc' },
    })

    const groups = new Map<string, { ids: string[]; lastMessage: string; lastInteraction: Date }>()

    for (const m of messages) {
      const raw = m.direction === 'INBOUND' ? m.from : m.to
      const key = normalizeContactKey(raw)
      if (!key) continue

      const group = groups.get(key) || { ids: [], lastMessage: '', lastInteraction: m.timestamp }
      group.ids.push(m.id)
      group.lastMessage = m.content
      if (m.timestamp > group.lastInteraction) group.lastInteraction = m.timestamp
      groups.set(key, group)
    }

    for (const [key, group] of Array.from(groups.entries())) {
      const conversation = await prisma.whatsAppConversation.upsert({
        where: { sessionId_contactKey: { sessionId: session.id, contactKey: key } },
        update: {
          lastMessage: group.lastMessage,
          lastInteraction: group.lastInteraction,
          lastMessageAt: group.lastInteraction,
        },
        create: {
          sessionId: session.id,
          contactKey: key,
          lastMessage: group.lastMessage,
          lastInteraction: group.lastInteraction,
          lastMessageAt: group.lastInteraction,
        },
      })

      await prisma.whatsAppMessage.updateMany({
        where: { id: { in: group.ids } },
        data: { conversationId: conversation.id },
      })

      console.log(`  [${session.id}] contato ${key}: ${group.ids.length} msgs`)
    }
  }

  console.log('Backfill concluido.')
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
