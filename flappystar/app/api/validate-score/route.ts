import { NextRequest, NextResponse } from 'next/server';
import {
  getGameSession,
  markGameSessionUsed,
  submitScore,
} from '@/lib/supabase';
import { verifyStripeSession } from '@/lib/stripe';
import { getClientIP } from '@/lib/ratelimit';

interface ValidateScoreRequest {
  gameSessionToken: string;
  stripeSessionId: string;
  claimedScore: number;
  gameDurationMs: number;
  inputs: unknown[];
  fullName: string;
  email: string;
  nickname: string;
  country: string;
}

/**
 * POST /api/validate-score
 *
 * MINIMAL VALIDATION - anti-cheat disabled for now.
 * Just checks: paid + score between 1-999 = accept.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  try {
    const body: ValidateScoreRequest = await request.json();

    const {
      gameSessionToken,
      stripeSessionId,
      claimedScore,
      fullName,
      email,
      nickname,
      country,
    } = body;

    console.log('[validate-score] Request:', { gameSessionToken: gameSessionToken?.slice(0, 8), claimedScore });

    // Basic field validation
    if (!gameSessionToken || !stripeSessionId || claimedScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Check score is valid range (1-999)
    if (claimedScore < 0 || claimedScore >= 1000) {
      return NextResponse.json(
        { error: 'Invalid score' },
        { status: 400 }
      );
    }

    // Step 2: Validate game session token exists and not expired
    const gameSession = await getGameSession(gameSessionToken);

    if (!gameSession) {
      console.log('[validate-score] Invalid game session');
      return NextResponse.json(
        { error: 'Invalid game session' },
        { status: 400 }
      );
    }

    if (new Date(gameSession.expires_at) < new Date()) {
      console.log('[validate-score] Session expired');
      return NextResponse.json(
        { error: 'Game session expired' },
        { status: 400 }
      );
    }

    if (gameSession.used) {
      console.log('[validate-score] Session already used');
      return NextResponse.json(
        { error: 'Game session already used' },
        { status: 400 }
      );
    }

    // Step 3: Verify Stripe payment is paid
    const stripeSession = await verifyStripeSession(stripeSessionId);

    if (!stripeSession || stripeSession.payment_status !== 'paid') {
      console.log('[validate-score] Payment not verified');
      return NextResponse.json(
        { error: 'Payment not verified' },
        { status: 400 }
      );
    }

    // Step 4: Accept score - no anti-cheat for now
    const finalScore = claimedScore;

    console.log('[validate-score] Accepting score:', finalScore);

    // Step 5: Mark session as used
    await markGameSessionUsed(gameSessionToken, finalScore, []);

    // Step 7: Submit score to tournament
    const submissionResult = await submitScore({
      stripe_session_id: stripeSessionId,
      full_name: fullName,
      email: email,
      nickname: nickname,
      country: country,
      score: finalScore,
      ip_address: ip,
    });

    if (submissionResult.duplicate) {
      return NextResponse.json(
        { error: 'Score already submitted' },
        { status: 400 }
      );
    }

    // Step 8: Return success with rank
    return NextResponse.json({
      valid: true,
      score: finalScore,
      rank: submissionResult.rank,
    });
  } catch (error) {
    console.error('Score validation error:', error);

    return NextResponse.json(
      { error: 'Validation failed. Please try again.' },
      { status: 500 }
    );
  }
}
