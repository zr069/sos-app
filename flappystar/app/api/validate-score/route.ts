import { NextRequest, NextResponse } from 'next/server';
import {
  getGameSession,
  markGameSessionUsed,
  submitScore,
  logCheatAttempt,
} from '@/lib/supabase';
import { verifyStripeSession } from '@/lib/stripe';
import { getClientIP } from '@/lib/ratelimit';
import { validateScore } from '@/lib/gameEngine';
import type { GameInput } from '@/lib/gameConstants';

interface ValidateScoreRequest {
  gameSessionToken: string;
  stripeSessionId: string;
  claimedScore: number;
  gameDurationMs: number;
  inputs: GameInput[];
  fullName: string;
  email: string;
  nickname: string;
  country: string;
}

/**
 * POST /api/validate-score
 *
 * Server-side replay validation of game inputs.
 * Replays game to verify score matches claimed score.
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

    console.log('[validate-score] Request:', {
      gameSessionToken: gameSessionToken?.slice(0, 8),
      claimedScore,
      inputsCount: inputs?.length,
      gameDurationMs,
    });

    // Basic field validation
    if (!gameSessionToken || !stripeSessionId || claimedScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Bot protection: reject excessive inputs
    if (inputs && inputs.length > 2000) {
      console.log('[validate-score] Too many inputs:', inputs.length);
      await logCheatAttempt({
        stripe_session_id: stripeSessionId,
        game_session_token: gameSessionToken,
        ip_address: ip,
        claimed_score: claimedScore,
        server_score: 0,
        reason: 'Too many inputs (bot protection)',
        flags: ['excessive_inputs'],
        inputs_count: inputs.length,
        game_duration_ms: gameDurationMs || 0,
      });
      return NextResponse.json(
        { error: 'Invalid game data' },
        { status: 400 }
      );
    }

    // Minimum game duration check - disabled for now
    // if (gameDurationMs && gameDurationMs < 5000) {
    //   console.log('[validate-score] Game too short:', gameDurationMs);
    //   return NextResponse.json(
    //     { error: 'Game too short' },
    //     { status: 400 }
    //   );
    // }

    // Step 1: Check score is valid range (0-999)
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

    // FIX 3: Verify token was generated for this stripe session
    if (gameSession.stripe_session_id !== stripeSessionId) {
      console.log('[validate-score] Stripe session mismatch:', {
        tokenStripeSession: gameSession.stripe_session_id?.slice(0, 20),
        requestStripeSession: stripeSessionId?.slice(0, 20),
      });
      await logCheatAttempt({
        stripe_session_id: stripeSessionId,
        game_session_token: gameSessionToken,
        ip_address: ip,
        claimed_score: claimedScore,
        server_score: 0,
        reason: 'Token/payment session mismatch',
        flags: ['session_mismatch'],
        inputs_count: inputs?.length || 0,
        game_duration_ms: gameDurationMs,
      });
      return NextResponse.json(
        { error: 'Invalid game session' },
        { status: 400 }
      );
    }

    // Server-side timestamp check - minimum time based on score
    // A score of N requires minimum N * 1200ms (1.2 seconds per point)
    const gameStartTime = new Date(gameSession.game_start_server_time).getTime();
    const now = Date.now();
    const elapsedMs = now - gameStartTime;
    const minimumRequiredMs = claimedScore * 1200; // 1.2 seconds per point

    if (claimedScore > 0 && elapsedMs < minimumRequiredMs) {
      console.log('[validate-score] Score achieved too fast:', {
        claimedScore,
        elapsedMs,
        minimumRequiredMs,
        gameStartServerTime: gameSession.game_start_server_time,
      });
      await logCheatAttempt({
        stripe_session_id: stripeSessionId,
        game_session_token: gameSessionToken,
        ip_address: ip,
        claimed_score: claimedScore,
        server_score: 0,
        reason: `Score achieved too fast: ${elapsedMs}ms < ${minimumRequiredMs}ms required`,
        flags: ['timestamp_hack'],
        inputs_count: inputs?.length || 0,
        game_duration_ms: gameDurationMs,
      });
      return NextResponse.json(
        { error: 'Invalid game timing' },
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

    // Step 4: Replay game to validate score
    const validation = validateScore(inputs || [], gameDurationMs, claimedScore);

    if (!validation.valid) {
      console.log('[validate-score] Validation failed:', validation.reason);

      // Log cheat attempt
      await logCheatAttempt({
        stripe_session_id: stripeSessionId,
        game_session_token: gameSessionToken,
        ip_address: ip,
        claimed_score: claimedScore,
        server_score: validation.serverScore,
        reason: validation.reason || 'Unknown',
        flags: validation.flags,
        inputs_count: inputs?.length || 0,
        game_duration_ms: gameDurationMs,
      });

      return NextResponse.json(
        { error: 'Score validation failed', reason: validation.reason },
        { status: 400 }
      );
    }

    // Use SERVER's replayed score, not client claimed score
    const finalScore = validation.serverScore;

    console.log('[validate-score] Accepting score:', finalScore, 'flags:', validation.flags);

    // Step 5: Mark session as used
    await markGameSessionUsed(gameSessionToken, finalScore, validation.flags);

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
