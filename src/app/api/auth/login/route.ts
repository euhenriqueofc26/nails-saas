import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logEvent } from '@/lib/audit'

const loginAttempts = new Map<string, { count: number; timestamp: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    const clientIP = req.headers.get('x-forwarded-for') || req.ip || 'unknown'
    const attemptKey = `login:${email}:${clientIP}`
    
    const now = Date.now()
    const attempt = loginAttempts.get(attemptKey)
    
    if (attempt && attempt.count >= MAX_ATTEMPTS && now - attempt.timestamp < LOCKOUT_TIME) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
        { status: 429 }
      )
    }
    
    if (attempt && now - attempt.timestamp >= LOCKOUT_TIME) {
      loginAttempts.delete(attemptKey)
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      const currentAttempt = loginAttempts.get(attemptKey) || { count: 0, timestamp: now }
      currentAttempt.count++
      currentAttempt.timestamp = now
      loginAttempts.set(attemptKey, currentAttempt)
      
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    loginAttempts.delete(attemptKey)

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
