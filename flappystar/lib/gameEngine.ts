/**
 * Server-side Game Engine for FlappyStar
 *
 * Replays game inputs to validate scores.
 * Uses IDENTICAL physics to FlappyBird.tsx client.
 *
 * CRITICAL: Keep in sync with:
 * - lib/gameConstants.ts (physics values)
 * - components/game/FlappyBird.tsx (LEVEL_CONFIG, pipe spawning)
 */

import {
  GAME_CONSTANTS as G,
  getPipeGapY,
  type GameInput,
} from './gameConstants';

// Level difficulty - MUST match FlappyBird.tsx exactly
const LEVEL_CONFIG = [
  { minScore: 0, speed: 2.2, gap: 200 }, // Level 1
  { minScore: 15, speed: 2.5, gap: 188 }, // Level 2
  { minScore: 30, speed: 2.8, gap: 176 }, // Level 3
  { minScore: 45, speed: 3.1, gap: 165 }, // Level 4
  { minScore: 60, speed: 3.4, gap: 156 }, // Level 5
  { minScore: 75, speed: 3.7, gap: 148 }, // Level 6+
];

function getLevelConfig(score: number) {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (score >= LEVEL_CONFIG[i].minScore) {
      return LEVEL_CONFIG[i];
    }
  }
  return LEVEL_CONFIG[0];
}

interface ServerPipe {
  x: number;
  gapY: number;
  gapHeight: number;
  passed: boolean;
}

interface ReplayResult {
  score: number;
  valid: boolean;
  reason?: string;
  frameCount: number;
  collisionFrame?: number;
}

/**
 * Replay a game from recorded inputs
 *
 * @param inputs - Array of flap inputs with timestamps
 * @param gameDurationMs - Total game duration in milliseconds
 * @returns Replay result with score and validity
 */
export function replayGame(
  inputs: GameInput[],
  gameDurationMs: number
): ReplayResult {
  // Simulation state
  let birdY = G.BIRD_START_Y;
  let birdVelocity = G.BIRD_START_VELOCITY;
  const pipes: ServerPipe[] = [];
  let score = 0;
  let frameCount = 0;
  let firstPipeSpawned = false;

  // Sort inputs by timestamp (defensive)
  const sortedInputs = [...inputs].sort((a, b) => a.timestamp - b.timestamp);
  let inputIndex = 0;

  // Canvas dimensions for pipe spawning (matches client)
  const canvasWidth = G.CANVAS_WIDTH;

  // Simulate at 60fps
  const FRAME_MS = G.FRAME_MS; // ~16.67ms
  const maxFrames = Math.ceil(gameDurationMs / FRAME_MS) + 10; // Allow slight overage

  for (let frame = 0; frame < maxFrames; frame++) {
    frameCount = frame;
    const currentTimeMs = frame * FRAME_MS;

    // Apply any inputs at this timestamp
    while (
      inputIndex < sortedInputs.length &&
      sortedInputs[inputIndex].timestamp <= currentTimeMs
    ) {
      birdVelocity = G.FLAP_FORCE;
      inputIndex++;
    }

    // Update bird physics (delta-time normalized to 60fps = 1.0)
    birdVelocity += G.GRAVITY;
    birdY += birdVelocity;

    // Get level-based difficulty
    const levelConfig = getLevelConfig(score);
    const pipeGap = levelConfig.gap;
    const pipeSpeed = levelConfig.speed;

    // Distance-based pipe spawning (matches FlappyBird.tsx)
    const MIN_PIPE_DISTANCE = canvasWidth * 0.75;
    const FIRST_PIPE_DISTANCE = canvasWidth * 0.4;
    const PIPE_SPAWN_X = canvasWidth + G.PIPE_WIDTH;

    const lastPipe = pipes[pipes.length - 1];
    const lastPipeX = lastPipe ? lastPipe.x : -9999;

    let shouldSpawnPipe = false;
    if (!firstPipeSpawned) {
      // First pipe after bird travels 40% of canvas
      const distanceTraveled = frame * pipeSpeed * 0.5;
      if (distanceTraveled >= FIRST_PIPE_DISTANCE) {
        shouldSpawnPipe = true;
        firstPipeSpawned = true;
      }
    } else {
      // Subsequent pipes based on distance
      if (lastPipeX <= PIPE_SPAWN_X - MIN_PIPE_DISTANCE) {
        shouldSpawnPipe = true;
      }
    }

    if (shouldSpawnPipe) {
      const gapY = getPipeGapY(frame, pipeGap);
      pipes.push({
        x: PIPE_SPAWN_X,
        gapY,
        gapHeight: pipeGap,
        passed: false,
      });
    }

    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
      const pipe = pipes[i];
      pipe.x -= pipeSpeed;

      // Score when passing pipe
      if (!pipe.passed && pipe.x + G.PIPE_WIDTH < G.BIRD_X) {
        pipe.passed = true;
        score++;

        // Max score cap
        if (score >= 999) {
          return {
            score: 999,
            valid: true,
            frameCount,
          };
        }
      }

      // Remove off-screen pipes
      if (pipe.x < -G.PIPE_WIDTH) {
        pipes.splice(i, 1);
      }
    }

    // Check collision
    const collisionRadius = G.BIRD_SIZE * G.BIRD_COLLISION_FACTOR;
    const birdLeft = G.BIRD_X - collisionRadius;
    const birdRight = G.BIRD_X + collisionRadius;
    const birdTop = birdY - collisionRadius;
    const birdBottom = birdY + collisionRadius;

    // Floor and ceiling
    if (birdTop < 0 || birdBottom > G.CANVAS_HEIGHT) {
      return {
        score,
        valid: true,
        reason: 'collision_boundary',
        frameCount,
        collisionFrame: frame,
      };
    }

    // Pipe collision
    for (const pipe of pipes) {
      if (birdRight > pipe.x && birdLeft < pipe.x + G.PIPE_WIDTH) {
        if (birdTop < pipe.gapY || birdBottom > pipe.gapY + pipe.gapHeight) {
          return {
            score,
            valid: true,
            reason: 'collision_pipe',
            frameCount,
            collisionFrame: frame,
          };
        }
      }
    }

    // Check if we've simulated past game duration
    if (currentTimeMs > gameDurationMs + 100) {
      break;
    }
  }

  return {
    score,
    valid: true,
    frameCount,
  };
}

