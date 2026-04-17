import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        services: { select: { id: true } },
        publicProfile: { select: { bio: true, coverImage: true, workingHours: true } },
      },
    })

    const hasServices = user?.services && user.services.length > 0
    const pageConfigured = !!(
      user?.publicProfile?.bio &&
      user?.publicProfile?.coverImage &&
      user?.publicProfile?.workingHours
    )

    const showOnboarding = !user?.onboardingCompleted && (!hasServices || !pageConfigured)

    return NextResponse.json({
      onboardingStep: user?.onboardingStep ?? 1,
      onboardingCompleted: user?.onboardingCompleted ?? false,
      hasAvatar: !!user?.avatar,
      hasServices,
      pageConfigured,
      showOnboarding,
    })
  } catch (error) {
    console.error('Get onboarding error:', error)
    return NextResponse.json({ error: 'Erro ao buscar onboarding' }, { status: 500 })
  }
}

export async function PUT(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { step } = body

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { onboardingStep: step },
    })

    return NextResponse.json({
      onboardingStep: user.onboardingStep,
    })
  } catch (error) {
    console.error('Update onboarding error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar onboarding' }, { status: 500 })
  }
}