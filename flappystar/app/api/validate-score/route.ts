import { NextRequest, NextResponse } from 'next/server';
import {
  getGameSession,
  markGameSessionUsed,
  submitScore,
  logCheatAttempt,
  hasExistingTournamentEntry,
  cleanupRateLimitRecords,
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
  canvasWidth?: number;
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

  // Cleanup old rate limit records occasionally
  if (Math.random() < 0.1) cleanupRateLimitRecords();

  try {
    // SECURITY: Rate limit by IP - disabled (in-memory, ineffective on serverless)
    // const rateLimit = checkValidationRateLimit(ip);
    // if (!rateLimit.allowed) {
    //   return NextResponse.json(
    //     { error: 'Too many attempts. Please wait before trying again.' },
    //     { status: 429 }
    //   );
    // }

    const body: ValidateScoreRequest = await request.json();

    const {
      gameSessionToken,
      stripeSessionId,
      claimedScore,
      gameDurationMs,
      inputs,
      canvasWidth,
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

    // SECURITY: Check if score already submitted for this stripe session
    const alreadySubmitted = await hasExistingTournamentEntry(stripeSessionId);
    if (alreadySubmitted) {
      console.log('[validate-score] Score already submitted for this payment:', stripeSessionId.slice(0, 20));
      return NextResponse.json(
        { error: 'Score already submitted for this payment' },
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

    // SECURITY: Hard cap score at 500 (realistic max)
    if (claimedScore < 0 || claimedScore > 500) {
      console.log('[validate-score] Score out of range:', claimedScore);
      return NextResponse.json(
        { error: 'Score could not be verified' },
        { status: 400 }
      );
    }

    // SECURITY: Check gameDurationMs is realistic (at least 1500ms per point)
    // Real game: pipes spawn every ~1.5s at base speed, gets faster at higher scores
    if (claimedScore > 0 && (!gameDurationMs || gameDurationMs < claimedScore * 1500)) {
      console.log('[validate-score] Invalid duration:', { claimedScore, gameDurationMs, minRequired: claimedScore * 1500 });
      await logCheatAttempt({
        stripe_session_id: stripeSessionId,
        game_session_token: gameSessionToken,
        ip_address: ip,
        claimed_score: claimedScore,
        server_score: 0,
        reason: 'INVALID_DURATION',
        flags: ['invalid_duration'],
        inputs_count: inputs?.length || 0,
        game_duration_ms: gameDurationMs || 0,
      });
      return NextResponse.json(
        { error: 'Score could not be verified' },
        { status: 400 }
      );
    }

    // SECURITY: Check inputs array has reasonable count (at least 1.5 flap inputs per point)
    // Real gameplay needs ~2 flaps per pipe to navigate gaps
    const flapCount = inputs ? inputs.filter(i => i.type === 'flap').length : 0;
    const minInputsRequired = Math.max(1, Math.floor(claimedScore * 1.5));
    if (claimedScore > 0 && flapCount < minInputsRequired) {
      console.log('[validate-score] Insufficient flap inputs:', { claimedScore, flapCount, minRequired: minInputsRequired });
      await logCheatAttempt({
        stripe_session_id: stripeSessionId,
        game_session_token: gameSessionToken,
        ip_address: ip,
        claimed_score: claimedScore,
        server_score: 0,
        reason: 'INSUFFICIENT_INPUTS',
        flags: ['insufficient_inputs'],
        inputs_count: inputs?.length || 0,
        game_duration_ms: gameDurationMs || 0,
      });
      return NextResponse.json(
        { error: 'Score could not be verified' },
        { status: 400 }
      );
    }

    // SECURITY: Bot detection - analyze timing patterns
    // First, filter duplicate inputs caused by simultaneous touch events on mobile
    // (touchstart + pointerdown fire at the same time, producing 0ms intervals)
    const filteredInputs = inputs ? inputs.filter((input, i) => {
      if (i === 0) return true;
      return input.timestamp - inputs[i - 1].timestamp >= 50;
    }) : [];

    if (filteredInputs.length > 5) {
      const intervals: number[] = [];
      for (let i = 1; i < filteredInputs.length; i++) {
        intervals.push(filteredInputs[i].timestamp - filteredInputs[i - 1].timestamp);
      }

      // Check minimum interval (human can't tap faster than 50ms, after dedup filtering)
      const minInterval = Math.min(...intervals);
      if (minInterval < 50) {
        console.log('[validate-score] Superhuman tap speed:', { minInterval });
        await logCheatAttempt({
          stripe_session_id: stripeSessionId,
          game_session_token: gameSessionToken,
          ip_address: ip,
          claimed_score: claimedScore,
          server_score: 0,
          reason: 'SUPERHUMAN_SPEED',
          flags: [`min_interval_${minInterval}ms`],
          inputs_count: inputs.length,
          game_duration_ms: gameDurationMs || 0,
        });
        return NextResponse.json(
          { error: 'Score could not be verified' },
          { status: 400 }
        );
      }

      // Calculate standard deviation of intervals
      const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
      const stddev = Math.sqrt(variance);

      // Only block VERY robotic timing with MANY inputs
      if (stddev < 5 && intervals.length > 20) {
        console.log('[validate-score] Robotic timing detected:', { stddev, mean, intervalsCount: intervals.length });
        await logCheatAttempt({
          stripe_session_id: stripeSessionId,
          game_session_token: gameSessionToken,
          ip_address: ip,
          claimed_score: claimedScore,
          server_score: 0,
          reason: 'ROBOTIC_TIMING',
          flags: [`stddev_${stddev.toFixed(1)}ms`],
          inputs_count: inputs.length,
          game_duration_ms: gameDurationMs || 0,
        });
        return NextResponse.json(
          { error: 'Score could not be verified' },
          { status: 400 }
        );
      }

      // Check for perfectly repeating patterns (e.g., alternating 150ms and 1050ms)
      // Round intervals to nearest 50ms and count unique values
      // Only block if MANY inputs with only 2 unique intervals
      const roundedIntervals = intervals.map((i) => Math.round(i / 50) * 50);
      const uniqueIntervals = new Set(roundedIntervals);
      if (uniqueIntervals.size <= 2 && intervals.length > 30) {
        console.log('[validate-score] Pattern attack detected:', {
          uniqueIntervals: Array.from(uniqueIntervals),
          intervalsCount: intervals.length,
        });
        await logCheatAttempt({
          stripe_session_id: stripeSessionId,
          game_session_token: gameSessionToken,
          ip_address: ip,
          claimed_score: claimedScore,
          server_score: 0,
          reason: 'PATTERN_DETECTED',
          flags: [`unique_intervals_${uniqueIntervals.size}`],
          inputs_count: inputs.length,
          game_duration_ms: gameDurationMs || 0,
        });
        return NextResponse.json(
          { error: 'Score could not be verified' },
          { status: 400 }
        );
      }
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

    // NOTE: Session is marked as used AFTER validation completes
    // This allows legitimate players to retry if they have connection issues

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

    // SECURITY: Check gameDurationMs is enough time to achieve the score
    // gameDurationMs is the actual game duration, not time since session was created
    // (session is created on page load, not when game starts)
    const minTimeRequired = claimedScore * 1000; // at least 1 second per point

    if (claimedScore > 0 && gameDurationMs < minTimeRequired) {
      console.log('[validate-score] Impossible time:', {
        claimedScore,
        gameDurationMs,
        minTimeRequired,
      });
      await logCheatAttempt({
        stripe_session_id: stripeSessionId,
        game_session_token: gameSessionToken,
        ip_address: ip,
        claimed_score: claimedScore,
        server_score: 0,
        reason: 'IMPOSSIBLE_TIME',
        flags: ['impossible_time'],
        inputs_count: inputs?.length || 0,
        game_duration_ms: gameDurationMs,
      });
      return NextResponse.json(
        { error: 'Score could not be verified' },
        { status: 400 }
      );
    }

    // SECURITY: Server-side wall-clock check
    // The time between session creation and score submission must be >= claimed game duration
    // A cheater who grabs a token and immediately submits can't fake this
    const gameStartTime = new Date(gameSession.game_start_server_time).getTime();
    const now = Date.now();
    const elapsedMs = now - gameStartTime;
    // Allow 5 seconds grace for network latency + page load before clicking play
    const minimumElapsed = Math.max(0, gameDurationMs - 5000);

    if (claimedScore > 0 && elapsedMs < minimumElapsed) {
      console.log('[validate-score] Wall-clock mismatch:', {
        claimedScore,
        elapsedMs,
        gameDurationMs,
        minimumElapsed,
      });
      await logCheatAttempt({
        stripe_session_id: stripeSessionId,
        game_session_token: gameSessionToken,
        ip_address: ip,
        claimed_score: claimedScore,
        server_score: 0,
        reason: `Wall-clock mismatch: ${elapsedMs}ms elapsed but claimed ${gameDurationMs}ms game`,
        flags: ['wallclock_hack'],
        inputs_count: inputs?.length || 0,
        game_duration_ms: gameDurationMs,
      });
      return NextResponse.json(
        { error: 'Score could not be verified' },
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
    const validation = validateScore(inputs || [], gameDurationMs, claimedScore, canvasWidth);

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
        { error: 'Score could not be verified' },
        { status: 400 }
      );
    }

    // Get multiplier from Stripe session metadata
    const multiplier = parseInt(stripeSession.metadata?.multiplier || '1', 10);
    const validMultiplier = [1, 2, 3, 5].includes(multiplier) ? multiplier : 1;

    // Apply multiplier to final score
    const originalScore = validation.serverScore;
    const finalScore = originalScore * validMultiplier;

    console.log('[validate-score] Accepting score:', {
      originalScore,
      multiplier: validMultiplier,
      finalScore,
      flags: validation.flags,
    });

    // Step 5: Update session with final validated score
    await markGameSessionUsed(gameSessionToken, finalScore, ['validated', ...validation.flags]);

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
      originalScore,
      multiplier: validMultiplier,
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
