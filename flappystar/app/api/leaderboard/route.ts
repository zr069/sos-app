import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard, getTopLeaderboard, searchLeaderboard } from '@/lib/supabase';
import {
  leaderboardRatelimit,
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
  isRedisAvailable,
} from '@/lib/ratelimit';
import { leaderboardQuerySchema } from '@/lib/validations';

// Optional Redis caching - only import if available
let getCachedLeaderboardTop: ((key?: string) => Promise<unknown>) | null = null;
let setCachedLeaderboardTop: ((data: unknown) => Promise<void>) | null = null;
let getCachedLeaderboardPage: ((page: number) => Promise<unknown>) | null = null;
let setCachedLeaderboardPage: ((page: number, data: unknown) => Promise<void>) | null = null;

if (isRedisAvailable) {
  import('@/lib/redis').then((redis) => {
    getCachedLeaderboardTop = redis.getCachedLeaderboardTop;
    setCachedLeaderboardTop = redis.setCachedLeaderboardTop;
    getCachedLeaderboardPage = redis.getCachedLeaderboardPage;
    setCachedLeaderboardPage = redis.setCachedLeaderboardPage;
  }).catch(() => {
    // Redis not available, continue without caching
  });
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting (gracefully handles missing Redis)
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(leaderboardRatelimit, ip);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', entries: [], total: 0, page: 1, totalPages: 0 },
        {
          status: 429,
          headers: getRateLimitHeaders(
            rateLimitResult.limit,
            rateLimitResult.remaining,
            rateLimitResult.reset
          ),
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const searchParam = searchParams.get('search');
    const limitParam = searchParams.get('limit');

    // Validate query params
    const validation = leaderboardQuerySchema.safeParse({
      page: pageParam,
      search: searchParam,
    });

    const page = validation.success ? validation.data.page : 1;
    const search = validation.success ? validation.data.search : undefined;
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 25) : 25;

    const cacheHeaders = {
      'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
      ...getRateLimitHeaders(
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset
      ),
    };

    // Handle search query (no caching for search)
    if (search) {
      const result = await searchLeaderboard(search, page, limit);
      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'no-cache',
          ...getRateLimitHeaders(
            rateLimitResult.limit,
            rateLimitResult.remaining,
            rateLimitResult.reset
          ),
        },
      });
    }

    // Handle top 10 request (for live widget)
    if (limit === 10 && page === 1) {
      // Try cache first (only if Redis is available)
      if (getCachedLeaderboardTop) {
        try {
          type TopLeaderboardEntry = { id: string; nickname: string; country: string; score: number };
          const cached = await getCachedLeaderboardTop() as {
            entries: TopLeaderboardEntry[];
            total: number;
          } | null;

          if (cached) {
            return NextResponse.json(cached, {
              headers: {
                'X-Cache': 'HIT',
                ...cacheHeaders,
              },
            });
          }
        } catch {
          // Cache miss or error, continue to DB
        }
      }

      // Fetch from DB
      const entries = await getTopLeaderboard(10);
      const result = { entries, total: entries.length };

      // Cache the result (fire and forget, don't block response)
      if (setCachedLeaderboardTop) {
        setCachedLeaderboardTop(result).catch(() => {});
      }

      return NextResponse.json(result, {
        headers: {
          'X-Cache': 'MISS',
          ...cacheHeaders,
        },
      });
    }

    // Handle paginated request
    // Try cache first (only if Redis is available)
    if (getCachedLeaderboardPage) {
      try {
        type LeaderboardEntry = { id: string; nickname: string; country: string; score: number; created_at: string };
        const cached = await getCachedLeaderboardPage(page) as {
          entries: LeaderboardEntry[];
          total: number;
          page: number;
          totalPages: number;
        } | null;

        if (cached) {
          return NextResponse.json(cached, {
            headers: {
              'X-Cache': 'HIT',
              ...cacheHeaders,
            },
          });
        }
      } catch {
        // Cache miss or error, continue to DB
      }
    }

    // Fetch from DB
    const result = await getLeaderboard(page, limit);

    // Cache the result (fire and forget, don't block response)
    if (setCachedLeaderboardPage) {
      setCachedLeaderboardPage(page, result).catch(() => {});
    }

    return NextResponse.json(result, {
      headers: {
        'X-Cache': 'MISS',
        ...cacheHeaders,
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', entries: [], total: 0, page: 1, totalPages: 0 },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
}
