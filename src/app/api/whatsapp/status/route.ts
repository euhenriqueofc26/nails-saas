import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import { getConnectionState } from '@/lib/evolution-api'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const session = await prisma.whatsAppSession.findUnique({
      where: { userId: req.user!.userId },
    })

    if (!session) {
      return NextResponse.json({
        connected: false,
        session: null,
      })
    }

    let liveStatus = session.status
    let qrCode = ''

    if (session.instanceName && session.status !== 'CONNECTED') {
      try {
        const state = await getConnectionState(session.instanceName, session.evolutionId)
        const remoteJid = state?.data?.remoteJid || ''
        const connectionState = state?.data?.state || state?.data?.status || ''

        let newStatus = liveStatus
        if (connectionState === 'open' || remoteJid) {
          newStatus = 'CONNECTED'
        } else if (connectionState === 'connecting' || connectionState === 'pairing') {
          newStatus = 'INITIALIZING'
        } else if (connectionState === 'close') {
          newStatus = 'DISCONNECTED'
        }

        qrCode = state?.data?.qrcode?.code || state?.instance?.qrcode?.code || state?.data?.qrcode || ''

        if (newStatus !== session.status || (qrCode && qrCode !== session.qrCode)) {
          const updateData: Record<string, any> = { lastHeartbeat: new Date() }
          if (newStatus !== session.status) {
            updateData.status = newStatus
          }
          if (qrCode && qrCode !== session.qrCode) {
            updateData.qrCode = qrCode
          }
          await prisma.whatsAppSession.update({
            where: { id: session.id },
            data: updateData,
          })
        }
        liveStatus = newStatus
      } catch {
      }
    }

    const currentQr = qrCode || session.qrCode || ''

    return NextResponse.json({
      connected: liveStatus === 'CONNECTED',
      session: {
        id: session.id,
        status: liveStatus,
        phoneNumber: session.phoneNumber,
        instanceName: session.instanceName,
        qrCode: currentQr,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    })
  } catch (error) {
    console.error('WhatsApp status error:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    )
  }
}
