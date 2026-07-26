import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { listAllInstancesWithState, connectInstance } from '@/lib/evolution-api'

const MAX_RECONNECT_ATTEMPTS = 3
const RECONNECT_BASE_DELAY_MS = 30_000

export async function GET() {
  try {
    const connectedSessions = await prisma.whatsAppSession.findMany({
      where: { status: 'CONNECTED' },
    })

    if (connectedSessions.length === 0) {
      return NextResponse.json({ checked: 0, message: 'No connected sessions' })
    }

    const instanceStates = await listAllInstancesWithState()

    let reconnected = 0
    let disconnected = 0
    let healthy = 0

    for (const session of connectedSessions) {
      const remoteState = instanceStates.get(session.instanceName) || 'unknown'

      if (remoteState === 'open') {
        healthy++
        await prisma.whatsAppSession.update({
          where: { id: session.id },
          data: { lastHeartbeat: new Date() },
        })
        continue
      }

      console.log(`[whatsapp-health] Instance ${session.instanceName} state: ${remoteState}, attempting reconnect...`)

      let reconnectSuccess = false

      for (let attempt = 1; attempt <= MAX_RECONNECT_ATTEMPTS; attempt++) {
        try {
          const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL}/api/webhooks/evolution/incoming`
          await connectInstance(session.instanceName, webhookUrl, session.instanceToken || undefined)

          await prisma.whatsAppSession.update({
            where: { id: session.id },
            data: { lastHeartbeat: new Date() },
          })

          reconnectSuccess = true
          reconnected++
          console.log(`[whatsapp-health] Reconnected ${session.instanceName} on attempt ${attempt}`)
          break
        } catch (err) {
          console.error(`[whatsapp-health] Reconnect attempt ${attempt} failed for ${session.instanceName}:`, err)
          if (attempt < MAX_RECONNECT_ATTEMPTS) {
            const delay = RECONNECT_BASE_DELAY_MS * Math.pow(2, attempt - 1)
            await new Promise((r) => setTimeout(r, delay))
          }
        }
      }

      if (!reconnectSuccess) {
        disconnected++
        await prisma.whatsAppSession.update({
          where: { id: session.id },
          data: { status: 'DISCONNECTED' },
        })
        console.error(`[whatsapp-health] Failed to reconnect ${session.instanceName} after ${MAX_RECONNECT_ATTEMPTS} attempts, marked DISCONNECTED`)
      }
    }

    return NextResponse.json({
      checked: connectedSessions.length,
      healthy,
      reconnected,
      disconnected,
    })
  } catch (error) {
    console.error('[whatsapp-health] Error:', error)
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 })
  }
}
