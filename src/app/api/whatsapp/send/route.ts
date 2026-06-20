import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import { sendTextMessage, formatPhoneForEvolution, generateDelay, generateMessageVariations } from '@/lib/evolution-api'

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const { to, message, appointmentId } = await req.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Destinatário e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    const session = await prisma.whatsAppSession.findUnique({
      where: { userId: req.user!.userId },
    })

    if (!session || session.status !== 'CONNECTED') {
      return NextResponse.json(
        { error: 'WhatsApp não está conectado. Conecte-o nas configurações.' },
        { status: 400 }
      )
    }

    if (appointmentId) {
      const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, userId: req.user!.userId },
      })
      if (appointment && appointment.reminderSent) {
        return NextResponse.json(
          { error: 'Lembrete já foi enviado para este agendamento' },
          { status: 400 }
        )
      }
    }

    const delay = generateDelay()
    const phone = formatPhoneForEvolution(to)

    const result = await sendTextMessage(session.instanceName, phone, message, delay)

    await prisma.whatsAppMessage.create({
      data: {
        sessionId: session.id,
        from: session.phoneNumber || '',
        to: phone,
        content: message,
        direction: 'OUTBOUND',
        status: 'SENT',
        appointmentId: appointmentId || null,
      },
    })

    if (appointmentId) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          reminderSent: true,
          reminderSentAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      result,
    })
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem' },
      { status: 500 }
    )
  }
}
