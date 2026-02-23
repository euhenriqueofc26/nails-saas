import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import { calculateEndTime } from '@/lib/utils'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const status = searchParams.get('status')

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

    if (status) {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: true,
        service: true,
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 })
  }
}

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { clientId, serviceId, date, startTime, notes, status } = body

    if (!clientId || !serviceId || !date || !startTime) {
      return NextResponse.json(
        { error: 'Cliente, serviço, data e horário são obrigatórios' },
        { status: 400 }
      )
    }

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: req.user!.userId,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId: req.user!.userId,
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    const appointmentDate = new Date(date)
    const endTime = calculateEndTime(startTime, service.duration)

    const conflict = await prisma.appointment.findFirst({
      where: {
        userId: req.user!.userId,
        date: {
          gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
          lte: new Date(appointmentDate.setHours(23, 59, 59, 999)),
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
        status: { notIn: ['cancelled'] },
      },
    })

    if (conflict) {
      return NextResponse.json(
        { error: 'Horário conflita com outro agendamento' },
        { status: 409 }
      )
    }

    const blockedTime = await prisma.blockedTime.findFirst({
      where: {
        userId: req.user!.userId,
        date: {
          gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
          lte: new Date(appointmentDate.setHours(23, 59, 59, 999)),
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    })

    if (blockedTime) {
      return NextResponse.json(
        { error: 'Horário está bloqueado' },
        { status: 409 }
      )
    }

    const userAppointmentsCount = await prisma.appointment.count({
      where: { userId: req.user!.userId }
    })

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { plan: true }
    })

    if (userAppointmentsCount >= user!.plan.maxAppointments && user!.plan.slug !== 'premium') {
      return NextResponse.json(
        { error: `Limite de agendamentos do plano atingido. Plano atual: ${user!.plan.name}` },
        { status: 403 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: req.user!.userId,
        clientId,
        serviceId,
        date: new Date(date),
        startTime,
        endTime,
        price: service.price,
        status: status || 'pending',
        notes,
      },
      include: {
        client: true,
        service: true,
      },
    })

    await prisma.client.update({
      where: { id: clientId },
      data: { lastServiceDate: new Date() },
    })

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 })
  }
}
