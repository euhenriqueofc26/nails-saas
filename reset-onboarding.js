const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.user.updateMany({
    where: { email: 'ks7340447@gmail.com' },
    data: { onboardingStep: 1, onboardingCompleted: false }
  })
  console.log(`Resetado ${result.count} usuário(s)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())