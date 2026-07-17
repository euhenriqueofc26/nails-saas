import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token) as { userId: string } | null
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { aiEnabled } = await req.json()

    await prisma.user.update({
      where: { id: payload.userId },
      data: { aiEnabled } as any,
    })

    return NextResponse.json({ success: true, aiEnabled })
  } catch (error) {
    console.error('AI toggle error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
