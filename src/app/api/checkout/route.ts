import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createPreference } from '@/lib/mercadopago'

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const payload = await verifyToken(token)

  if (!payload) {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plano não especificado' }, { status: 400 })
    }

    const plan = await prisma.plan.findUnique({ where: { slug: planId } })
    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    if (plan.price === 0) {
      return NextResponse.json({ error: 'Plano gratuito não requer pagamento' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (user.isBlocked) {
      return NextResponse.json({ error: 'Conta bloqueada. Entre em contato com o suporte.' }, { status: 403 })
    }

    const preference = await createPreference({
      planSlug: plan.slug,
      planName: plan.name,
      price: plan.price,
      userId: user.id,
      email: user.email,
    })

    return NextResponse.json({
      checkoutUrl: preference.initPoint,
      preferenceId: preference.id,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
      },
    })
  } catch (error) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Erro ao processar pagamento'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
