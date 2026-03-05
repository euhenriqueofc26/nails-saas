import { prisma } from '@/lib/prisma'

// Generate a referral code based on the user's name, ensuring uniqueness.
// Pattern examples: ANA123, NAIL457, STU984
export async function generateReferralCode(name: string): Promise<string> {
  const base = sanitizeName(name)
  // Try up to a few variants to ensure uniqueness
  for (let i = 0; i < 5; i++) {
    const candidate = makeCandidate(base, i)
    const exists = await (prisma as any).user.findFirst({ where: { refCode: candidate } })
    if (!exists) {
      return candidate
    }
  }
  // Fallback: add random suffix if all else fails
  const random = Math.floor(Math.random() * 900 + 100)
  return `${base.substring(0, 3).padEnd(3, 'X')}${random}`
}

function sanitizeName(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

function makeCandidate(base: string, salt = 0): string {
  const prefix = base.substring(0, 3).padEnd(3, 'X')
  // 3-digit numeric suffix; add salt to diversify if collisions
  const suffix = Math.abs((Number((salt + '' ).padStart(3, '0')) || 0) % 1000)
  const digits = String(suffix).padStart(3, '0')
  return (prefix + digits).substring(0, 6)
}
