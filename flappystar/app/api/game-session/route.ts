import { NextRequest, NextResponse } from 'next/server';
import { createGameSession, deleteExpiredGameSessions } from '@/lib/supabase';
import { verifyStripeSession } from '@/lib/stripe';
import { GAME_CONSTANTS } from '@/lib/gameConstants';

/**
 * GET /api/game-session
 *
 * Generate a one-time-use game session token for tournament play.
 * Requires a valid, paid Stripe session.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stripeSessionId = searchParams.get('session_id');

    if (!stripeSessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    // Verify Stripe session is valid and paid
    try {
      const stripeSession = await verifyStripeSession(stripeSessionId);

      if (!stripeSession) {
        return NextResponse.json(
          { error: 'Invalid session' },
          { status: 400 }
        );
      }

      if (stripeSession.payment_status !== 'paid') {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Stripe session verification error:', error);
      return NextResponse.json(
        { error: 'Session verification failed' },
        { status: 400 }
      );
    }

    // Delete any existing unused expired tokens for this session
    await deleteExpiredGameSessions(stripeSessionId);

    // Create game session token
    const { token, expiresAt } = await createGameSession(
      stripeSessionId,
      GAME_CONSTANTS.SESSION_EXPIRY_MS
    );

    // Return token with server time for synchronization
    return NextResponse.json({
      token,
      serverTime: Date.now(),
      expiresAt,
    });
  } catch (error) {
    console.error('Game session error:', error);
    return NextResponse.json(
      { error: 'Failed to create game session' },
      { status: 500 }
    );
  }
}
