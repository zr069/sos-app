import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { GAME_CONSTANTS } from '@/lib/gameConstants';
import {
  createServerClient,
  getAnyGameSessionForStripe,
  getGameSessionRequestCount,
  deleteExpiredGameSessions,
} from '@/lib/supabase';

/**
 * GET /api/game-session
 *
 * Generate a one-time-use game session token for tournament play.
 * Database storage is REQUIRED - tokens must be validated on submission.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const stripeSessionId = searchParams.get('session_id');

    console.log('[game-session] Request received:', {
      stripeSessionId: stripeSessionId?.slice(0, 20) + '...',
    });

    if (!stripeSessionId) {
      console.log('[game-session] Missing session_id parameter');
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    // Validate directly against Stripe API
    let stripeSession;

    try {
      console.log('[game-session] Fetching Stripe session...');
      const stripe = getStripe();
      stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
      console.log('[game-session] Stripe session retrieved:', {
        payment_status: stripeSession.payment_status,
        metadata_type: stripeSession.metadata?.type,
      });
    } catch (stripeError) {
      console.error('[game-session] Stripe API error:', {
        message: stripeError instanceof Error ? stripeError.message : 'Unknown',
        error: stripeError,
      });
      return NextResponse.json(
        { error: 'Could not verify payment session' },
        { status: 400 }
      );
    }

    // Check payment status
    if (stripeSession.payment_status !== 'paid') {
      console.log('[game-session] Payment not completed:', stripeSession.payment_status);
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Check it's a tournament entry
    if (stripeSession.metadata?.type !== 'tournament_entry') {
      console.error('[game-session] Invalid session type:', stripeSession.metadata);
      return NextResponse.json(
        { error: 'Invalid session type' },
        { status: 400 }
      );
    }

    // Clean up expired sessions first
    await deleteExpiredGameSessions(stripeSessionId);

    // SECURITY: Rate limiting - max 2 requests per stripe session
    const requestCount = await getGameSessionRequestCount(stripeSessionId);
    if (requestCount >= 2) {
      console.log('[game-session] Rate limit exceeded:', { stripeSessionId: stripeSessionId.slice(0, 20), requestCount });
      return NextResponse.json(
        { error: 'Too many requests for this payment' },
        { status: 429 }
      );
    }

    // SECURITY: Check if stripe session already has ANY token (used or unused)
    const { session: existingSession, hasUsedSession } = await getAnyGameSessionForStripe(stripeSessionId);

    if (hasUsedSession) {
      // Payment already used - reject completely
      console.log('[game-session] Payment already used:', {
        stripeSessionId: stripeSessionId.slice(0, 20),
      });
      return NextResponse.json(
        { error: 'This payment has already been used' },
        { status: 400 }
      );
    }

    if (existingSession) {
      // Has unused token - check if still valid
      const isExpired = new Date(existingSession.expires_at) < new Date();
      if (!isExpired) {
        // Return existing valid token instead of creating new one
        console.log('[game-session] Returning existing token:', {
          existingToken: existingSession.token.slice(0, 8),
          expiresAt: existingSession.expires_at,
        });
        return NextResponse.json({
          token: existingSession.token,
          serverTime: Date.now(),
          expiresAt: existingSession.expires_at,
        });
      }
      // Token expired, will create new one below
    }

    // Generate token and store in database (REQUIRED)
    const token = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = new Date(now + GAME_CONSTANTS.SESSION_EXPIRY_MS).toISOString();
    const gameStartServerTime = new Date(now).toISOString();

    // Database storage is mandatory - fail if it fails
    const supabase = createServerClient();
    const { error: insertError } = await supabase.from('game_sessions').insert({
      token,
      stripe_session_id: stripeSessionId,
      expires_at: expiresAt,
      game_start_server_time: gameStartServerTime,
    });

    if (insertError) {
      console.error('[game-session] Database insert failed:', insertError.message);
      return NextResponse.json(
        { error: 'Failed to create game session' },
        { status: 500 }
      );
    }

    console.log('[game-session] Session stored in database');

    const duration = Date.now() - startTime;
    console.log('[game-session] Success in', duration, 'ms');

    // Return token with server time for synchronization
    return NextResponse.json({
      token,
      serverTime: Date.now(),
      expiresAt,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[game-session] Fatal error after', duration, 'ms:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create game session' },
      { status: 500 }
    );
  }
}
