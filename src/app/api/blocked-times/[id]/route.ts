import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function DELETE(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const existing = await prisma.blockedTime.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Horário bloqueado não encontrado' }, { status: 404 })
    }

    await prisma.blockedTime.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Horário desbloqueado com sucesso' })
  } catch (error) {
    console.error('Delete blocked time error:', error)
    return NextResponse.json({ error: 'Erro ao desbloquear horário' }, { status: 500 })
  }
}