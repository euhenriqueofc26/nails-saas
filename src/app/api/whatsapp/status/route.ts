import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const session = await prisma.whatsAppSession.findUnique({
      where: { userId: req.user!.userId },
    })

    if (!session) {
      return NextResponse.json({
        connected: false,
        session: null,
      })
    }

    return NextResponse.json({
      connected: session.status === 'CONNECTED',
      session: {
        id: session.id,
        status: session.status,
        phoneNumber: session.phoneNumber,
        instanceName: session.instanceName,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    })
  } catch (error) {
    console.error('WhatsApp status error:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    )
  }
}
