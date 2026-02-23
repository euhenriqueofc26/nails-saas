import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''

    const clients = await prisma.client.findMany({
      where: {
        userId: req.user!.userId,
        OR: [
          { name: { contains: search } },
          { whatsapp: { contains: search } },
        ],
      },
      include: {
        photos: true,
        _count: {
          select: { appointments: true }
        }
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('Get clients error:', error)
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
  }
}

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { name, whatsapp, notes } = body

    if (!name || !whatsapp) {
      return NextResponse.json(
        { error: 'Nome e WhatsApp são obrigatórios' },
        { status: 400 }
      )
    }

    const userClientsCount = await prisma.client.count({
      where: { userId: req.user!.userId }
    })

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { plan: true }
    })

    if (userClientsCount >= user!.plan.maxClients && user!.plan.slug !== 'premium') {
      return NextResponse.json(
        { error: `Limite de clientes do plano atingido. Plano atual: ${user!.plan.name}` },
        { status: 403 }
      )
    }

    const client = await prisma.client.create({
      data: {
        userId: req.user!.userId,
        name,
        whatsapp,
        notes,
      },
      include: {
        photos: true,
      },
    })

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Create client error:', error)
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  }
}
