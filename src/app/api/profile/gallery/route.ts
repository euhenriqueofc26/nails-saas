import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import cloudinary from '@/lib/cloudinary'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const images = await prisma.galleryImage.findMany({
      where: { userId: req.user!.userId },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Gallery list error:', error)
    return NextResponse.json({ error: 'Erro ao listar galeria' }, { status: 500 })
  }
}

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { image } = body

    if (!image) {
      return NextResponse.json({ error: 'Imagem é obrigatória' }, { status: 400 })
    }

    const count = await prisma.galleryImage.count({
      where: { userId: req.user!.userId },
    })

    if (count >= 10) {
      return NextResponse.json({ error: 'Máximo de 10 imagens na galeria' }, { status: 400 })
    }

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: `clubnails/${req.user!.userId}/gallery`,
      width: 1200,
      height: 1200,
      crop: 'limit',
      quality: 'auto',
    })

    const galleryImage = await prisma.galleryImage.create({
      data: {
        userId: req.user!.userId,
        url: uploadResult.secure_url,
        order: count,
      },
    })

    return NextResponse.json({ image: galleryImage })
  } catch (error) {
    console.error('Gallery upload error:', error)
    return NextResponse.json({ error: 'Erro ao enviar imagem' }, { status: 500 })
  }
}
