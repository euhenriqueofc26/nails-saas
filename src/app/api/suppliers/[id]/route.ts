import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function DELETE(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const existingSupplier = await prisma.supplier.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
    })

    if (!existingSupplier) {
      return NextResponse.json({ error: 'Fornecedor não encontrado' }, { status: 404 })
    }

    await prisma.supplier.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Fornecedor deletado com sucesso' })
  } catch (error) {
    console.error('Delete supplier error:', error)
    return NextResponse.json({ error: 'Erro ao deletar fornecedor' }, { status: 500 })
  }
}
