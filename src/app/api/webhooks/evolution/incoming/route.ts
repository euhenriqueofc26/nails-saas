import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processIncomingMessage } from '@/lib/groq-ai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const instanceName = body.instance || body.instanceName || ''
    const from = body.key?.remoteJid?.replace(/\D/g, '') || body.from || ''
    const content = body.message?.conversation || body.message?.extendedTextMessage?.text || body.text || ''
    const messageType = body.message?.messageType || 'text'

    if (!instanceName || !from || !content) {
      return NextResponse.json({ success: true })
    }

    const session = await prisma.whatsAppSession.findUnique({
      where: { instanceName },
    })

    if (!session) {
      return NextResponse.json({ success: true })
    }

    await prisma.whatsAppMessage.create({
      data: {
        sessionId: session.id,
        from,
        to: session.phoneNumber || '',
        content,
        direction: 'INBOUND',
        status: 'RECEIVED',
        messageType,
      },
    })

    const inProgress = await prisma.whatsAppMessage.count({
      where: {
        sessionId: session.id,
        direction: 'INBOUND',
        aiProcessed: false,
      },
    })

    if (inProgress <= 5) {
      const result = await processIncomingMessage(session.id, from, content, instanceName)

      return NextResponse.json({
        success: true,
        replied: result.replied,
      })
    }

    return NextResponse.json({
      success: true,
      process: inProgress <= 5 ? 'will_process' : 'queued',
    })
  } catch (error) {
    console.error('Webhook incoming error:', error)
    return NextResponse.json({ success: true })
  }
}
