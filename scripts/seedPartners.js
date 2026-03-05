// Simple seed script to create 1-2 partner entries for MVP test
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getOrCreate(name, email, code, commission=20) {
  let existing = await prisma.partner.findUnique({ where: { referralCode: code } }).catch(() => null)
  if (existing) {
    console.log(`Partner exists: ${name} (${code}) -> id=${existing.id}`)
    return existing
  }
  const p = await prisma.partner.create({ data: { name, email, referralCode: code, commissionRate: commission, status: 'active' } })
  console.log(`Created partner: ${name} -> id=${p.id}, code=${code}`)
  return p
}

async function main() {
  await prisma.$connect()
  try {
    await getOrCreate('Nails Partner 1', 'partner1@example.com', 'NP1', 20)
    await getOrCreate('Nails Partner 2', 'partner2@example.com', 'NP2', 20)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
