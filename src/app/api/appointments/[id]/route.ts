import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import { normalizeContactKey, getOrCreateConversation } from '@/lib/whatsapp-conversation'

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
        date: date ? new Date(date + 'T00:00:00-03:00') : existingAppointment.date,
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

    if (status === 'confirmed' && !existingAppointment.confirmationSent && appointment.client?.whatsapp) {
      try {
        const session = await prisma.whatsAppSession.findUnique({
          where: { userId: req.user!.userId },
        })

        if (session?.status === 'CONNECTED' && session.instanceToken) {
          const userWithTemplates = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: { reminderTemplates: true, studioName: true },
          })

          const formattedDate = new Date(appointment.date).toLocaleDateString('pt-BR')

          let template = `Olá {nome}! Seu agendamento de {service} no dia {date} às {time} foi confirmado!`
          if (userWithTemplates?.reminderTemplates) {
            try {
              const parsed = JSON.parse(userWithTemplates.reminderTemplates)
              if (parsed.confirmation && Array.isArray(parsed.confirmation) && parsed.confirmation.length > 0) {
                template = parsed.confirmation[Math.floor(Math.random() * parsed.confirmation.length)]
              }
            } catch {}
          }

          const message = template
            .replace('{nome}', appointment.client.name)
            .replace('{name}', appointment.client.name)
            .replace('{date}', formattedDate)
            .replace('{time}', appointment.startTime)
            .replace('{service}', appointment.service.name)
            .replace('{studio}', userWithTemplates?.studioName || '')
            .replace('{price}', String(appointment.price))

          const { sendTextMessage, formatPhoneForEvolution } = await import('@/lib/evolution-api')

          const phone = formatPhoneForEvolution(appointment.client.whatsapp)

          await sendTextMessage(session.instanceToken, phone, message)

          const conversation = await getOrCreateConversation(session.id, normalizeContactKey(phone), {
            lastMessage: message,
            lastInteraction: new Date(),
          })

          await prisma.whatsAppMessage.create({
            data: {
              sessionId: session.id,
              from: session.phoneNumber || '',
              to: phone,
              content: message,
              direction: 'OUTBOUND',
              status: 'SENT',
              appointmentId: appointment.id,
              conversationId: conversation.id,
            },
          })

          await prisma.appointment.update({
            where: { id: appointment.id },
            data: { confirmationSent: true, confirmationSentAt: new Date() },
          })
        }
      } catch (err) {
        console.error('Auto WhatsApp confirm error:', err)
      }
    }

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
