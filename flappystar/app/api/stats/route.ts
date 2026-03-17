import { NextResponse } from 'next/server';
import { getTournamentStats, getTournamentSettings } from '@/lib/supabase';
import { isRedisAvailable } from '@/lib/ratelimit';

// Optional Redis caching
let getCachedTournamentSettings: (() => Promise<unknown>) | null = null;
let setCachedTournamentSettings: ((data: unknown) => Promise<void>) | null = null;

if (isRedisAvailable) {
  import('@/lib/redis').then((redis) => {
    getCachedTournamentSettings = redis.getCachedTournamentSettings;
    setCachedTournamentSettings = redis.setCachedTournamentSettings;
  }).catch(() => {
    // Redis not available
  });
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get tournament stats from Supabase
    const stats = await getTournamentStats();

    // Get tournament settings
    type TournamentSettings = {
      id: number;
      start_date: string | null;
      end_date: string | null;
      prize_amount: number;
      is_active: boolean;
      max_entries: number | null;
    };

    let settings: TournamentSettings | null = null;

    // Try cache first (only if Redis is available)
    if (getCachedTournamentSettings) {
      try {
        settings = await getCachedTournamentSettings() as TournamentSettings | null;
      } catch {
        // Cache error, continue to DB
      }
    }

    // Fetch from DB if not cached
    if (!settings) {
      settings = await getTournamentSettings();

      // Cache the result (fire and forget)
      if (settings && setCachedTournamentSettings) {
        setCachedTournamentSettings(settings).catch(() => {});
      }
    }

    // Calculate days remaining
    let daysRemaining = 0;
    if (settings?.end_date) {
      const endDate = new Date(settings.end_date);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    return NextResponse.json({
      totalEntries: stats.totalEntries ?? 0,
      uniqueCountries: stats.uniqueCountries ?? 0,
      highestScore: stats.highestScore ?? 0,
      daysRemaining,
      prizeAmount: settings?.prize_amount ?? 10000,
    }, {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    // Return fallback data on error
    return NextResponse.json({
      totalEntries: 0,
      uniqueCountries: 0,
      highestScore: 0,
      daysRemaining: 184, // ~6 months fallback
      prizeAmount: 10000,
    }, {
      status: 200, // Return 200 even on error to avoid breaking the UI
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }
}
