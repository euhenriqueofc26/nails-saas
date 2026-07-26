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

    console.log('[webhook] event:', body.event, 'instance:', body.instance, 'remoteJid:', body.key?.remoteJid)

    const instanceName = body.instance || body.instanceName || ''

    const rawJid = body.key?.remoteJid || body.data?.key?.remoteJid || body.from || ''
    const from = rawJid.replace(/[:@].*$/, '').replace(/\D/g, '').slice(0, 13)

    const msg = body.message || body.data?.message || {}
    const content = msg.conversation
      || msg.extendedTextMessage?.text
      || msg.imageMessage?.caption
      || msg.videoMessage?.caption
      || msg.documentMessage?.caption
      || (msg.audioMessage ? '[áudio]' : '')
      || (msg.stickerMessage ? '[figurinha]' : '')
      || body.text || ''
    const messageType = msg.messageType || 'text'

    if (!instanceName || !from || !content) {
      console.log('[webhook] SKIP missing:', { instanceName, from, content: content?.substring(0, 30) })
      return NextResponse.json({ success: true })
    }

    let session = await prisma.whatsAppSession.findUnique({
      where: { instanceName },
    })

    if (!session && body.instanceId) {
      session = await prisma.whatsAppSession.findFirst({
        where: { evolutionId: body.instanceId },
      })
    }

    if (!session) {
      console.log('[webhook] SKIP no session:', instanceName)
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
