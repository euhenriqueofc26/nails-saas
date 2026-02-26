import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  if (req.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        studioName: true,
        slug: true,
        role: true,
        planId: true,
        isBlocked: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        stripeCustomerId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            clients: true,
            appointments: true,
            services: true,
          }
        }
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const plans = await prisma.plan.findMany()

    return NextResponse.json({ user, plans })
  } catch (error) {
    console.error('Admin get user error:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 })
  }
}

export async function PUT(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  if (req.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { planId, isBlocked, extendTrial } = body

    const CEO_EMAIL = 'euhenriqueofc26@gmail.com'
    const targetUser = await prisma.user.findUnique({ where: { id: params.id } })
    
    if (targetUser?.email === CEO_EMAIL) {
      return NextResponse.json({ error: 'Não é possível alterar o acesso do CEO' }, { status: 403 })
    }

    const updateData: any = {}

    if (planId !== undefined) {
      updateData.planId = planId
    }

    if (isBlocked !== undefined) {
      updateData.isBlocked = isBlocked
    }

    if (extendTrial !== undefined && extendTrial > 0) {
      const user = await prisma.user.findUnique({ where: { id: params.id } })
      if (user) {
        const currentTrialEnd = user.trialEndsAt || new Date()
        currentTrialEnd.setDate(currentTrialEnd.getDate() + extendTrial)
        updateData.trialEndsAt = currentTrialEnd
      }
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        studioName: true,
        planId: true,
        isBlocked: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Admin update user error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
  }
}
