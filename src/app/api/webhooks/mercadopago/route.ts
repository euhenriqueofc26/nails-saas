import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPayment } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const topic = searchParams.get('topic') || searchParams.get('type')
    const id = searchParams.get('id')

    let paymentId: string | null = id

    if (!paymentId) {
      const body = await req.json().catch(() => ({}))
      paymentId = body?.data?.id || body?.id || null
    }

    if (!paymentId || topic === 'merchant_order') {
      return NextResponse.json({ received: true })
    }

    if (topic !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const payment = await getPayment(paymentId)

    if (payment.status !== 'approved') {
      return NextResponse.json({ received: true })
    }

    let externalRef: { userId: string; planSlug: string }
    try {
      externalRef = JSON.parse(payment.external_reference || '{}')
    } catch {
      return NextResponse.json({ error: 'Invalid external_reference' }, { status: 400 })
    }

    if (!externalRef.userId || !externalRef.planSlug) {
      return NextResponse.json({ error: 'Missing ref data' }, { status: 400 })
    }

    const plan = await prisma.plan.findUnique({ where: { slug: externalRef.planSlug } })
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const subscriptionEndsAt = new Date()
    subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30)

    await prisma.user.update({
      where: { id: externalRef.userId },
      data: {
        planId: plan.id,
        subscriptionEndsAt,
        isBlocked: false,
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('MercadoPago webhook error:', error)
    const isNotFound = (error as { error?: string })?.error === 'resource not found'
    if (isNotFound) {
      return NextResponse.json({ received: true })
    }
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
