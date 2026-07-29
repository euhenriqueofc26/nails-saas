import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import cloudinary from '@/lib/cloudinary'

export async function DELETE(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const image = await prisma.galleryImage.findUnique({
      where: { id: params.id },
    })

    if (!image || image.userId !== req.user!.userId) {
      return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 })
    }

    const publicIdMatch = image.url.match(/\/v\d+\/(.+)\.\w+$/)
    if (publicIdMatch) {
      await cloudinary.uploader.destroy(publicIdMatch[1]).catch(() => {})
    }

    await prisma.galleryImage.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Gallery delete error:', error)
    return NextResponse.json({ error: 'Erro ao excluir imagem' }, { status: 500 })
  }
}
