import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import { createInstance, connectInstance, listAllInstances, WHATSAPP_PLAN_LIMIT } from '@/lib/evolution-api'

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

    let existingSession = await prisma.whatsAppSession.findUnique({
      where: { userId: user.id },
    })

    if (existingSession?.status === 'CONNECTED') {
      return NextResponse.json(
        { error: 'WhatsApp já está conectado' },
        { status: 400 }
      )
    }

    let instanceToken = existingSession?.instanceToken || crypto.randomUUID()
    let evolutionId: string | null = existingSession?.evolutionId || null

    let instanceExists = false
    try {
      const all = await listAllInstances()
      const instances = all?.data || all?.instances || []
      const found = instances.find((inst: any) => inst.name === instanceName)
      if (found) {
        instanceExists = true
        if (!evolutionId) evolutionId = found.id
      }
    } catch {
    }

    if (!instanceExists) {
      const result = await createInstance(instanceName, instanceToken)
      evolutionId = result?.data?.id || null
    }

    const webhookUrl =
      (process.env.NEXT_PUBLIC_APP_URL || 'https://www.clubnailsbrasil.com.br') +
      '/api/webhooks/evolution/incoming'

    try {
      await connectInstance(instanceName, webhookUrl, instanceToken)
    } catch {
    }

    if (existingSession) {
      await prisma.whatsAppSession.update({
        where: { id: existingSession.id },
        data: { status: 'INITIALIZING', evolutionId, lastHeartbeat: new Date() },
      })
    } else {
      existingSession = await prisma.whatsAppSession.create({
        data: {
          userId: user.id,
          instanceName,
          instanceToken,
          evolutionId,
          status: 'INITIALIZING',
        },
      })
    }

    return NextResponse.json({
      success: true,
      session: {
        id: existingSession.id,
        status: 'INITIALIZING',
        instanceName,
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
