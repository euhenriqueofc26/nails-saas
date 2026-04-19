const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'ks7340447@gmail.com' }
  })
  
  console.log('Status atual:', user.onboardingStep, user.onboardingCompleted)
  
  if (user.onboardingStep > 1 || user.onboardingCompleted) {
    await prisma.user.update({
      where: { email: 'ks7340447@gmail.com' },
      data: { onboardingStep: 1, onboardingCompleted: false }
    })
    console.log('✅ Resetado!')
  } else {
    console.log(' Ja estava resetado')
  }
  
  await prisma.$disconnect()
}

main()