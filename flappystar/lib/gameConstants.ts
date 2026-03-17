/**
 * Flappy Star Game Constants
 *
 * CRITICAL: These values are used by BOTH client (FlappyBird.tsx)
 * and server (gameEngine.ts) for deterministic gameplay.
 *
 * DO NOT modify these values without updating both implementations.
 * Any change here affects score validation.
 */

export const GAME_CONSTANTS = {
  // Physics - classic Flappy Bird feel
  GRAVITY: 0.3 as number,
  FLAP_FORCE: -7 as number,
  BIRD_X: 80 as number,
  BIRD_SIZE: 20 as number,
  BIRD_START_Y: 300 as number,
  BIRD_START_VELOCITY: 0 as number,

  // Pipes - comfortable, classic pacing
  PIPE_WIDTH: 60 as number,
  PIPE_GAP_START: 200 as number,
  PIPE_GAP_MIN: 160 as number,
  PIPE_GAP_DECREASE_PER_10: 1 as number,
  PIPE_SPEED_START: 2 as number,
  PIPE_SPEED_INCREASE_PER_10: 0.05 as number,
  PIPE_INTERVAL_MS: 2200 as number,
  PIPE_START_X: 480 as number,

  // Canvas (logical units)
  CANVAS_WIDTH: 400 as number,
  CANVAS_HEIGHT: 600 as number,

  // Timing
  FPS: 60 as number,
  FRAME_MS: (1000 / 60) as number,

  // Anti-cheat thresholds
  MAX_VALID_SCORE: 500 as number,        // auto-reject above this
  REVIEW_SCORE_THRESHOLD: 200 as number, // flag for manual review
  MIN_FLAP_INTERVAL_MS: 100 as number,   // humanly impossible below this
  BOT_STDDEV_THRESHOLD: 20 as number,    // ms - suspiciously robotic
  MIN_DURATION_PER_POINT: 1200 as number, // ms per score point minimum
  SCORE_REPLAY_TOLERANCE: 2 as number,   // allowed difference client vs server

  // Session management
  SESSION_EXPIRY_MS: 30 * 60 * 1000 as number, // 30 minutes
  MAX_RETRIES: 1 as number,
};

// Convenience exports for backward compatibility
export const GRAVITY = GAME_CONSTANTS.GRAVITY;
export const FLAP_FORCE = GAME_CONSTANTS.FLAP_FORCE;
export const BIRD_RADIUS = GAME_CONSTANTS.BIRD_SIZE;
export const BIRD_X = GAME_CONSTANTS.BIRD_X;
export const PIPE_WIDTH = GAME_CONSTANTS.PIPE_WIDTH;
export const PIPE_GAP_START = GAME_CONSTANTS.PIPE_GAP_START;
export const PIPE_GAP_MIN = GAME_CONSTANTS.PIPE_GAP_MIN;
export const PIPE_BASE_SPEED = GAME_CONSTANTS.PIPE_SPEED_START;
export const PIPE_SPAWN_INTERVAL_MS = GAME_CONSTANTS.PIPE_INTERVAL_MS;
export const CANVAS_WIDTH = GAME_CONSTANTS.CANVAS_WIDTH;
export const CANVAS_HEIGHT = GAME_CONSTANTS.CANVAS_HEIGHT;

// Calculate deterministic pipe Y position
// MUST be identical on client and server
export function getPipeGapY(frameCount: number, pipeGap: number): number {
  const seed = frameCount * 9301 + 49297;
  return 100 + (seed % (GAME_CONSTANTS.CANVAS_HEIGHT - pipeGap - 200));
}

// Calculate pipe speed at given score
export function getPipeSpeed(score: number): number {
  const speedMultiplier = 1 + Math.floor(score / 10) *
    (GAME_CONSTANTS.PIPE_SPEED_INCREASE_PER_10 / GAME_CONSTANTS.PIPE_SPEED_START);
  return GAME_CONSTANTS.PIPE_SPEED_START * speedMultiplier;
}

// Calculate pipe gap at given score
export function getPipeGap(score: number): number {
  return Math.max(
    GAME_CONSTANTS.PIPE_GAP_MIN,
    GAME_CONSTANTS.PIPE_GAP_START - Math.floor(score / 10) * GAME_CONSTANTS.PIPE_GAP_DECREASE_PER_10
  );
}

// Types used across client and server
export interface GameInput {
  type: 'flap';
  timestamp: number; // ms since game start
}

export interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

export interface GameState {
  birdY: number;
  birdVelocity: number;
  pipes: Pipe[];
  score: number;
  frame: number;
  gameOver: boolean;
  lastPipeTime: number;
}
