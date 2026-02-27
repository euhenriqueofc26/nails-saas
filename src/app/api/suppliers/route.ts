import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const suppliers = await prisma.supplier.findMany({
      where: {
        userId: req.user!.userId,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ suppliers })
  } catch (error) {
    console.error('Get suppliers error:', error)
    return NextResponse.json({ error: 'Erro ao buscar fornecedores' }, { status: 500 })
  }
}

export async function POST(req: AuthRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { name, link } = body

    if (!name || !link) {
      return NextResponse.json(
        { error: 'Nome e link são obrigatórios' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.create({
      data: {
        userId: req.user!.userId,
        name,
        link,
      },
    })

    return NextResponse.json({ supplier })
  } catch (error) {
    console.error('Create supplier error:', error)
    return NextResponse.json({ error: 'Erro ao criar fornecedor' }, { status: 500 })
  }
}
