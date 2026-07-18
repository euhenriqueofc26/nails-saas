import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import { createInstance, connectInstance, getInstanceQrCode, WHATSAPP_PLAN_LIMIT } from '@/lib/evolution-api'

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { plan: { select: { slug: true } } },
    })

    const planSlug = user?.plan?.slug || 'free'

    if (!user || planSlug !== WHATSAPP_PLAN_LIMIT) {
      return NextResponse.json(
        { error: 'WhatsApp automático disponível apenas no plano Premium' },
        { status: 403 }
      )
    }

    const instanceName = user.slug
    const instanceToken = crypto.randomUUID()

    const existingSession = await prisma.whatsAppSession.findUnique({
      where: { userId: user.id },
    })

    if (existingSession?.status === 'CONNECTED') {
      return NextResponse.json(
        { error: 'WhatsApp já está conectado' },
        { status: 400 }
      )
    }

    if (existingSession) {
      await prisma.whatsAppSession.delete({
        where: { id: existingSession.id },
      })
    }

    await createInstance(instanceName, instanceToken)

    const webhookUrl =
      (process.env.NEXT_PUBLIC_APP_URL || 'https://www.clubnailsbrasil.com.br') +
      '/api/webhooks/evolution/incoming'

    try {
      await connectInstance(instanceName, webhookUrl)
    } catch {
    }

    await new Promise((resolve) => setTimeout(resolve, 4000))

    let qrCode: string | null = null
    try {
      const qrData = await getInstanceQrCode(instanceName)
      const qrcodeBase64 = qrData?.data?.Qrcode || qrData?.data?.qrcode || qrData?.qrcode || ''
      if (qrcodeBase64) {
        const cleaned = qrcodeBase64.replace(/^data:image\/png;base64,/, '')
        qrCode = cleaned
      }
    } catch {
    }

    const session = await prisma.whatsAppSession.create({
      data: {
        userId: user.id,
        instanceName,
        instanceToken,
        status: 'INITIALIZING',
        qrCode,
      },
    })

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        instanceName: session.instanceName,
        qrCode: session.qrCode,
      },
    })
  } catch (error) {
    console.error('WhatsApp connect error:', error)
    return NextResponse.json(
      { error: 'Erro ao conectar WhatsApp' },
      { status: 500 }
    )
  }
}
