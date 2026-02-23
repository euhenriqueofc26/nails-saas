import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plano não especificado' }, { status: 400 })
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    if (plan.price === 0) {
      return NextResponse.json({ error: 'Plano gratuito não requer pagamento' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const checkoutUrl = new URL(`${baseUrl}/checkout`)
    checkoutUrl.searchParams.set('plan', plan.slug)
    checkoutUrl.searchParams.set('price', plan.price.toString())
    checkoutUrl.searchParams.set('userId', user.id)

    return NextResponse.json({
      checkoutUrl: checkoutUrl.toString(),
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
      }
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Erro ao processar pagamento' }, { status: 500 })
  }
}
