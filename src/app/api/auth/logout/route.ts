import { NextRequest, NextResponse } from 'next/server'
import { revokeToken } from '@/lib/token-revocation'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      await revokeToken(token)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ success: true })
  }
}
