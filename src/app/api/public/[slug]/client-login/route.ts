import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json()
    const { whatsapp } = body

    if (!whatsapp) {
      return NextResponse.json(
        { error: 'WhatsApp é obrigatório' },
        { status: 400 }
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
        userId: user.id,
        whatsapp: whatsapp,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado. Agende primeiro!' },
        { status: 404 }
      )
    }

    const token = crypto.randomBytes(32).toString('hex')

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        whatsapp: client.whatsapp,
      },
      token,
    })
  } catch (error) {
    console.error('Client login error:', error)
    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 })
  }
}
