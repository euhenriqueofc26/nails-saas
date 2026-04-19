const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.user.update({
    where: { email: 'ks7340447@gmail.com' },
    data: { onboardingStep: 1, onboardingCompleted: false }
  })
  console.log('Resetado!')
  await prisma.$disconnect()
}

main()