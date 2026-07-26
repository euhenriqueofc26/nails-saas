import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function POST(req: AuthRequest) {
  try {
    const authError = await authMiddleware(req)
    if (authError) return authError

    const { aiEnabled } = await req.json()

    if (aiEnabled) {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: { plan: { select: { slug: true } } },
      })

      if (user?.plan?.slug !== 'premium') {
        return NextResponse.json(
          { error: 'A IA automática está disponível apenas no plano Premium' },
          { status: 403 }
        )
      }
    }

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { aiEnabled } as any,
    })

    return NextResponse.json({ success: true, aiEnabled })
  } catch (error) {
    console.error('AI toggle error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
