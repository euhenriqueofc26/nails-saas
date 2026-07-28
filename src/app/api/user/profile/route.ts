import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function PUT(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { name, studioName, whatsapp } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        name: name.trim(),
        studioName: studioName?.trim() || '',
        whatsapp: whatsapp?.replace(/\D/g, '') || '',
      },
      select: {
        id: true,
        name: true,
        email: true,
        studioName: true,
        whatsapp: true,
        slug: true,
        planId: true,
        role: true,
        avatar: true,
        isBlocked: true,
        aiEnabled: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
  }
}
