import { prisma } from '@/lib/prisma'

async function main() {
  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      slug: 'free',
      price: 0,
      maxClients: 10,
      maxAppointments: 50,
      maxServices: 5,
      hasFinancial: false,
      hasPublicPage: true,
      hasAnalytics: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      slug: 'pro',
      price: 49.9,
      maxClients: 100,
      maxAppointments: 200,
      maxServices: 20,
      hasFinancial: true,
      hasPublicPage: true,
      hasAnalytics: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      slug: 'premium',
      price: 99.9,
      maxClients: -1,
      maxAppointments: -1,
      maxServices: -1,
      hasFinancial: true,
      hasPublicPage: true,
      hasAnalytics: true,
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    })
  }

  console.log('Planos criados com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
