import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { GAME_CONSTANTS } from '@/lib/gameConstants';

/**
 * GET /api/game-session
 *
 * Generate a one-time-use game session token for tournament play.
 * Validates ONLY against Stripe API - no database dependency.
 * The tournament_entries record is created AFTER the game is played.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const stripeSessionId = searchParams.get('session_id');

    console.log('[game-session] Request received:', { stripeSessionId: stripeSessionId?.slice(0, 20) + '...' });

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

    // Generate a simple token without database dependency
    // This allows the game to work even without Supabase configured
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + GAME_CONSTANTS.SESSION_EXPIRY_MS).toISOString();

    // Try to store in database (optional - game works without it)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Clean up expired sessions first
        await supabase
          .from('game_sessions')
          .delete()
          .eq('stripe_session_id', stripeSessionId)
          .eq('used', false)
          .lt('expires_at', new Date().toISOString());

        // Insert new session
        const { error: insertError } = await supabase.from('game_sessions').insert({
          token,
          stripe_session_id: stripeSessionId,
          expires_at: expiresAt,
        });

        if (insertError) {
          console.warn('[game-session] DB insert warning (non-fatal):', insertError.message);
          // Continue anyway - token is valid
        } else {
          console.log('[game-session] Session stored in database');
        }
      } else {
        console.log('[game-session] Supabase not configured, skipping DB storage');
      }
    } catch (dbError) {
      console.warn('[game-session] DB operation failed (non-fatal):', dbError);
      // Continue anyway - the token is still valid for this session
    }

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
