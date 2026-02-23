import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const profile = await prisma.publicProfile.findUnique({
      where: { userId: req.user!.userId },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 })
  }
}

export async function PUT(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { plan: true }
    })

    if (!user!.plan.hasPublicPage) {
      return NextResponse.json(
        { error: 'Página pública disponível apenas nos planos Pro e Premium' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { bio, coverImage, address, instagram, facebook, workingHours, isActive } = body

    const profile = await prisma.publicProfile.upsert({
      where: { userId: req.user!.userId },
      create: {
        userId: req.user!.userId,
        bio,
        coverImage,
        address,
        instagram,
        facebook,
        workingHours,
        isActive,
      },
      update: {
        bio,
        coverImage,
        address,
        instagram,
        facebook,
        workingHours,
        isActive,
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
  }
}
