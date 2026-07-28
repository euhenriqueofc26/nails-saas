import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function DELETE(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { role: true },
    })

    if (user?.role === 'admin') {
      return NextResponse.json(
        { error: 'Administradores não podem excluir a conta pelo painel' },
        { status: 403 }
      )
    }

    const userId = req.user!.userId

    await prisma.referral.deleteMany({
      where: { OR: [{ referrerId: userId }, { referredUserId: userId }] },
    })

    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Erro ao excluir conta' }, { status: 500 })
  }
}
