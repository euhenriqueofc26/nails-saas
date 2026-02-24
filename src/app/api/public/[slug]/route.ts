import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { slug: params.slug },
      include: {
        plan: true,
        publicProfile: true,
      },
    })

    if (!user || !user.plan.hasPublicPage) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    const profile = user.publicProfile
    if (!profile || !profile.isActive) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    const services = await prisma.service.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
        description: true,
        image: true,
      },
    })

    return NextResponse.json({
      studio: {
        name: user.studioName,
        slug: user.slug,
        whatsapp: user.whatsapp,
      },
      profile: {
        bio: profile.bio,
        coverImage: profile.coverImage,
        address: profile.address,
        instagram: profile.instagram,
        facebook: profile.facebook,
        workingHours: profile.workingHours,
      },
      services,
    })
  } catch (error) {
    console.error('Get public profile error:', error)
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 })
  }
}
