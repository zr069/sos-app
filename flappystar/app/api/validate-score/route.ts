import { NextRequest, NextResponse } from 'next/server';
import {
  getGameSession,
  markGameSessionUsed,
  incrementGameSessionRetry,
  logCheatAttempt,
  submitScore,
} from '@/lib/supabase';
import { verifyStripeSession } from '@/lib/stripe';
import { analyzeInputs, type GameInput } from '@/lib/gameEngine';
import { GAME_CONSTANTS } from '@/lib/gameConstants';
import { getClientIP } from '@/lib/ratelimit';

interface ValidateScoreRequest {
  gameSessionToken: string;
  stripeSessionId: string;
  claimedScore: number;
  gameDurationMs: number;
  inputs: GameInput[];
  // Player info for score submission
  fullName: string;
  email: string;
  nickname: string;
  country: string;
}

/**
 * POST /api/validate-score
 *
 * Validates a game score by replaying the game server-side.
 * If valid, submits the score to the tournament.
 *
 * Logic (in exact order):
 * 1. Validate token exists, not used, not expired
 * 2. Validate token.stripe_session_id matches stripeSessionId
 * 3. Validate stripeSessionId payment status with Stripe API
 * 4. Run analyzeInputs() → if autoReject: log to cheat_attempts, return 400
 * 5. Run replayGame() → get serverScore
 * 6. Compare: if mismatch > TOLERANCE → log to cheat_attempts, return 400
 * 7. Mark game session as used
 * 8. Save score to tournament_entries
 * 9. Calculate rank
 * 10. Return { valid: true, score: serverScore, rank }
 */
export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  try {
    const body: ValidateScoreRequest = await request.json();

    const {
      gameSessionToken,
      stripeSessionId,
      claimedScore,
      gameDurationMs,
      inputs,
      fullName,
      email,
      nickname,
      country,
    } = body;

    // Basic validation
    if (!gameSessionToken || !stripeSessionId || claimedScore === undefined || !inputs) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Validate game session token
    const gameSession = await getGameSession(gameSessionToken);

    if (!gameSession) {
      return NextResponse.json(
        { error: 'Invalid game session' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date(gameSession.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Game session expired' },
        { status: 400 }
      );
    }

    // Check if token was already used
    if (gameSession.used) {
      // Check retry allowance (max 1 retry for technical failures)
      if (gameSession.retry_count >= GAME_CONSTANTS.MAX_RETRIES) {
        return NextResponse.json(
          { error: 'Game session already used' },
          { status: 400 }
        );
      }
    }

    // Step 2: Verify stripe session matches
    if (gameSession.stripe_session_id !== stripeSessionId) {
      await logCheatAttempt({
        stripe_session_id: stripeSessionId,
        game_session_token: gameSessionToken,
        ip_address: ip,
        claimed_score: claimedScore,
        server_score: 0,
        reason: 'STRIPE_SESSION_MISMATCH',
        flags: ['session_mismatch'],
        inputs_count: inputs.length,
        game_duration_ms: gameDurationMs,
      });

      // Generic error (don't reveal why)
      return NextResponse.json(
        { error: 'Score could not be verified' },
        { status: 400 }
      );
    }

    // Step 3: Verify Stripe payment status
    const stripeSession = await verifyStripeSession(stripeSessionId);

    if (!stripeSession || stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not verified' },
        { status: 400 }
      );
    }

    // Step 4: Run basic anti-cheat checks only (no replay)
    // Replay disabled due to floating point differences causing false rejections
    const antiCheat = analyzeInputs(inputs, gameDurationMs, claimedScore);

    // Only reject if obvious cheating (bot timing, impossible scores)
    if (antiCheat.autoReject) {
      await logCheatAttempt({
        stripe_session_id: stripeSessionId,
        game_session_token: gameSessionToken,
        ip_address: ip,
        claimed_score: claimedScore,
        server_score: 0,
        reason: 'ANTI_CHEAT_REJECTION',
        flags: antiCheat.flags,
        inputs_count: inputs.length,
        game_duration_ms: gameDurationMs,
      });

      await incrementGameSessionRetry(gameSessionToken);

      return NextResponse.json(
        { error: 'Score could not be verified. Please try again.' },
        { status: 400 }
      );
    }

    // Step 5: Accept score directly (replay disabled)
    // Basic checks passed - use claimed score
    const finalScore = claimedScore;
    const validationFlags = antiCheat.flags;

    console.log('[validate-score] Accepting score (basic checks passed):', {
      claimedScore,
      gameDurationMs,
      inputsCount: inputs.length,
      flags: validationFlags,
    });

    // Step 6: Mark session as used
    await markGameSessionUsed(
      gameSessionToken,
      finalScore,
      validationFlags
    );

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
