import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function checkRateLimit(
  request: Request,
  limit: number,
  window: number
): Promise<{ success: boolean; remaining: number }> {
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
  } catch {
    return { success: true, remaining: 999 }
  }
}
