import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware, AuthRequest } from '@/lib/authMiddleware'

export async function GET(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const service = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Get service error:', error)
    return NextResponse.json({ error: 'Erro ao buscar serviço' }, { status: 500 })
  }
}

export async function PUT(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const body = await req.json()
    const { name, price, duration, description, isActive, image } = body

    const existingService = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        name: name || existingService.name,
        price: price !== undefined ? price : existingService.price,
        duration: duration !== undefined ? duration : existingService.duration,
        description: description !== undefined ? description : existingService.description,
        isActive: isActive !== undefined ? isActive : existingService.isActive,
        image: image !== undefined ? image : existingService.image,
      },
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Update service error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar serviço' }, { status: 500 })
  }
}

export async function DELETE(req: AuthRequest, { params }: { params: { id: string } }) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const existingService = await prisma.service.findFirst({
      where: {
        id: params.id,
        userId: req.user!.userId,
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    await prisma.service.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Serviço deletado com sucesso' })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json({ error: 'Erro ao deletar serviço' }, { status: 500 })
  }
}
