import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard, getTopLeaderboard, searchLeaderboard } from '@/lib/supabase';
import {
  getCachedLeaderboardTop,
  setCachedLeaderboardTop,
  getCachedLeaderboardPage,
  setCachedLeaderboardPage,
} from '@/lib/redis';
import {
  leaderboardRatelimit,
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
} from '@/lib/ratelimit';
import { leaderboardQuerySchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(leaderboardRatelimit, ip);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
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
      // Try cache first
      type TopLeaderboardEntry = { id: string; nickname: string; country: string; score: number };
      const cached = await getCachedLeaderboardTop<{
        entries: TopLeaderboardEntry[];
        total: number;
      }>();
      if (cached) {
        return NextResponse.json(cached, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': 'public, max-age=30',
            ...getRateLimitHeaders(
              rateLimitResult.limit,
              rateLimitResult.remaining,
              rateLimitResult.reset
            ),
          },
        });
      }

      // Cache miss - fetch from DB
      const entries = await getTopLeaderboard(10);
      const result = { entries, total: entries.length };

      // Cache the result
      await setCachedLeaderboardTop(result);

      return NextResponse.json(result, {
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': 'public, max-age=30',
          ...getRateLimitHeaders(
            rateLimitResult.limit,
            rateLimitResult.remaining,
            rateLimitResult.reset
          ),
        },
      });
    }

    // Handle paginated request
    type LeaderboardEntry = { id: string; nickname: string; country: string; score: number; created_at: string };
    const cached = await getCachedLeaderboardPage<{
      entries: LeaderboardEntry[];
      total: number;
      page: number;
      totalPages: number;
    }>(page);

    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=60',
          ...getRateLimitHeaders(
            rateLimitResult.limit,
            rateLimitResult.remaining,
            rateLimitResult.reset
          ),
        },
      });
    }

    // Cache miss - fetch from DB
    const result = await getLeaderboard(page, limit);

    // Cache the result
    await setCachedLeaderboardPage(page, result);

    return NextResponse.json(result, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=60',
        ...getRateLimitHeaders(
          rateLimitResult.limit,
          rateLimitResult.remaining,
          rateLimitResult.reset
        ),
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
