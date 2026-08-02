import { prisma } from './prisma'

export const AI_CONTEXT_MESSAGES = 20

export function normalizeContactKey(input: string): string {
  return (input || '')
    .split(/[@:]/)[0]
    .replace(/\D/g, '')
}

export async function getOrCreateConversation(
  sessionId: string,
  contactKey: string,
  data: { lastMessage?: string; lastInteraction?: Date; customerName?: string } = {},
) {
  const now = data.lastInteraction || new Date()

  return prisma.whatsAppConversation.upsert({
    where: { sessionId_contactKey: { sessionId, contactKey } },
    update: {
      updatedAt: now,
      ...(data.lastMessage ? { lastMessage: data.lastMessage } : {}),
      ...(data.lastInteraction ? { lastInteraction: data.lastInteraction, lastMessageAt: data.lastInteraction } : {}),
      ...(data.customerName ? { customerName: data.customerName } : {}),
    },
    create: {
      sessionId,
      contactKey,
      ...(data.lastMessage ? { lastMessage: data.lastMessage } : {}),
      ...(data.lastInteraction ? { lastInteraction: data.lastInteraction, lastMessageAt: data.lastInteraction } : {}),
      ...(data.customerName ? { customerName: data.customerName } : {}),
    },
  })
}
