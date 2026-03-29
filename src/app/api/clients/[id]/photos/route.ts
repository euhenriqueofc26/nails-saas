import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import cloudinary from '@/lib/cloudinary'

export async function GET(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const photos = await prisma.clientPhoto.findMany({
      where: { clientId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Get photos error:', error)
    return NextResponse.json({ error: 'Erro ao buscar fotos' }, { status: 500 })
  }
}

export async function POST(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `clubnails/${req.user!.userId}/${params.id}`,
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    })

    const photo = await prisma.clientPhoto.create({
      data: {
        clientId: params.id,
        url: result.secure_url,
      },
    })

    return NextResponse.json({ photo }, { status: 201 })
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

    const photo = await prisma.clientPhoto.findUnique({
      where: { id: photoId },
      include: { client: true },
    })

    if (!photo || photo.client.userId !== req.user!.userId || photo.clientId !== params.id) {
      return NextResponse.json({ error: 'Foto não encontrada' }, { status: 404 })
    }

    const publicId = photo.url.split('/').slice(-4).join('/').split('.')[0]
    await cloudinary.uploader.destroy(publicId)

    await prisma.clientPhoto.delete({
      where: { id: photoId },
    })

    return NextResponse.json({ message: 'Foto deletada com sucesso' })
  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json({ error: 'Erro ao deletar foto' }, { status: 500 })
  }
}
