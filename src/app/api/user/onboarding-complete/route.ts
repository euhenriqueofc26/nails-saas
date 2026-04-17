import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { onboardingCompleted: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete onboarding error:', error)
    return NextResponse.json({ error: 'Erro ao completar onboarding' }, { status: 500 })
  }
}