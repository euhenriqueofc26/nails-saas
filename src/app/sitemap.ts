import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.clubnailsbrasil.com.br'

  const users = await prisma.user.findMany({
    where: { publicProfile: { isNot: null } },
    select: { slug: true, updatedAt: true },
  })

  const studioPages = users.map(user => ({
    url: `${baseUrl}/${user.slug}`,
    lastModified: user.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/forgot-password`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...studioPages,
  ]
}
