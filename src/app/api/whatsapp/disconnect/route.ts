import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import { logoutInstance } from '@/lib/evolution-api'

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const session = await prisma.whatsAppSession.findUnique({
      where: { userId: req.user!.userId },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Nenhuma sessão encontrada' },
        { status: 404 }
      )
    }

    try {
      if (session.instanceToken) {
        await logoutInstance(session.instanceToken)
      }
    } catch {
    }

    await prisma.whatsAppSession.update({
      where: { id: session.id },
      data: { status: 'DISCONNECTED', qrCode: null, phoneNumber: null, lastHeartbeat: new Date() },
    })

    return NextResponse.json({ success: true, message: 'WhatsApp desconectado' })
  } catch (error) {
    console.error('WhatsApp disconnect error:', error)
    return NextResponse.json(
      { error: 'Erro ao desconectar WhatsApp' },
      { status: 500 }
    )
  }
}
