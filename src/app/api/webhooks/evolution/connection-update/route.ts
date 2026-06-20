import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const instanceName = body.instance || body.instanceName || ''
    const status = body.status || body.state || ''
    const phoneNumber = body.number || body.phoneNumber || ''

    if (!instanceName || !status) {
      return NextResponse.json({ success: true })
    }

    let dbStatus = 'DISCONNECTED'
    if (status === 'open' || status === 'connected' || status === 'CONNECTED') {
      dbStatus = 'CONNECTED'
    } else if (status === 'close' || status === 'disconnected' || status === 'DISCONNECTED') {
      dbStatus = 'DISCONNECTED'
    } else if (status === 'connecting' || status === 'INITIALIZING' || status === 'scanning') {
      dbStatus = 'INITIALIZING'
    }

    const updateData: Record<string, unknown> = {
      status: dbStatus,
      lastHeartbeat: new Date(),
    }

    if (phoneNumber) {
      updateData.phoneNumber = phoneNumber
    }

    await prisma.whatsAppSession.updateMany({
      where: { instanceName },
      data: updateData as any,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook connection-update error:', error)
    return NextResponse.json({ success: true })
  }
}
