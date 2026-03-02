import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const startOfTomorrow = new Date(tomorrow)
    startOfTomorrow.setHours(0, 0, 0, 0)
    const endOfTomorrow = new Date(tomorrow)
    endOfTomorrow.setHours(23, 59, 59, 999)

    const appointmentsForReminder = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfTomorrow,
          lte: endOfTomorrow,
        },
        status: {
          in: ['pending', 'confirmed'],
        },
        reminderSent: false,
      },
      include: {
        client: true,
        service: true,
        user: {
          select: {
            studioName: true,
            whatsapp: true,
          }
        },
      },
    })

    const sentReminders = []

    for (const apt of appointmentsForReminder) {
      const clientWhatsapp = apt.client.whatsapp.replace(/\D/g, '')
      const formattedDate = new Date(apt.date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })

      const message = `Olá ${apt.client.name}! 👋\n\nAqui é da ${apt.user.studioName}!\n\nLembrando que você tem um agendamento amanhã:\n\n📅 Data: ${formattedDate}\n🕐 Horário: ${apt.startTime}\n💅 Serviço: ${apt.service.name}\n\nEstamos te esperando! 😊`

      try {
        const whatsappUrl = `https://wa.me/55${clientWhatsapp}?text=${encodeURIComponent(message)}`
        
        await prisma.appointment.update({
          where: { id: apt.id },
          data: {
            reminderSent: true,
            reminderSentAt: new Date(),
          },
        })

        sentReminders.push({
          client: apt.client.name,
          whatsapp: clientWhatsapp,
          date: apt.date,
          message: message,
          url: whatsappUrl,
          status: 'generated',
        })
      } catch (error) {
        console.error(`Erro ao processar lembrete para ${apt.client.name}:`, error)
        sentReminders.push({
          client: apt.client.name,
          status: 'error',
        })
      }
    }

    const hour = now.getHours()
    const oneHourLater = hour + 1

    const todayReminders = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['pending', 'confirmed'],
        },
      },
      include: {
        client: true,
        service: true,
        user: {
          select: {
            studioName: true,
          }
        },
      },
    })

    for (const apt of todayReminders) {
      const aptHour = parseInt(apt.startTime.split(':')[0])
      const aptMinute = parseInt(apt.startTime.split(':')[1])
      
      const appointmentTime = aptHour + aptMinute / 60
      const currentTime = hour + now.getMinutes() / 60
      
      const timeDiff = appointmentTime - currentTime
      
      if (timeDiff > 0 && timeDiff <= 1.5 && !apt.reminderSent) {
        const clientWhatsapp = apt.client.whatsapp.replace(/\D/g, '')
        const formattedDate = new Date(apt.date).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })

        const message = `Olá ${apt.client.name}! 👋\n\nAqui é da ${apt.user.studioName}!\n\nSeu agendamento é em breve:\n\n📅 Data: ${formattedDate}\n🕐 Horário: ${apt.startTime}\n💅 Serviço: ${apt.service.name}\n\nNos vemos em breve! 😊`

        try {
          await prisma.appointment.update({
            where: { id: apt.id },
            data: {
              reminderSent: true,
              reminderSentAt: new Date(),
            },
          })

          sentReminders.push({
            client: apt.client.name,
            whatsapp: clientWhatsapp,
            date: apt.date,
            message: message,
            type: 'same-day',
            status: 'generated',
          })
        } catch (error) {
          console.error(`Erro ao processar lembrete para ${apt.client.name}:`, error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processados ${sentReminders.length} lembretes`,
      reminders: sentReminders,
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
