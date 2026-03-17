import { NextRequest, NextResponse } from 'next/server';
import { createGameSession, deleteExpiredGameSessions } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { GAME_CONSTANTS } from '@/lib/gameConstants';

/**
 * GET /api/game-session
 *
 * Generate a one-time-use game session token for tournament play.
 * Validates ONLY against Stripe API - no database checks here.
 * The tournament_entries record is created AFTER the game is played.
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

    // Validate directly against Stripe API
    const stripe = getStripe();
    let stripeSession;

    try {
      stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return NextResponse.json(
        { error: 'Could not verify payment session' },
        { status: 400 }
      );
    }

    // Check payment status
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Check it's a tournament entry (optional - for extra security)
    if (stripeSession.metadata?.type !== 'tournament_entry') {
      console.error('Invalid session type:', stripeSession.metadata);
      return NextResponse.json(
        { error: 'Invalid session type' },
        { status: 400 }
      );
    }

    // Clean up any expired tokens for this session
    try {
      await deleteExpiredGameSessions(stripeSessionId);
    } catch (cleanupError) {
      // Non-fatal, continue
      console.warn('Failed to clean up expired sessions:', cleanupError);
    }

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
