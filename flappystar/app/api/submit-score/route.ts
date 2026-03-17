import { NextRequest, NextResponse } from 'next/server';
import { isSessionPaid } from '@/lib/stripe';
import { submitScore } from '@/lib/supabase';
import { lockSession, invalidateLeaderboardCache } from '@/lib/redis';
import {
  getSubmitScoreRatelimit,
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
} from '@/lib/ratelimit';
import { submitScoreSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP (fallback protection)
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(getSubmitScoreRatelimit, ip);

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

    // Parse and validate request body
    const body = await request.json();
    const validation = submitScoreSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { session_id, full_name, email, nickname, country, score } =
      validation.data;

    // Verify Stripe session is paid
    const isPaid = await isSessionPaid(session_id);
    if (!isPaid) {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Try to acquire Redis lock (prevents race conditions)
    const lockAcquired = await lockSession(session_id);
    if (!lockAcquired) {
      return NextResponse.json(
        { error: 'Session already used' },
        { status: 400 }
      );
    }

    // Submit score to database
    const result = await submitScore({
      stripe_session_id: session_id,
      full_name,
      email,
      nickname,
      country,
      score,
      ip_address: ip,
    });

    // Handle duplicate (race condition that passed Redis lock)
    if (result.duplicate) {
      return NextResponse.json(
        { error: 'Session already used' },
        { status: 400 }
      );
    }

    // Invalidate leaderboard cache
    await invalidateLeaderboardCache();

    return NextResponse.json({
      success: true,
      rank: result.rank,
      score: score,
    });
  } catch (error) {
    console.error('Submit score error:', error);
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}
