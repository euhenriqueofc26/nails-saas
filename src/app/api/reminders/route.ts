import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string }
    const userId = decoded.userId

    const now = new Date()
    
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const startOfTomorrow = new Date(tomorrow)
    startOfTomorrow.setHours(0, 0, 0, 0)
    const endOfTomorrow = new Date(tomorrow)
    endOfTomorrow.setHours(23, 59, 59, 999)

    const appointmentsForReminder = await prisma.appointment.findMany({
      where: {
        userId: userId,
        date: {
          gte: startOfTomorrow,
          lte: endOfTomorrow,
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

    const reminders = []

    for (const apt of appointmentsForReminder) {
      const clientWhatsapp = apt.client.whatsapp.replace(/\D/g, '')
      const formattedDate = new Date(apt.date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })

      const message = `Olá ${apt.client.name}! 👋\n\nAqui é da ${apt.user.studioName}!\n\nLembrando que você tem um agendamento amanhã:\n\n📅 Data: ${formattedDate}\n🕐 Horário: ${apt.startTime}\n💅 Serviço: ${apt.service.name}\n\nEstamos te esperando! 😊`

      const whatsappUrl = `https://wa.me/55${clientWhatsapp}?text=${encodeURIComponent(message)}`

      reminders.push({
        id: apt.id,
        client: apt.client.name,
        whatsapp: clientWhatsapp,
        date: apt.date,
        startTime: apt.startTime,
        service: apt.service.name,
        reminderSent: apt.reminderSent,
        whatsappUrl: whatsappUrl,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Encontrados ${reminders.length} agendamentos para amanhã`,
      reminders: reminders,
      count: reminders.length,
    })
  } catch (error) {
    console.error('Erro ao processar lembretes:', error)
    return NextResponse.json(
      { error: 'Erro ao processar lembretes' },
      { status: 500 }
    )
  }
}
