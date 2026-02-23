import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')

    const where: any = {
      userId: req.user!.userId,
    }

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }

    const blockedTimes = await prisma.blockedTime.findMany({
      where,
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json({ blockedTimes })
  } catch (error) {
    console.error('Get blocked times error:', error)
    return NextResponse.json({ error: 'Erro ao buscar horários bloqueados' }, { status: 500 })
  }
}

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { date, startTime, endTime, reason } = body

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Data, horário de início e fim são obrigatórios' },
        { status: 400 }
      )
    }

    const blockedTime = await prisma.blockedTime.create({
      data: {
        userId: req.user!.userId,
        date: new Date(date),
        startTime,
        endTime,
        reason,
      },
    })

    return NextResponse.json({ blockedTime })
  } catch (error) {
    console.error('Create blocked time error:', error)
    return NextResponse.json({ error: 'Erro ao bloquear horário' }, { status: 500 })
  }
}

export async function DELETE(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const existing = await prisma.blockedTime.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Horário bloqueado não encontrado' }, { status: 404 })
    }

    await prisma.blockedTime.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Horário desbloqueado com sucesso' })
  } catch (error) {
    console.error('Delete blocked time error:', error)
    return NextResponse.json({ error: 'Erro ao desbloquear horário' }, { status: 500 })
  }
}
