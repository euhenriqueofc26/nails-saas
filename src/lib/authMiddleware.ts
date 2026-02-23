import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export interface AuthRequest extends NextRequest {
  user?: JWTPayload
}

export async function authMiddleware(req: AuthRequest) {
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const token = authHeader.replace('Bearer ', '')
  const payload = verifyToken(token)
  
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { isBlocked: true, trialEndsAt: true, subscriptionEndsAt: true }
  })

  if (user?.isBlocked) {
    return NextResponse.json({ error: 'Conta bloqueada. Entre em contato com o suporte.' }, { status: 403 })
  }

  const now = new Date()
  
  if (user?.trialEndsAt && new Date(user.trialEndsAt) < now && !user.subscriptionEndsAt) {
    return NextResponse.json({ 
      error: 'Trial expirado',
      code: 'TRIAL_EXPIRED',
      redirectUrl: '/dashboard/plans'
    }, { status: 403 })
  }

  if (user?.subscriptionEndsAt && new Date(user.subscriptionEndsAt) < now) {
    return NextResponse.json({ 
      error: 'Assinatura expirada',
      code: 'SUBSCRIPTION_EXPIRED',
      redirectUrl: '/dashboard/plans'
    }, { status: 403 })
  }

  req.user = payload
  return null
}

export function planMiddleware(planId: string, feature: string) {
  const planLimits: Record<string, Record<string, number | boolean>> = {
    free: {
      maxClients: 10,
      maxAppointments: 50,
      maxServices: 5,
      hasFinancial: false,
      hasPublicPage: true,
    },
    pro: {
      maxClients: 100,
      maxAppointments: 200,
      maxServices: 20,
      hasFinancial: true,
      hasPublicPage: true,
    },
    premium: {
      maxClients: -1,
      maxAppointments: -1,
      maxServices: -1,
      hasFinancial: true,
      hasPublicPage: true,
    },
  }
  
  const limits = planLimits[planId] || planLimits.free
  
  if (feature === 'hasFinancial' && !limits.hasFinancial) {
    return { allowed: false, message: 'Este recurso está disponível apenas nos planos Pro e Premium' }
  }
  
  if (feature === 'hasPublicPage' && !limits.hasPublicPage) {
    return { allowed: false, message: 'Página pública disponível apenas nos planos Pro e Premium' }
  }
  
  return { allowed: true }
}
