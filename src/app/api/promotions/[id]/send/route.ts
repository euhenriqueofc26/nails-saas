import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'
import { sendTextMessage, formatPhoneForEvolution } from '@/lib/evolution-api'

export async function POST(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json().catch(() => ({}))
    const { clientId } = body

    const promotion = await prisma.promotion.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
    })

    if (!promotion) {
      return NextResponse.json({ error: 'Promoção não encontrada' }, { status: 404 })
    }

    const studio = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { studioName: true }
    })

    const session = await prisma.whatsAppSession.findUnique({
      where: { userId: req.user!.userId },
    })

    if (!session?.instanceToken) {
      return NextResponse.json(
        { error: 'WhatsApp não conectado. Conecte seu WhatsApp primeiro.' },
        { status: 400 }
      )
    }

    let clients
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, userId: req.user!.userId },
      })
      if (!client) {
        return NextResponse.json({ error: 'Cliente não encontrada' }, { status: 404 })
      }
      clients = [client]
    } else {
      clients = await prisma.client.findMany({
        where: { userId: req.user!.userId },
      })
      clients = clients.filter(c => c.whatsapp)
    }

    const results: { name: string; success: boolean; error?: string }[] = []

    for (const client of clients) {
      if (!client.whatsapp) {
        results.push({ name: client.name, success: false, error: 'Sem WhatsApp' })
        continue
      }

      try {
        let fullMessage = promotion.message
        fullMessage = fullMessage.replace(/{nome}/g, client.name)
        fullMessage = fullMessage.replace(/{estudio}/g, studio?.studioName || 'Nail Designer')

        if (promotion.discount) {
          fullMessage = fullMessage.replace(/{desconto}/g, `${promotion.discount}%`)
        }

        const phone = formatPhoneForEvolution(client.whatsapp)
        await sendTextMessage(session.instanceToken, phone, fullMessage)

        results.push({ name: client.name, success: true })
      } catch (err) {
        results.push({
          name: client.name,
          success: false,
          error: err instanceof Error ? err.message : 'Erro ao enviar',
        })
      }
    }

    const sentCount = results.filter(r => r.success).length

    await prisma.promotion.update({
      where: { id: params.id },
      data: { sentCount: { increment: sentCount } },
    })

    return NextResponse.json({
      results,
      sent: sentCount,
      failed: results.length - sentCount,
      total: results.length,
    })
  } catch (error) {
    console.error('Send promotion error:', error)
    return NextResponse.json({ error: 'Erro ao enviar promoção' }, { status: 500 })
  }
}
