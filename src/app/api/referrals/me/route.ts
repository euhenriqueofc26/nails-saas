import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export const dynamic = 'force-dynamic'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const userId = req.user!.userId
    const user: any = await (prisma as any).user.findUnique({ where: { id: userId } })
    const count = await (prisma as any).referral.count({ where: { referrerId: userId } })
    const refCode = user?.refCode
    const referralLink = refCode ? `https://clubnailsbrasil.com.br/ref/${refCode}` : null
    return NextResponse.json({ count, refCode, referralLink })
  } catch (error) {
    console.error('Get referrals error:', error)
    return NextResponse.json({ error: 'Erro ao buscar indicações' }, { status: 500 })
  }
}
