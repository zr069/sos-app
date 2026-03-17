import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { isSessionUsed } from '@/lib/supabase';
import { isSessionLocked } from '@/lib/redis';
import { validateSessionSchema } from '@/lib/validations';

/**
 * GET /api/validate-session
 *
 * Validates a Stripe session for tournament play.
 * Checks:
 * 1. Stripe payment is completed
 * 2. Session hasn't been used to submit a score yet
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    // Validate input
    const validation = validateSessionSchema.safeParse({ session_id });
    if (!validation.success) {
      return NextResponse.json(
        { valid: false, reason: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    const sessionId = validation.data.session_id;

    // 1. Validate directly against Stripe API
    const stripe = getStripe();
    let stripeSession;

    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeError) {
      console.error('Stripe API error in validate-session:', stripeError);
      return NextResponse.json(
        { valid: false, reason: 'Could not verify payment' },
        { status: 400 }
      );
    }

    // Check payment completed
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { valid: false, reason: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Check it's a tournament entry
    if (stripeSession.metadata?.type !== 'tournament_entry') {
      return NextResponse.json(
        { valid: false, reason: 'Invalid session type' },
        { status: 400 }
      );
    }

    // 2. Check Redis lock (quick check for already used)
    try {
      const isLocked = await isSessionLocked(sessionId);
      if (isLocked) {
        return NextResponse.json(
          { valid: false, reason: 'Session already used' },
          { status: 400 }
        );
      }
    } catch (redisError) {
      // Redis error is non-fatal, continue to DB check
      console.warn('Redis check failed:', redisError);
    }

    // 3. Check database (authoritative check - score already submitted?)
    try {
      const isUsed = await isSessionUsed(sessionId);
      if (isUsed) {
        return NextResponse.json(
          { valid: false, reason: 'Session already used' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      // Database error - log but allow game to proceed
      // Better to allow a potential duplicate attempt (which DB will catch)
      // than to block a legitimate user
      console.error('Database check error:', dbError);
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Validate session error:', error);
    return NextResponse.json(
      { valid: false, reason: 'Server error' },
      { status: 500 }
    );
  }
}
