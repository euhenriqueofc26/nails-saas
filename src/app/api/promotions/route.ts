import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const promotions = await prisma.promotion.findMany({
      where: {
        userId: req.user!.userId,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ promotions })
  } catch (error) {
    console.error('Get promotions error:', error)
    return NextResponse.json({ error: 'Erro ao buscar promoções' }, { status: 500 })
  }
}

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { title, message, discount } = body

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Título e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    const promotion = await prisma.promotion.create({
      data: {
        userId: req.user!.userId,
        title,
        message,
        discount: discount || null,
      },
    })

    return NextResponse.json({ promotion })
  } catch (error) {
    console.error('Create promotion error:', error)
    return NextResponse.json({ error: 'Erro ao criar promoção' }, { status: 500 })
  }
}
