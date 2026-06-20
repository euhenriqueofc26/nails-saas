import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import { createInstance, WHATSAPP_PLAN_LIMIT } from '@/lib/evolution-api'

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    })

    if (!user || user.planId !== WHATSAPP_PLAN_LIMIT) {
      return NextResponse.json(
        { error: 'WhatsApp automático disponível apenas no plano Premium' },
        { status: 403 }
      )
    }

    const instanceName = user.slug

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

    const result = await createInstance(instanceName)

    const qrBase64 = result.qrcode?.base64 || ''
    const qrCode = result.qrcode?.code || ''

    const session = await prisma.whatsAppSession.create({
      data: {
        userId: user.id,
        instanceName,
        status: 'INITIALIZING',
        qrCode: qrBase64 || qrCode,
      },
    })

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        qrCode: session.qrCode,
        instanceName: session.instanceName,
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
