import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export const dynamic = 'force-dynamic'

function generateReferralCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  const random = Math.random().toString(36).substring(2, 6)
  return `${cleanName.substring(0, 4)}${random}`
}

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const userId = req.user!.userId
    let user: any = await (prisma as any).user.findUnique({ where: { id: userId } })
    
    // Generate refCode if doesn't exist
    if (!user?.refCode) {
      const newRefCode = generateReferralCode(user?.name || 'user')
      user = await (prisma as any).user.update({
        where: { id: userId },
        data: { refCode: newRefCode }
      })
    }
    
    const count = await (prisma as any).referral.count({ where: { referrerId: userId } })
    const refCode = user?.refCode
    const referralLink = refCode ? `https://clubnailsbrasil.com.br/ref/${refCode}` : null
    return NextResponse.json({ count, refCode, referralLink })
  } catch (error) {
    console.error('Get referrals error:', error)
    return NextResponse.json({ error: 'Erro ao buscar indicações' }, { status: 500 })
  }
}
