import { Redis } from '@upstash/redis';

// Lazy-initialized Redis client (only created when needed)
let redisInstance: Redis | null = null;

function getRedis(): Redis {
  if (!redisInstance) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('Missing Upstash Redis environment variables');
    }

    redisInstance = new Redis({ url, token });
  }
  return redisInstance;
}

// Cache keys
export const CACHE_KEYS = {
  LEADERBOARD_TOP: 'leaderboard:top',
  LEADERBOARD_PAGE: (page: number) => `leaderboard:page:${page}`,
  TOURNAMENT_SETTINGS: 'tournament:settings',
  SESSION_USED: (sessionId: string) => `session:used:${sessionId}`,
} as const;

// Cache TTLs in seconds
export const CACHE_TTL = {
  LEADERBOARD_TOP: 30, // 30 seconds
  LEADERBOARD_PAGE: 60, // 60 seconds
  TOURNAMENT_SETTINGS: 300, // 5 minutes
  SESSION_LOCK: 3600, // 1 hour
} as const;

// Generic cache operations
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  data: T,
  ttlSeconds: number
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(key, data, { ex: ttlSeconds });
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const redis = getRedis();
    // Get all keys matching pattern
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Redis delete pattern error:', error);
  }
}

// Leaderboard caching
export async function getCachedLeaderboardTop<T>(): Promise<T | null> {
  return getCache<T>(CACHE_KEYS.LEADERBOARD_TOP);
}

export async function setCachedLeaderboardTop<T>(data: T): Promise<void> {
  await setCache(CACHE_KEYS.LEADERBOARD_TOP, data, CACHE_TTL.LEADERBOARD_TOP);
}

export async function getCachedLeaderboardPage<T>(page: number): Promise<T | null> {
  return getCache<T>(CACHE_KEYS.LEADERBOARD_PAGE(page));
}

export async function setCachedLeaderboardPage<T>(page: number, data: T): Promise<void> {
  await setCache(CACHE_KEYS.LEADERBOARD_PAGE(page), data, CACHE_TTL.LEADERBOARD_PAGE);
}

// Tournament settings caching
export async function getCachedTournamentSettings<T>(): Promise<T | null> {
  return getCache<T>(CACHE_KEYS.TOURNAMENT_SETTINGS);
}

export async function setCachedTournamentSettings<T>(data: T): Promise<void> {
  await setCache(CACHE_KEYS.TOURNAMENT_SETTINGS, data, CACHE_TTL.TOURNAMENT_SETTINGS);
}

// Session lock (prevents double submission)
export async function isSessionLocked(sessionId: string): Promise<boolean> {
  const redis = getRedis();
  const key = CACHE_KEYS.SESSION_USED(sessionId);
  const exists = await redis.exists(key);
  return exists === 1;
}

export async function lockSession(sessionId: string): Promise<boolean> {
  const redis = getRedis();
  const key = CACHE_KEYS.SESSION_USED(sessionId);
  // Use SETNX (set if not exists) to ensure atomicity
  const result = await redis.setnx(key, '1');
  if (result === 1) {
    // Set expiry
    await redis.expire(key, CACHE_TTL.SESSION_LOCK);
    return true;
  }
  return false;
}

// Invalidate leaderboard cache (called after score submission)
export async function invalidateLeaderboardCache(): Promise<void> {
  await deleteCache(CACHE_KEYS.LEADERBOARD_TOP);
  await deleteCachePattern('leaderboard:page:*');
}

// Flush all cache
export async function flushAllCache(): Promise<void> {
  try {
    const redis = getRedis();
    await redis.flushdb();
  } catch (error) {
    console.error('Redis flush error:', error);
    throw error;
  }
}

// Export getRedis for direct access if needed
export { getRedis };
