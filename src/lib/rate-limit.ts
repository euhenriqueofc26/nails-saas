import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let redis: Redis | null = null
try {
  redis = Redis.fromEnv()
} catch {
  console.error('Redis not configured - rate limiting disabled')
}

export async function checkRateLimit(
  request: Request,
  limit: number,
  window: number,
  failOpen: boolean = true
): Promise<{ success: boolean; remaining: number }> {
  if (!redis) {
    console.warn('Rate limiter unavailable: Redis not configured')
    return { success: failOpen, remaining: failOpen ? 999 : 0 }
  }

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'anonymous'

    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${window}s`),
      prefix: `ratelimit:${ip}`,
    })

    const result = await ratelimit.limit(ip)
    return { success: result.success, remaining: result.remaining }
  } catch (error) {
    console.error('Rate limiter error:', error)
    return { success: failOpen, remaining: failOpen ? 999 : 0 }
  }
}
