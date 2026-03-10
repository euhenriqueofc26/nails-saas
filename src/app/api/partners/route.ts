import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateCode(name: string): string {
  const base = (name || 'P').replace(/[^a-zA-Z0-9]/g, '')
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase()
  return (base.substring(0, 3) + suffix).toUpperCase()
}

export async function GET() {
  const partners = await (prisma as any).partner.findMany()
  return NextResponse.json({ partners })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, commissionRate } = body
    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }
    let code = generateCode(name)
    // ensure unique
    let exists = await (prisma as any).partner.findUnique({ where: { referralCode: code } })
    let attempts = 0
    while (exists && attempts < 5) {
      code = generateCode(name)
      exists = await (prisma as any).partner.findUnique({ where: { referralCode: code } })
      attempts++
    }
    const partner = await (prisma as any).partner.create({
      data: {
        name,
        email,
        referralCode: code,
        commissionRate: commissionRate ?? 20,
        status: 'active'
      }
    })
    return NextResponse.json({ partner })
  } catch (error) {
    console.error('Create partner error:', error)
    return NextResponse.json({ error: 'Erro ao criar parceiro' }, { status: 500 })
  }
}

// Referral handling for partner should be implemented in a dedicated route
// under: src/app/api/partners/[id]/route.ts with PATCH or POST as appropriate.
