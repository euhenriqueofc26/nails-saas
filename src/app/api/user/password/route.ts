import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import { hashPassword, verifyPassword } from '@/lib/auth'

export async function PUT(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Senha atual e nova senha são obrigatórias' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Nova senha deve ter no mínimo 6 caracteres' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { password: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const isValid = await verifyPassword(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 401 })
    }

    const hashed = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { password: hashed },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json({ error: 'Erro ao alterar senha' }, { status: 500 })
  }
}
