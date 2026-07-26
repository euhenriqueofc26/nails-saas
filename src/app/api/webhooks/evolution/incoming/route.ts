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

    if (body.event === 'Connected' || body.event === 'PairSuccess' || body.event === 'Disconnected' || body.event === 'LoggedOut') {
      const instanceId = body.instanceId || ''
      const state = body.data?.status || body.data?.state || ''
      const jid = body.data?.jid || ''
      if (instanceId) {
        const session = await prisma.whatsAppSession.findFirst({
          where: { evolutionId: instanceId },
        })
        if (session) {
          let newStatus = session.status
          let phoneNumber = session.phoneNumber

          if (body.event === 'Connected' || body.event === 'PairSuccess' || state === 'open') {
            newStatus = 'CONNECTED'
            if (!phoneNumber && jid) {
              phoneNumber = jid.replace(/@.*$/, '').replace(/:.*/, '')
            }
          } else if (body.event === 'LoggedOut' || state === 'close' || body.event === 'Disconnected') {
            newStatus = 'DISCONNECTED'
          }

          if (newStatus !== session.status || (phoneNumber && !session.phoneNumber)) {
            await prisma.whatsAppSession.update({
              where: { id: session.id },
              data: { status: newStatus, phoneNumber: phoneNumber || session.phoneNumber, lastHeartbeat: new Date() },
            })
          }
        }
      }
      return NextResponse.json({ success: true })
    }

    const instanceName = body.instance || body.instanceName || ''
    const from = body.key?.remoteJid?.replace(/\D/g, '') || body.data?.key?.remoteJid?.replace(/\D/g, '') || body.from || ''
    const content = body.message?.conversation || body.message?.extendedTextMessage?.text || body.data?.message?.conversation || body.data?.message?.extendedTextMessage?.text || body.text || ''
    const messageType = body.message?.messageType || body.data?.message?.messageType || 'text'

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

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    await prisma.whatsAppMessage.updateMany({
      where: {
        sessionId: session.id,
        direction: 'INBOUND',
        aiProcessed: false,
        timestamp: { lt: fiveMinAgo },
      },
      data: { aiProcessed: true, aiResponse: '[timeout - mensagem antiga]' },
    })

    const result = await processIncomingMessage(session.id, from, content, instanceName)

    return NextResponse.json({
      success: true,
      replied: result.replied,
    })
  } catch (error) {
    console.error('Webhook incoming error:', error)
    return NextResponse.json({ success: true })
  }
}
