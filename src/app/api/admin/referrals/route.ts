import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export const dynamic = 'force-dynamic'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const userId = req.user!.userId
    
    // Check if admin
    const adminUser = await (prisma as any).user.findUnique({ where: { id: userId } })
    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 })
    }

    // Get all users with their referral counts
    const users = await (prisma as any).user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        studioName: true,
        refCode: true,
        createdAt: true,
        _count: {
          select: {
            referredUsers: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get all referrals with user details
    const referrals = await (prisma as any).referral.findMany({
      include: {
        referrer: {
          select: {
            id: true,
            name: true,
            studioName: true,
            email: true
          }
        },
        referredUser: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      users: users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        studioName: u.studioName,
        refCode: u.refCode,
        referralCount: u._count.referredUsers,
        createdAt: u.createdAt
      })),
      referrals: referrals.map((r: any) => ({
        id: r.id,
        referrer: r.referrer,
        referredUser: r.referredUser,
        createdAt: r.createdAt
      }))
    })
  } catch (error) {
    console.error('Admin referrals error:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}
