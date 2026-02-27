import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function PUT(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { avatar } = body

    console.log('Avatar update - userId:', req.user!.userId, 'avatar:', avatar)

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { avatar },
    })

    console.log('User updated:', user.id, 'avatar:', user.avatar)

    return NextResponse.json({ 
      avatar: user.avatar,
      message: 'Avatar atualizado com sucesso'
    })
  } catch (error) {
    console.error('Update avatar error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar avatar' }, { status: 500 })
  }
}
