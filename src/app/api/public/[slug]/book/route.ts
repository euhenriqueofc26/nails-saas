import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateEndTime } from '@/lib/utils'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json()
    const { clientName, clientWhatsapp, serviceId, date, startTime, notes } = body

    if (!clientName || !clientWhatsapp || !serviceId || !date || !startTime) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { slug: params.slug },
      include: { plan: true, publicProfile: true },
    })

    if (!user || !user.plan.hasPublicPage) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    if (!user.publicProfile?.isActive) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId: user.id,
        isActive: true,
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    let client = await prisma.client.findFirst({
      where: {
        userId: user.id,
        whatsapp: clientWhatsapp,
      },
    })

    if (!client) {
      client = await prisma.client.create({
        data: {
          userId: user.id,
          name: clientName,
          whatsapp: clientWhatsapp,
        },
      })
    }

    const targetDate = new Date(date)
    const endTime = calculateEndTime(startTime, service.duration)

    const conflict = await prisma.appointment.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lte: new Date(targetDate.setHours(23, 59, 59, 999)),
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
        status: { notIn: ['cancelled'] },
      },
    })

    if (conflict) {
      return NextResponse.json(
        { error: 'Horário indisponível' },
        { status: 409 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        clientId: client.id,
        serviceId: service.id,
        date: new Date(date),
        startTime,
        endTime,
        price: service.price,
        status: 'pending',
        notes,
      },
      include: {
        service: true,
        client: true,
      },
    })

    return NextResponse.json({
      message: 'Agendamento realizado com sucesso!',
      appointment: {
        id: appointment.id,
        date: appointment.date,
        startTime: appointment.startTime,
        service: appointment.service.name,
        price: appointment.service.price,
      },
      whatsapp: user.whatsapp,
    })
  } catch (error) {
    console.error('Public booking error:', error)
    return NextResponse.json({ error: 'Erro ao realizar agendamento' }, { status: 500 })
  }
}
