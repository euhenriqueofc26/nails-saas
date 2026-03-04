import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map<string, { count: number; timestamp: number }>()

const RATE_LIMIT = 100
const TIME_WINDOW = 60 * 1000

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  const now = Date.now()
  const record = rateLimit.get(ip)
  
  if (!record) {
    rateLimit.set(ip, { count: 1, timestamp: now })
    return NextResponse.next()
  }
  
  if (now - record.timestamp > TIME_WINDOW) {
    rateLimit.set(ip, { count: 1, timestamp: now })
    return NextResponse.next()
  }
  
  if (record.count >= RATE_LIMIT) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }
  
  record.count++
  rateLimit.set(ip, record)
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*'
  ]
}
