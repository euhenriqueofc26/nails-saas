import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTextMessage, formatPhoneForEvolution } from '@/lib/evolution-api'
import { normalizeContactKey, getOrCreateConversation } from '@/lib/whatsapp-conversation'

const DEFAULT_TEMPLATES = {
  nextDay: [
    `Passando para lembrar do seu horário amanhã!\n\n📅 Data: {date}\n🕐 Horário: {time}\n💅 Serviço: {service}\n\nConfirma sua presença?`,
    `Tudo bem? É da {studio}!\n\nSeu agendamento está marcado para amanhã:\n📅 {date}\n🕐 {time}\n💅 {service}\n\nEstamos te esperando!`,
    `Lembrete de agendamento!\n\n{studio} te espera amanhã:\n📅 {date}\n🕐 {time}\n💅 {service}\n\nQualquer dúvida, estamos por aqui.`,
  ],
  sameDay: [
    `Seu horário é hoje!\n\n📅 Data: {date}\n🕐 Horário: {time}\n💅 Serviço: {service}\n\nNos vemos em breve!`,
    `Lembrando que seu agendamento é hoje!\n\n{studio} te espera às {time} para {service}.\n\nAté já!`,
    `Hoje é o dia!\n\n📅 {date}\n🕐 {time}\n💅 {service}\n\nTe aguardamos na {studio}!`,
  ],
  confirmation: [
    `Agendamento confirmado!\n\n📅 Data: {date}\n🕐 Horário: {time}\n💅 Serviço: {service}\n\nTe aguardamos na {studio}!`,
  ],
}

const MAX_REMINDER_WINDOW_DAYS = 30

function getUserTemplates(user: { reminderTemplates?: string | null }): {
  nextDay: string[];
  sameDay: string[];
  confirmation: string[];
} {
  if (!user.reminderTemplates) return DEFAULT_TEMPLATES
  try {
    return { ...DEFAULT_TEMPLATES, ...JSON.parse(user.reminderTemplates) }
  } catch {
    return DEFAULT_TEMPLATES
  }
}

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

function brazilDayStr(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

function daysDiffInBrazil(aptDate: Date, now: Date): number {
  const aptDay = brazilDayStr(aptDate)
  const todayDay = brazilDayStr(now)
  return Math.round(
    (Date.parse(aptDay + 'T00:00:00.000Z') - Date.parse(todayDay + 'T00:00:00.000Z')) / 86_400_000
  )
}

function brazilHourFloat(now: Date): number {
  const h = parseInt(
    now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', hour: 'numeric', hour12: false })
  )
  const m = parseInt(
    now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', minute: 'numeric', hour12: false })
  )
  return h + m / 60
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const todayStart = new Date(brazilDayStr(now) + 'T03:00:00.000Z')
    const windowEnd = new Date(todayStart)
    windowEnd.setUTCDate(windowEnd.getUTCDate() + MAX_REMINDER_WINDOW_DAYS)

    const appointments = await prisma.appointment.findMany({
      where: {
        date: { gte: todayStart, lte: windowEnd },
        status: { in: ['pending', 'confirmed'] },
        reminderSent: false,
      },
      include: {
        client: true,
        service: true,
        user: {
          select: { id: true, studioName: true, reminderTemplates: true, reminderDaysBefore: true },
        },
      },
    })

    const currentTime = brazilHourFloat(now)
    const results: Record<string, unknown>[] = []

    for (const apt of appointments) {
      const daysDiff = daysDiffInBrazil(new Date(apt.date), now)
      const reminderDays = apt.user.reminderDaysBefore ?? 1

      let type: 'same-day' | 'next-day' | null = null
      if (daysDiff === 0) type = 'same-day'
      else if (daysDiff === reminderDays) type = 'next-day'
      if (!type) continue

      if (type === 'same-day') {
        const [h, m] = apt.startTime.split(':').map(Number)
        const appointmentTime = h + m / 60
        if (appointmentTime <= currentTime) continue
      }

      if (!apt.client.whatsapp) {
        results.push({ client: apt.client.name, status: 'skipped', reason: 'no whatsapp', type })
        continue
      }

      const session = await prisma.whatsAppSession.findUnique({
        where: { userId: apt.user.id },
      })

      if (!session || session.status !== 'CONNECTED') {
        results.push({ client: apt.client.name, status: 'skipped', reason: 'whatsapp not connected', type })
        continue
      }

      if (!session.instanceToken) {
        results.push({ client: apt.client.name, status: 'skipped', reason: 'no instance token', type })
        continue
      }

      try {
        const formattedDate = new Date(apt.date).toLocaleDateString('pt-BR', {
          weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo',
        })

        const templates = getUserTemplates(apt.user)
        const template = pickRandom(type === 'same-day' ? templates.sameDay : templates.nextDay)
        const message = buildMessage(template, {
          date: formattedDate,
          time: apt.startTime,
          service: apt.service.name,
          studio: apt.user.studioName,
        })

        const phone = formatPhoneForEvolution(apt.client.whatsapp)
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
            appointmentId: apt.id,
            conversationId: conversation.id,
          },
        })

        await prisma.appointment.update({
          where: { id: apt.id },
          data: { reminderSent: true, reminderSentAt: new Date() },
        })

        results.push({ client: apt.client.name, status: 'sent', type })
      } catch (err) {
        console.error(`Erro ao enviar lembrete para ${apt.client.name}:`, err)
        results.push({ client: apt.client.name, status: 'error', error: String(err), type })
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
    return NextResponse.json({ error: 'Erro ao processar lembretes' }, { status: 500 })
  }
}
