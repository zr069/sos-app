/**
 * Server-Side Game Engine
 *
 * Deterministic game replay for score validation.
 * Uses exact same physics as client (FlappyBird.tsx).
 */

import { GAME_CONSTANTS as G, type GameInput } from './gameConstants';

// Level difficulty settings - MUST match client (FlappyBird.tsx)
const LEVEL_CONFIG = [
  { minScore: 0,  speed: 1.8, gap: 210 },  // Level 1
  { minScore: 15, speed: 2.1, gap: 195 },  // Level 2
  { minScore: 30, speed: 2.4, gap: 180 },  // Level 3
  { minScore: 45, speed: 2.7, gap: 168 },  // Level 4
  { minScore: 60, speed: 3.0, gap: 158 },  // Level 5
  { minScore: 75, speed: 3.3, gap: 150 },  // Level 6+
];

function getLevelConfig(score: number) {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (score >= LEVEL_CONFIG[i].minScore) {
      return LEVEL_CONFIG[i];
    }
  }
  return LEVEL_CONFIG[0];
}

export interface ReplayResult {
  score: number;
  valid: boolean;
  framesSimulated: number;
}

export interface AntiCheatResult {
  passed: boolean;
  flags: string[];
  autoReject: boolean;
}

/**
 * Replay a game from recorded inputs.
 * Returns the server-calculated score.
 */
export function replayGame(
  inputs: GameInput[],
  gameDurationMs: number
): ReplayResult {
  // Game state
  let birdY = G.BIRD_START_Y;
  let birdVelocity = G.BIRD_START_VELOCITY;
  let score = 0;
  let gameOver = false;

  // Pipe state
  const pipes: Array<{
    x: number;
    gapY: number;
    passed: boolean;
  }> = [];

  let lastPipeTime = 0;
  let inputIndex = 0;

  const totalFrames = Math.ceil(gameDurationMs / G.FRAME_MS);

  for (let frame = 0; frame < totalFrames && !gameOver; frame++) {
    const currentTimeMs = frame * G.FRAME_MS;

    // Apply gravity
    birdVelocity += G.GRAVITY;
    birdY += birdVelocity;

    // Check for flap inputs at this timestamp (±50ms tolerance)
    while (
      inputIndex < inputs.length &&
      inputs[inputIndex].timestamp <= currentTimeMs + 50
    ) {
      if (inputs[inputIndex].timestamp >= currentTimeMs - 50) {
        birdVelocity = G.FLAP_FORCE;
      }
      inputIndex++;
    }

    // Get level-based difficulty (same as client)
    const levelConfig = getLevelConfig(score);
    const pipeSpeed = levelConfig.speed;
    const pipeGap = levelConfig.gap;

    // Spawn new pipe
    if (currentTimeMs - lastPipeTime >= G.PIPE_INTERVAL_MS) {
      // Use deterministic pipe Y position based on frame count
      // Same algorithm must be used on client side
      const seed = frame * 9301 + 49297;
      const gapY = 100 + (seed % (G.CANVAS_HEIGHT - pipeGap - 200));
      pipes.push({ x: G.PIPE_START_X, gapY, passed: false });
      lastPipeTime = currentTimeMs;
    }

    // Move pipes
    for (const pipe of pipes) {
      pipe.x -= pipeSpeed;

      // Score when bird passes pipe
      if (!pipe.passed && pipe.x + G.PIPE_WIDTH < G.BIRD_X) {
        pipe.passed = true;
        score++;
      }
    }

    // Remove off-screen pipes
    const activePipes = pipes.filter(p => p.x + G.PIPE_WIDTH > 0);
    pipes.length = 0;
    pipes.push(...activePipes);

    // Collision detection - use forgiving hitbox (same as client)
    const collisionRadius = G.BIRD_SIZE * G.BIRD_COLLISION_FACTOR;

    // Floor and ceiling
    if (birdY - collisionRadius < 0 || birdY + collisionRadius > G.CANVAS_HEIGHT) {
      gameOver = true;
      break;
    }

    // Pipe collision
    for (const pipe of pipes) {
      const birdLeft = G.BIRD_X - collisionRadius;
      const birdRight = G.BIRD_X + collisionRadius;
      const birdTop = birdY - collisionRadius;
      const birdBottom = birdY + collisionRadius;

      if (birdRight > pipe.x && birdLeft < pipe.x + G.PIPE_WIDTH) {
        if (birdTop < pipe.gapY || birdBottom > pipe.gapY + pipeGap) {
          gameOver = true;
          break;
        }
      }
    }
  }

  return {
    score,
    valid: true,
    framesSimulated: totalFrames,
  };
}

