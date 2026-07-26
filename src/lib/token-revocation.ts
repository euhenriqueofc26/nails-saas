import { Redis } from '@upstash/redis'

let redis: Redis | null = null
try {
  redis = Redis.fromEnv()
} catch {
  console.error('Redis not configured - token revocation disabled')
}

const REVOCATION_PREFIX = 'revoked:'
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60

export async function revokeToken(token: string): Promise<void> {
  if (!redis) return
  try {
    await redis.setex(`${REVOCATION_PREFIX}${token}`, TOKEN_TTL_SECONDS, '1')
  } catch (error) {
    console.error('Failed to revoke token:', error)
  }
}

export async function isTokenRevoked(token: string): Promise<boolean> {
  if (!redis) return false
  try {
    const result = await redis.get(`${REVOCATION_PREFIX}${token}`)
    return result === '1'
  } catch {
    return false
  }
}
