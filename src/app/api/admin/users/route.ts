import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  if (req.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const planFilter = searchParams.get('plan') || ''
    const statusFilter = searchParams.get('status') || ''

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { studioName: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (planFilter) {
      where.planId = planFilter
    }

    if (statusFilter === 'blocked') {
      where.isBlocked = true
    } else if (statusFilter === 'active') {
      where.isBlocked = false
    }

    if (statusFilter === 'trial') {
      where.trialEndsAt = { gte: new Date() }
      where.subscriptionEndsAt = null
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          studioName: true,
          slug: true,
          role: true,
          planId: true,
          isBlocked: true,
          trialEndsAt: true,
          subscriptionEndsAt: true,
          createdAt: true,
          _count: {
            select: {
              clients: true,
              appointments: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    const plans = await prisma.plan.findMany()

    return NextResponse.json({
      users,
      plans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Admin get users error:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
  }
}
