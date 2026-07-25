import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    EVOLUTION_API_URL: process.env.EVOLUTION_API_URL || 'NOT_SET',
    EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY ? 'SET (hidden)' : 'NOT_SET',
    GROQ_API_KEY: process.env.GROQ_API_KEY ? 'SET (hidden)' : 'NOT_SET',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
  })
}
