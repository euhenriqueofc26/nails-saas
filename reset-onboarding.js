const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'ks7340447@gmail.com' }
  })
  
  console.log('Antes:', user?.onboardingStep, user?.onboardingCompleted)
  
  await prisma.user.update({
    where: { email: 'ks7340447@gmail.com' },
    data: { 
      onboardingStep: 1, 
      onboardingCompleted: false 
    }
  })
  
  const updated = await prisma.user.findUnique({
    where: { email: 'ks7340447@gmail.com' }
  })
  
  console.log('Depois:', updated?.onboardingStep, updated?.onboardingCompleted)
  
  await prisma.$disconnect()
}

main()