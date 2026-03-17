import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Check if Redis environment variables are available
function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN &&
    !process.env.UPSTASH_REDIS_REST_URL.includes('xxx')
  );
}

// Lazy-initialized Redis instance for rate limiting
let redisInstance: Redis | null = null;
let redisInitialized = false;

function getRedisForRatelimit(): Redis | null {
  if (!redisInitialized) {
    redisInitialized = true;
    if (isRedisConfigured()) {
      redisInstance = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
    }
  }
  return redisInstance;
}

// Lazy-initialized rate limiters
let checkoutRatelimitInstance: Ratelimit | null = null;
let leaderboardRatelimitInstance: Ratelimit | null = null;
let submitScoreRatelimitInstance: Ratelimit | null = null;
let adminRatelimitInstance: Ratelimit | null = null;

// /api/create-checkout: max 10 requests per IP per hour
export function getCheckoutRatelimit(): Ratelimit | null {
  if (checkoutRatelimitInstance === null) {
    const redis = getRedisForRatelimit();
    if (redis) {
      checkoutRatelimitInstance = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 h'),
        prefix: 'ratelimit:checkout',
        analytics: true,
      });
    }
  }
  return checkoutRatelimitInstance;
}

// /api/leaderboard: max 60 requests per IP per minute
export function getLeaderboardRatelimit(): Ratelimit | null {
  if (leaderboardRatelimitInstance === null) {
    const redis = getRedisForRatelimit();
    if (redis) {
      leaderboardRatelimitInstance = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '1 m'),
        prefix: 'ratelimit:leaderboard',
        analytics: true,
      });
    }
  }
  return leaderboardRatelimitInstance;
}

// /api/submit-score: max 1 request per session_id (handled via Redis lock + DB constraint)
// This is used as a fallback rate limit per IP
export function getSubmitScoreRatelimit(): Ratelimit | null {
  if (submitScoreRatelimitInstance === null) {
    const redis = getRedisForRatelimit();
    if (redis) {
      submitScoreRatelimitInstance = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        prefix: 'ratelimit:submit',
        analytics: true,
      });
    }
  }
  return submitScoreRatelimitInstance;
}

// Generic rate limiter for admin routes
export function getAdminRatelimit(): Ratelimit | null {
  if (adminRatelimitInstance === null) {
    const redis = getRedisForRatelimit();
    if (redis) {
      adminRatelimitInstance = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        prefix: 'ratelimit:admin',
        analytics: true,
      });
    }
  }
  return adminRatelimitInstance;
}

// Helper function to check rate limit (with graceful fallback)
export async function checkRateLimit(
  getRatelimit: () => Ratelimit | null,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const ratelimit = getRatelimit();

  // If rate limiting is not available, allow all requests
  if (!ratelimit) {
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }

  try {
    const result = await ratelimit.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // On Redis error, allow the request (fail open)
    console.warn('Rate limit check failed, allowing request:', error);
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }
}

// Helper function to get IP from request headers
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

// Response headers for rate limit info
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  reset: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };
}

// Export availability check as a function
export function isRedisAvailable(): boolean {
  return isRedisConfigured();
}
