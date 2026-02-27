import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function DELETE(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const existingPromotion = await prisma.promotion.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
    })

    if (!existingPromotion) {
      return NextResponse.json({ error: 'Promoção não encontrada' }, { status: 404 })
    }

    await prisma.promotion.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Promoção deletada com sucesso' })
  } catch (error) {
    console.error('Delete promotion error:', error)
    return NextResponse.json({ error: 'Erro ao deletar promoção' }, { status: 500 })
  }
}
