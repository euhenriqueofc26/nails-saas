import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
      include: {
        client: true,
        service: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json({ error: 'Erro ao buscar agendamento' }, { status: 500 })
  }
}

export async function PUT(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { clientId, serviceId, date, startTime, notes, status, price } = body

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
      include: { service: true }
    })

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    let endTime = existingAppointment.endTime
    let finalPrice = price || existingAppointment.price

    if (serviceId && serviceId !== existingAppointment.serviceId) {
      const service = await prisma.service.findFirst({
        where: { id: serviceId, userId: req.user!.userId }
      })
      if (service) {
        const { calculateEndTime } = await import('@/lib/utils')
        endTime = calculateEndTime(startTime || existingAppointment.startTime, service.duration)
        finalPrice = service.price
      }
    } else if (startTime && startTime !== existingAppointment.startTime) {
      const { calculateEndTime } = await import('@/lib/utils')
      endTime = calculateEndTime(startTime, existingAppointment.service.duration)
    }

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        clientId: clientId || existingAppointment.clientId,
        serviceId: serviceId || existingAppointment.serviceId,
        date: date ? new Date(date) : existingAppointment.date,
        startTime: startTime || existingAppointment.startTime,
        endTime,
        price: finalPrice,
        status: status || existingAppointment.status,
        notes: notes !== undefined ? notes : existingAppointment.notes,
      },
      include: {
        client: true,
        service: true,
      },
    })

    // O faturamento agora é calculado dinamicamente na API do dashboard
    // Não precisa mais salvar na tabela revenue

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Update appointment error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 })
  }
}

export async function DELETE(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
    })

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    await prisma.appointment.update({
      where: { id: params.id },
      data: { status: 'cancelled' },
    })

    return NextResponse.json({ message: 'Agendamento cancelado com sucesso' })
  } catch (error) {
    console.error('Cancel appointment error:', error)
    return NextResponse.json({ error: 'Erro ao cancelar agendamento' }, { status: 500 })
  }
}