/**
 * Analyze inputs for cheating patterns.
 * Returns flags and whether to auto-reject.
 */
export function analyzeInputs(
  inputs: GameInput[],
  gameDurationMs: number,
  claimedScore: number
): AntiCheatResult {
  const flags: string[] = [];
  let autoReject = false;

  // 1. Score sanity check
  if (claimedScore > G.MAX_VALID_SCORE) {
    flags.push(`score_exceeds_maximum:${claimedScore}`);
    autoReject = true;
  }

  // 2. Duration vs score check
  const minDuration = claimedScore * G.MIN_DURATION_PER_POINT;
  if (gameDurationMs < minDuration) {
    flags.push(`duration_too_short:${gameDurationMs}ms_for_score_${claimedScore}`);
    autoReject = true;
  }

  // 3. Input count sanity
  if (inputs.length < claimedScore * 0.3) {
    flags.push(`too_few_inputs:${inputs.length}_for_score_${claimedScore}`);
    autoReject = true;
  }

  // 4. Minimum flap interval (bot detection)
  const intervals: number[] = [];
  for (let i = 1; i < inputs.length; i++) {
    const interval = inputs[i].timestamp - inputs[i - 1].timestamp;
    if (interval < G.MIN_FLAP_INTERVAL_MS) {
      flags.push(`impossible_flap_interval:${interval}ms`);
      autoReject = true;
    }
    intervals.push(interval);
  }

  // 5. Standard deviation check (robotic timing)
  if (intervals.length > 5) {
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) =>
      a + Math.pow(b - mean, 2), 0) / intervals.length;
    const stddev = Math.sqrt(variance);

    if (stddev < G.BOT_STDDEV_THRESHOLD) {
      flags.push(`robotic_timing:stddev_${stddev.toFixed(1)}ms`);
      // Don't auto-reject, flag for manual review
    }
  }

  // 6. Flag high scores for manual review
  if (claimedScore > G.REVIEW_SCORE_THRESHOLD && !autoReject) {
    flags.push(`high_score_review_required:${claimedScore}`);
  }

  return {
    passed: !autoReject,
    flags,
    autoReject,
  };
}

/**
 * Validate score by comparing client claim to server replay.
 */
export function validateScore(
  inputs: GameInput[],
  gameDurationMs: number,
  claimedScore: number
): {
  valid: boolean;
  serverScore: number;
  flags: string[];
  reason?: string;
} {
  // First, analyze inputs for obvious cheating
  const antiCheat = analyzeInputs(inputs, gameDurationMs, claimedScore);

  if (antiCheat.autoReject) {
    return {
      valid: false,
      serverScore: 0,
      flags: antiCheat.flags,
      reason: 'ANTI_CHEAT_REJECTION',
    };
  }

  // Replay the game
  const replay = replayGame(inputs, gameDurationMs);

  // Compare scores within tolerance
  const scoreDiff = Math.abs(replay.score - claimedScore);
  if (scoreDiff > G.SCORE_REPLAY_TOLERANCE) {
    return {
      valid: false,
      serverScore: replay.score,
      flags: [...antiCheat.flags, `score_mismatch:claimed_${claimedScore}_server_${replay.score}`],
      reason: 'SCORE_MISMATCH',
    };
  }

  return {
    valid: true,
    serverScore: replay.score,
    flags: antiCheat.flags,
  };
}

// Re-export types
export type { GameInput };
