import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processIncomingMessage } from '@/lib/groq-ai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.event === 'QRCode') {
      const instanceId = body.instanceId || ''
      const qrcode = body.data?.qrcode || ''

      if (instanceId && qrcode) {
        const cleaned = qrcode.replace(/^data:image\/png;base64,/, '')
        const session = await prisma.whatsAppSession.findFirst({
          where: { evolutionId: instanceId },
        })
        if (session) {
          await prisma.whatsAppSession.update({
            where: { id: session.id },
            data: { qrCode: cleaned, status: 'INITIALIZING', lastHeartbeat: new Date() },
          })
        }
      }
      return NextResponse.json({ success: true })
    }

    if (body.event === 'CONNECTION') {
      const instanceId = body.instanceId || ''
      const state = body.data?.state || ''
      if (instanceId) {
        const session = await prisma.whatsAppSession.findFirst({
          where: { evolutionId: instanceId },
        })
        if (session) {
          let newStatus = session.status
          if (state === 'open') {
            newStatus = 'CONNECTED'
          } else if (state === 'close') {
            newStatus = 'DISCONNECTED'
          }
          if (newStatus !== session.status) {
            await prisma.whatsAppSession.update({
              where: { id: session.id },
              data: { status: newStatus, lastHeartbeat: new Date() },
            })
          }
        }
      }
      return NextResponse.json({ success: true })
    }

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
