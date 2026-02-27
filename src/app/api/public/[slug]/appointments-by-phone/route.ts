import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json(
        { error: 'Telefone é obrigatório' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { slug: params.slug },
    })

    if (!user) {
      return NextResponse.json({ error: 'Estúdio não encontrado' }, { status: 404 })
    }

    const cleanPhone = phone.replace(/\D/g, '')

    const client = await prisma.client.findFirst({
      where: {
        userId: user.id,
        whatsapp: { contains: cleanPhone },
      },
    })

    if (!client) {
      return NextResponse.json({ 
        error: 'Nenhum cliente encontrado com este WhatsApp' 
      }, { status: 404 })
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: client.id,
        userId: user.id,
        status: 'completed',
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
    console.error('Get appointments by phone error:', error)
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 })
  }
}
