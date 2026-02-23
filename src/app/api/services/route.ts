import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const services = await prisma.service.findMany({
      where: {
        userId: req.user!.userId,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 })
  }
}

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { name, price, duration, description } = body

    if (!name || !price) {
      return NextResponse.json(
        { error: 'Nome e preço são obrigatórios' },
        { status: 400 }
      )
    }

    const userServicesCount = await prisma.service.count({
      where: { userId: req.user!.userId }
    })

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { plan: true }
    })

    if (userServicesCount >= user!.plan.maxServices && user!.plan.slug !== 'premium') {
      return NextResponse.json(
        { error: `Limite de serviços do plano atingido. Plano atual: ${user!.plan.name}` },
        { status: 403 }
      )
    }

    const service = await prisma.service.create({
      data: {
        userId: req.user!.userId,
        name,
        price,
        duration: duration || 60,
        description,
      },
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 })
  }
}
