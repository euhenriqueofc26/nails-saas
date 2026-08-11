import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import { createInstance, connectInstance, deleteInstance, listAllInstances, logoutInstance, WHATSAPP_PLAN_LIMIT } from '@/lib/evolution-api'

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

    const instanceToken = existingSession?.instanceToken || crypto.randomUUID()
    let evolutionId: string | null = existingSession?.evolutionId || null

    let instanceExists = false
    try {
      const all = await listAllInstances()
      const instances = (all?.data || all?.instances || []) as { id?: string; name?: string; connected?: boolean }[]
      const found = instances.find((inst) => inst.name === instanceName)
      if (found) {
        instanceExists = true
        if (found.id) evolutionId = found.id
        if (found.connected) {
          return NextResponse.json(
            { error: 'WhatsApp já está conectado no Evolution' },
            { status: 400 }
          )
        }
      }
    } catch (err) {
      console.warn('[connect] Falha ao listar instâncias:', err)
    }

    if (instanceExists) {
      try {
        await deleteInstance(instanceName)
        instanceExists = false
        evolutionId = null
      } catch (err) {
        console.warn('[connect] Falha ao resetar instância antiga:', err)
      }
    }

    if (!instanceExists) {
      const result = await createInstance(instanceName, instanceToken)
      evolutionId = result?.data?.id || null
    }

    try {
      await logoutInstance(instanceToken)
    } catch (err) {
      console.warn('[connect] logoutInstance ignorado (rota não existe nesta build):', err)
    }

    const webhookUrl =
      (process.env.NEXT_PUBLIC_APP_URL || 'https://www.clubnailsbrasil.com.br') +
      '/api/webhooks/evolution/incoming'

    const connectResult = await connectInstance(instanceName, webhookUrl, instanceToken)
    if (!connectResult?.success && !connectResult?.data) {
      return NextResponse.json(
        { error: 'Falha ao conectar instância no Evolution Go' },
        { status: 502 }
      )
    }

    if (existingSession) {
      await prisma.whatsAppSession.update({
        where: { id: existingSession.id },
        data: { status: 'INITIALIZING', evolutionId, qrCode: null, lastHeartbeat: new Date() },
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
