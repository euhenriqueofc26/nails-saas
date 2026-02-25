import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PublicBookingClient from './PublicBookingClient'

interface PageProps {
  params: { slug: string }
}

async function getStudioData(slug: string) {
  const user = await prisma.user.findUnique({
    where: { slug },
    include: {
      plan: true,
      publicProfile: true,
    },
  })

  if (!user || !user.plan.hasPublicPage) return null

  const profile = user.publicProfile
  if (!profile || !profile.isActive) return null

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

  return {
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
  }
}

export default async function PublicBookingPage({ params }: PageProps) {
  const data = await getStudioData(params.slug)

  if (!data) {
    notFound()
  }

  return <PublicBookingClient data={data} />
}
