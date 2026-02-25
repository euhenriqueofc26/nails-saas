import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import { toBrazilDate } from '@/lib/utils'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: any = {
      userId: req.user!.userId,
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1, 12, 0, 0, 0)
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999)
      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      }
    }

    if (type === 'revenue') {
      const revenues = await prisma.revenue.findMany({
        where,
        orderBy: { date: 'desc' },
      })
      return NextResponse.json({ revenues })
    }

    if (type === 'expense') {
      const expenses = await prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
      })
      return NextResponse.json({ expenses })
    }

    const [revenues, expenses] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          userId: req.user!.userId,
          status: 'completed',
          date: where.date,
        },
        select: {
          id: true,
          price: true,
          date: true,
          service: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.expense.findMany({ where: { ...where }, orderBy: { date: 'desc' } }),
    ])

    const formattedRevenues = revenues.map(r => ({
      id: r.id,
      amount: r.price,
      date: r.date,
      description: r.service?.name || 'Serviço',
    }))

    return NextResponse.json({ revenues: formattedRevenues, expenses })
  } catch (error) {
    console.error('Get financial error:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados financeiros' }, { status: 500 })
  }
}

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { plan: true }
    })

    if (!user!.plan.hasFinancial) {
      return NextResponse.json(
        { error: 'Módulo financeiro disponível apenas nos planos Pro e Premium' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { type, amount, description, category, date, appointmentId } = body

    if (!type || !amount || !date) {
      return NextResponse.json(
        { error: 'Tipo, valor e data são obrigatórios' },
        { status: 400 }
      )
    }

    if (type === 'revenue') {
      const revenue = await prisma.revenue.create({
        data: {
          userId: req.user!.userId,
          appointmentId,
          amount,
          description,
          date: toBrazilDate(date),
        },
      })
      return NextResponse.json({ revenue })
    }

    if (type === 'expense') {
      if (!description || !category) {
        return NextResponse.json(
          { error: 'Descrição e categoria são obrigatórios para despesas' },
          { status: 400 }
        )
      }

      const expense = await prisma.expense.create({
        data: {
          userId: req.user!.userId,
          amount,
          description,
          category,
          date: toBrazilDate(date),
        },
      })
      return NextResponse.json({ expense })
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  } catch (error) {
    console.error('Create financial error:', error)
    return NextResponse.json({ error: 'Erro ao criar registro financeiro' }, { status: 500 })
  }
}
