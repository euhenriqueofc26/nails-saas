import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const clientToken = searchParams.get('token')

    if (!clientId || !clientToken) {
      return NextResponse.json(
        { error: 'Cliente não autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { slug: params.slug },
    })

    if (!user) {
      return NextResponse.json({ error: 'Studio não encontrado' }, { status: 404 })
    }

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: user.id,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: clientId,
        userId: user.id,
      },
      include: {
        service: true,
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' },
      ],
    })

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        whatsapp: client.whatsapp,
      },
      appointments,
    })
  } catch (error) {
    console.error('Get client appointments error:', error)
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 })
  }
}
