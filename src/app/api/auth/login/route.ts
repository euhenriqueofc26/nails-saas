import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { logEvent } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const { success } = await checkRateLimit(req, 10, 900)
    if (!success) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      planId: user.planId,
      role: user.role,
    })

    // Audit login success
    logEvent('login_success', { userId: user.id, email: user.email, studioName: user.studioName })
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        studioName: user.studioName,
        slug: user.slug,
        planId: user.planId,
        role: user.role,
        isBlocked: user.isBlocked,
        avatar: user.avatar,
        aiEnabled: user.aiEnabled,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
