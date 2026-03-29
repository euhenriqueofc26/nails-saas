import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const appointments = await prisma.appointment.findMany({
      where: { clientId: params.id },
      include: {
        service: {
          select: {
            name: true,
            price: true,
            duration: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Get client appointments error:', error)
    return NextResponse.json({ error: 'Erro ao buscar atendimentos' }, { status: 500 })
  }
}
