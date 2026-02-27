import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function POST(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const promotion = await prisma.promotion.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
    })

    if (!promotion) {
      return NextResponse.json({ error: 'Promoção não encontrada' }, { status: 404 })
    }

    const clients = await prisma.client.findMany({
      where: {
        userId: req.user!.userId,
      },
    })

    const studio = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { studioName: true, whatsapp: true }
    })

    let sentCount = 0
    
    for (const client of clients) {
      const clientWhatsapp = client.whatsapp.replace(/\D/g, '')
      
      let fullMessage = promotion.message
      fullMessage = fullMessage.replace(/{nome}/g, client.name)
      fullMessage = fullMessage.replace(/{estudio}/g, studio?.studioName || 'Nail Designer')
      
      if (promotion.discount) {
        fullMessage = fullMessage.replace(/{desconto}/g, `${promotion.discount}%`)
      }

      const whatsappUrl = `https://wa.me/55${clientWhatsapp}?text=${encodeURIComponent(fullMessage)}`
      
      sentCount++
    }

    await prisma.promotion.update({
      where: { id: params.id },
      data: { sentCount },
    })

    return NextResponse.json({ 
      message: `Promoção enviada para ${sentCount} clientes!`,
      sentCount 
    })
  } catch (error) {
    console.error('Send promotion error:', error)
    return NextResponse.json({ error: 'Erro ao enviar promoção' }, { status: 500 })
  }
}
