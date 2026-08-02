import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateEndTime } from '@/lib/utils'
import { checkRateLimit } from '@/lib/rate-limit'
import { normalizeContactKey, getOrCreateConversation } from '@/lib/whatsapp-conversation'

function getDefaultConfirmation(): string {
  return `Seu agendamento foi recebido!\n\n📅 Data: {date}\n🕐 Horário: {time}\n💅 Serviço: {service}\n💰 Valor: R$ {price}\n\nEm breve receberá a confirmação!`
}

function getConfirmationTemplate(reminderTemplates?: string | null): string {
  if (!reminderTemplates) return getDefaultConfirmation()
  try {
    const parsed = JSON.parse(reminderTemplates)
    if (parsed.confirmation && Array.isArray(parsed.confirmation) && parsed.confirmation.length > 0) {
      return parsed.confirmation[Math.floor(Math.random() * parsed.confirmation.length)]
    }
  } catch {}
  return getDefaultConfirmation()
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { success } = await checkRateLimit(req, 10, 3600)
    if (!success) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde 1 hora.' },
        { status: 429 }
      )
    }

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

    const userTemplates = getConfirmationTemplate(user.reminderTemplates)

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

    const targetDate = new Date(date + 'T00:00:00-03:00')
    const endTime = calculateEndTime(startTime, service.duration)

    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const conflict = await prisma.appointment.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
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
        date: targetDate,
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

    try {
      const session = await prisma.whatsAppSession.findUnique({
        where: { userId: user.id },
      })

      if (session?.status === 'CONNECTED' && session.instanceToken && appointment.client?.whatsapp) {
        const { sendTextMessage, formatPhoneForEvolution } = await import('@/lib/evolution-api')

        const clientPhone = formatPhoneForEvolution(appointment.client.whatsapp)

        const formattedDate = new Date(appointment.date).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })

        const template = getConfirmationTemplate(user.reminderTemplates)
        const clientMsg = template
          .replace('{date}', formattedDate)
          .replace('{time}', appointment.startTime)
          .replace('{service}', appointment.service.name)
          .replace('{studio}', user.studioName)
          .replace('{price}', String(appointment.service.price))

        await sendTextMessage(session.instanceToken, clientPhone, clientMsg)

        const conversation = await getOrCreateConversation(session.id, normalizeContactKey(clientPhone), {
          lastMessage: clientMsg,
          lastInteraction: new Date(),
        })

        await prisma.whatsAppMessage.create({
          data: {
            sessionId: session.id,
            from: session.phoneNumber || '',
            to: clientPhone,
            content: clientMsg,
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
      console.error('Auto WhatsApp notification error:', err)
    }

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
