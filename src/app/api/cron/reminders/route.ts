import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTextMessage, formatPhoneForEvolution, generateDelay, generateMessageVariations } from '@/lib/evolution-api'

const REMINDER_TEMPLATES = [
  `Passando para lembrar do seu horário amanhã!\n\n📅 Data: {date}\n🕐 Horário: {time}\n💅 Serviço: {service}\n\nConfirma sua presença?`,
  `Tudo bem? É da {studio}!\n\nSeu agendamento está marcado para amanhã:\n📅 {date}\n🕐 {time}\n💅 {service}\n\nEstamos te esperando!`,
  `Lembrete de agendamento!\n\n{studio} te espera amanhã:\n📅 {date}\n🕐 {time}\n💅 {service}\n\nQualquer dúvida, estamos por aqui.`,
]

const DAY_REMINDER_TEMPLATES = [
  `Seu horário é hoje!\n\n📅 Data: {date}\n🕐 Horário: {time}\n💅 Serviço: {service}\n\nNos vemos em breve!`,
  `Lembrando que seu agendamento é hoje!\n\n{studio} te espera às {time} para {service}.\n\nAté já!`,
  `Hoje é o dia!\n\n📅 {date}\n🕐 {time}\n💅 {service}\n\nTe aguardamos na {studio}!`,
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildMessage(
  template: string,
  data: { date: string; time: string; service: string; studio: string }
): string {
  return template
    .replace('{date}', data.date)
    .replace('{time}', data.time)
    .replace('{service}', data.service)
    .replace('{studio}', data.studio)
}

export async function GET() {
  try {
    const now = new Date()
    const brazilDateStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    const todayStart = new Date(brazilDateStr + 'T00:00:00.000Z')
    const todayEnd = new Date(todayStart)
    todayEnd.setUTCHours(23, 59, 59, 999)

    const tomorrowStart = new Date(todayStart)
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1)
    const tomorrowEnd = new Date(tomorrowStart)
    tomorrowEnd.setUTCHours(23, 59, 59, 999)

    const results: Record<string, unknown>[] = []

    const appointmentsForReminder = await prisma.appointment.findMany({
      where: {
        date: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
        status: { in: ['pending', 'confirmed'] },
        reminderSent: false,
      },
      include: {
        client: true,
        service: true,
        user: {
          select: {
            id: true,
            studioName: true,
          },
        },
      },
    })

    for (const apt of appointmentsForReminder) {
      if (!apt.client.whatsapp) {
        results.push({ client: apt.client.name, status: 'skipped', reason: 'no whatsapp' })
        continue
      }

      const session = await prisma.whatsAppSession.findUnique({
        where: { userId: apt.user.id },
      })

      if (!session || session.status !== 'CONNECTED') {
        results.push({ client: apt.client.name, status: 'skipped', reason: 'whatsapp not connected' })
        continue
      }

      try {
        const formattedDate = new Date(apt.date).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })

        const template = pickRandom(REMINDER_TEMPLATES)
        const message = buildMessage(template, {
          date: formattedDate,
          time: apt.startTime,
          service: apt.service.name,
          studio: apt.user.studioName,
        })

        const delay = generateDelay()
        const phone = formatPhoneForEvolution(apt.client.whatsapp)

        await sendTextMessage(session.instanceName, phone, message, delay)

        await prisma.whatsAppMessage.create({
          data: {
            sessionId: session.id,
            from: session.phoneNumber || '',
            to: phone,
            content: message,
            direction: 'OUTBOUND',
            status: 'SENT',
            appointmentId: apt.id,
          },
        })

        await prisma.appointment.update({
          where: { id: apt.id },
          data: { reminderSent: true, reminderSentAt: new Date() },
        })

        results.push({ client: apt.client.name, status: 'sent', type: 'next-day' })
      } catch (err) {
        console.error(`Erro ao enviar lembrete para ${apt.client.name}:`, err)
        results.push({ client: apt.client.name, status: 'error', error: String(err) })
      }
    }

    const hour = now.getHours()

    const todayAppointments = await prisma.appointment.findMany({
      where: {
        date: { gte: todayStart, lte: todayEnd },
        status: { in: ['pending', 'confirmed'] },
      },
      include: {
        client: true,
        service: true,
        user: {
          select: {
            id: true,
            studioName: true,
          },
        },
      },
    })

    for (const apt of todayAppointments) {
      const aptHour = parseInt(apt.startTime.split(':')[0])
      const aptMinute = parseInt(apt.startTime.split(':')[1])
      const appointmentTime = aptHour + aptMinute / 60
      const currentTime = hour + now.getMinutes() / 60
      const timeDiff = appointmentTime - currentTime

      if (timeDiff <= 0 || timeDiff > 1.5 || apt.reminderSent) continue
      if (!apt.client.whatsapp) continue

      const session = await prisma.whatsAppSession.findUnique({
        where: { userId: apt.user.id },
      })

      if (!session || session.status !== 'CONNECTED') continue

      try {
        const formattedDate = new Date(apt.date).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })

        const template = pickRandom(DAY_REMINDER_TEMPLATES)
        const message = buildMessage(template, {
          date: formattedDate,
          time: apt.startTime,
          service: apt.service.name,
          studio: apt.user.studioName,
        })

        const delay = generateDelay()
        const phone = formatPhoneForEvolution(apt.client.whatsapp)

        await sendTextMessage(session.instanceName, phone, message, delay)

        await prisma.whatsAppMessage.create({
          data: {
            sessionId: session.id,
            from: session.phoneNumber || '',
            to: phone,
            content: message,
            direction: 'OUTBOUND',
            status: 'SENT',
            appointmentId: apt.id,
          },
        })

        await prisma.appointment.update({
          where: { id: apt.id },
          data: { reminderSent: true, reminderSentAt: new Date() },
        })

        results.push({ client: apt.client.name, status: 'sent', type: 'same-day' })
      } catch (err) {
        console.error(`Erro ao enviar lembrete para ${apt.client.name}:`, err)
        results.push({ client: apt.client.name, status: 'error', error: String(err) })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processados ${results.length} lembretes`,
      results,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Erro ao processar lembretes:', error)
    return NextResponse.json(
      { error: 'Erro ao processar lembretes' },
      { status: 500 }
    )
  }
}