/**
 * Validate a score submission
 *
 * @param inputs - Recorded game inputs
 * @param gameDurationMs - Total game duration
 * @param claimedScore - Score claimed by client
 * @returns Validation result
 */
export function validateScore(
  inputs: GameInput[],
  gameDurationMs: number,
  claimedScore: number
): {
  valid: boolean;
  serverScore: number;
  reason?: string;
  flags: string[];
} {
  const flags: string[] = [];

  // Basic sanity checks
  if (inputs.length > 2000) {
    return {
      valid: false,
      serverScore: 0,
      reason: 'Too many inputs (bot protection)',
      flags: ['excessive_inputs'],
    };
  }

  if (gameDurationMs < 5000) {
    return {
      valid: false,
      serverScore: 0,
      reason: 'Game too short (minimum 5 seconds)',
      flags: ['too_short'],
    };
  }

  if (claimedScore < 0 || claimedScore > 999) {
    return {
      valid: false,
      serverScore: 0,
      reason: 'Invalid score range',
      flags: ['invalid_score'],
    };
  }

  // Can't score without flapping (need at least 1 flap per point roughly)
  if (inputs.length < claimedScore * 0.5) {
    flags.push('low_input_ratio');
  }

  // Impossibly fast scoring (less than 800ms per point)
  if (claimedScore > 0 && gameDurationMs < claimedScore * 800) {
    return {
      valid: false,
      serverScore: 0,
      reason: 'Score achieved too quickly',
      flags: ['speed_hack'],
    };
  }

  // Replay the game
  const replay = replayGame(inputs, gameDurationMs);

  // Check if replay score matches claimed score (allow tolerance of 2)
  const scoreDiff = Math.abs(replay.score - claimedScore);
  if (scoreDiff > 2) {
    flags.push('score_mismatch');
    return {
      valid: false,
      serverScore: replay.score,
      reason: `Score mismatch: claimed ${claimedScore}, replayed ${replay.score}`,
      flags,
    };
  }

  // Use the SERVER's replayed score, not client claimed score
  return {
    valid: true,
    serverScore: replay.score,
    flags,
  };
}
