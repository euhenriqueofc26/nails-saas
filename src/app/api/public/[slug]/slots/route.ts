import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTimeSlots } from '@/lib/utils'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 })
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

    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const [appointments, blockedTimes] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          userId: user.id,
          date: { gte: targetDate, lte: endOfDay },
          status: { notIn: ['cancelled'] },
        },
        select: {
          startTime: true,
          endTime: true,
        },
      }),
      prisma.blockedTime.findMany({
        where: {
          userId: user.id,
          date: { gte: targetDate, lte: endOfDay },
        },
        select: {
          startTime: true,
          endTime: true,
        },
      }),
    ])

    const allSlots = generateTimeSlots(8, 20, 30)

    const unavailableSlots = new Set<string>()

    appointments.forEach(apt => {
      for (let i = 0; i < allSlots.length; i++) {
        if (allSlots[i] >= apt.startTime && allSlots[i] < apt.endTime) {
          unavailableSlots.add(allSlots[i])
        }
      }
    })

    blockedTimes.forEach(bt => {
      for (let i = 0; i < allSlots.length; i++) {
        if (allSlots[i] >= bt.startTime && allSlots[i] < bt.endTime) {
          unavailableSlots.add(allSlots[i])
        }
      }
    })

    const availableSlots = allSlots.filter(slot => !unavailableSlots.has(slot))

    return NextResponse.json({ availableSlots })
  } catch (error) {
    console.error('Get available slots error:', error)
    return NextResponse.json({ error: 'Erro ao buscar horários' }, { status: 500 })
  }
}
