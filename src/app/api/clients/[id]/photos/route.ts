import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function POST(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL da foto é obrigatória' }, { status: 400 })
    }

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const photo = await prisma.clientPhoto.create({
      data: {
        clientId: params.id,
        url,
      },
    })

    return NextResponse.json({ photo })
  } catch (error) {
    console.error('Upload photo error:', error)
    return NextResponse.json({ error: 'Erro ao fazer upload da foto' }, { status: 500 })
  }
}

export async function DELETE(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const photoId = searchParams.get('photoId')

    if (!photoId) {
      return NextResponse.json({ error: 'ID da foto é obrigatório' }, { status: 400 })
    }

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
      include: {
        photos: {
          where: { id: photoId }
        }
      }
    })

    if (!client || client.photos.length === 0) {
      return NextResponse.json({ error: 'Foto não encontrada' }, { status: 404 })
    }

    await prisma.clientPhoto.delete({
      where: { id: photoId },
    })

    return NextResponse.json({ message: 'Foto deletada com sucesso' })
  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json({ error: 'Erro ao deletar foto' }, { status: 500 })
  }
}
