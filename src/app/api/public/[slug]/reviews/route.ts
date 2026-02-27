import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json()
    const { appointmentId, rating, review } = body

    if (!appointmentId || !rating) {
      return NextResponse.json(
        { error: 'ID do agendamento e avaliação são obrigatórios' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { slug: params.slug },
    })

    if (!user) {
      return NextResponse.json({ error: 'Estúdio não encontrado' }, { status: 404 })
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        userId: user.id,
        status: 'completed',
      },
      include: {
        client: true,
        service: true,
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado ou ainda não concluído' },
        { status: 404 }
      )
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        rating,
        review,
        reviewedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Avaliação enviada com sucesso!',
      appointment: updatedAppointment,
    })
  } catch (error) {
    console.error('Review error:', error)
    return NextResponse.json({ error: 'Erro ao enviar avaliação' }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const user = await prisma.user.findUnique({
      where: { slug: params.slug },
    })

    if (!user) {
      return NextResponse.json({ error: 'Estúdio não encontrado' }, { status: 404 })
    }

    const where = {
      userId: user.id,
      rating: { not: null },
      status: 'completed',
    }

    const [reviews, total, avgRating] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          client: {
            select: { name: true },
          },
          service: {
            select: { name: true },
          },
        },
        orderBy: { reviewedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.appointment.count({ where }),
      prisma.appointment.aggregate({
        where,
        _avg: { rating: true },
      }),
    ])

    return NextResponse.json({
      reviews,
      total,
      avgRating: avgRating._avg.rating || 0,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({ error: 'Erro ao buscar avaliações' }, { status: 500 })
  }
}
