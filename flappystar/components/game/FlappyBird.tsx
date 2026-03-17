'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GAME_CONSTANTS as G,
  getPipeGapY,
  type GameInput,
} from '@/lib/gameConstants';

interface FlappyBirdProps {
  mode: 'free' | 'tournament';
  stripeSessionId?: string;
  onGameOver?: (score: number) => void;
  onValidationComplete?: (result: ValidationResult) => void;
  disabled?: boolean;
}

interface ValidationResult {
  valid: boolean;
  score: number;
  rank?: number;
  error?: string;
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface Pipe {
  x: number;
  gapY: number;
  gapHeight: number;
  passed: boolean;
}

type GameState = 'loading' | 'idle' | 'playing' | 'gameover' | 'validating';

// Visual constants (not physics)
const BIRD_SIZE = G.BIRD_SIZE * 2;
const STAR_COUNT = 50;

export default function FlappyBird({
  mode,
  stripeSessionId,
  onGameOver,
  onValidationComplete,
  disabled = false,
}: FlappyBirdProps) {
  const t = useTranslations('game');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState>(
    mode === 'tournament' ? 'loading' : 'idle'
  );
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: G.CANVAS_WIDTH, height: G.CANVAS_HEIGHT });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Game session (tournament mode)
  const gameSessionTokenRef = useRef<string | null>(null);
  const serverTimeOffsetRef = useRef(0); // Difference between server and client time

  // Input recording (tournament mode)
  const inputsRef = useRef<GameInput[]>([]);
  const gameStartTimeRef = useRef(0);

  // Game refs (to avoid state in animation loop)
  const gameStateRef = useRef<GameState>(mode === 'tournament' ? 'loading' : 'idle');
  const scoreRef = useRef(0);
  const birdRef = useRef({ x: 0, y: 0, velocity: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef<number>(0);
  const lastPipeSpawnRef = useRef(0);
  const difficultyRef = useRef({ speed: G.PIPE_SPEED_START, gapHeight: G.PIPE_GAP_START });
  const frameCountRef = useRef(0); // Frame counter for deterministic pipe generation

  // Fetch game session token (tournament mode)
  useEffect(() => {
    if (mode !== 'tournament' || !stripeSessionId) return;

    const fetchGameSession = async () => {
      try {
        const response = await fetch(
          `/api/game-session?session_id=${encodeURIComponent(stripeSessionId)}`
        );

        if (!response.ok) {
          throw new Error('Failed to get game session');
        }

        const data = await response.json();
        gameSessionTokenRef.current = data.token;

        // Calculate server time offset
        serverTimeOffsetRef.current = data.serverTime - Date.now();

        setGameState('idle');
        gameStateRef.current = 'idle';
      } catch (error) {
        console.error('Failed to fetch game session:', error);
        setValidationError('Failed to initialize game. Please refresh and try again.');
        setGameState('gameover');
        gameStateRef.current = 'gameover';
      }
    };

    fetchGameSession();
  }, [mode, stripeSessionId]);

  // Load best score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flappystar_best');
    if (saved) {
      setBestScore(parseInt(saved, 10));
    }
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = Math.min(rect.width, 500);
        const height = Math.min(rect.height, 700);
        setCanvasSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize stars
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvasSize.width,
        y: Math.random() * canvasSize.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
    starsRef.current = stars;
  }, [canvasSize]);

  // Record input (tournament mode)
  const recordInput = useCallback(() => {
    if (mode !== 'tournament') return;

    const timestamp = performance.now() - gameStartTimeRef.current;
    inputsRef.current.push({ type: 'flap', timestamp });
  }, [mode]);

  // Reset game
  const resetGame = useCallback(() => {
    birdRef.current = {
      x: G.BIRD_X,
      y: G.BIRD_START_Y,
      velocity: G.BIRD_START_VELOCITY,
    };
    pipesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    lastPipeSpawnRef.current = 0;
    frameCountRef.current = 0;
    difficultyRef.current = { speed: G.PIPE_SPEED_START, gapHeight: G.PIPE_GAP_START };

    // Reset input recording
    inputsRef.current = [];
    gameStartTimeRef.current = 0;
  }, []);

  // Start game
  const startGame = useCallback(() => {
    if (disabled) return;
    if (mode === 'tournament' && !gameSessionTokenRef.current) return;

    resetGame();

    // Record start time
    gameStartTimeRef.current = performance.now();

    setGameState('playing');
    gameStateRef.current = 'playing';
  }, [disabled, mode, resetGame]);

  // Jump action
  const jump = useCallback(() => {
    if (disabled) return;

    if (gameStateRef.current === 'idle') {
      startGame();
      // Apply flap force immediately so bird doesn't fall right away
      birdRef.current.velocity = G.FLAP_FORCE;
      recordInput();
    } else if (gameStateRef.current === 'playing') {
      birdRef.current.velocity = G.FLAP_FORCE;
      recordInput();
    }
  }, [disabled, startGame, recordInput]);

  // Validate score with server (tournament mode)
  const validateScore = useCallback(async (finalScore: number, gameDuration: number) => {
    if (mode !== 'tournament' || !gameSessionTokenRef.current || !stripeSessionId) {
      return;
    }

    setGameState('validating');
    gameStateRef.current = 'validating';

    try {
      // Note: We don't have player info here yet - that comes from the form
      // For now, we just pass the game data and let the parent handle the form
      const validationData = {
        gameSessionToken: gameSessionTokenRef.current,
        stripeSessionId,
        claimedScore: finalScore,
        gameDuration,
        inputs: inputsRef.current,
      };

      // Store validation data for later submission with player info
      if (onValidationComplete) {
        onValidationComplete({
          valid: true, // Preliminary - actual validation happens with player info
          score: finalScore,
          ...validationData,
        } as ValidationResult & { gameSessionToken: string; inputs: GameInput[]; gameDuration: number });
      }

      setGameState('gameover');
      gameStateRef.current = 'gameover';
    } catch (error) {
      console.error('Validation error:', error);
      setValidationError('Score could not be verified. Please try again.');
      setGameState('gameover');
      gameStateRef.current = 'gameover';
    }
  }, [mode, stripeSessionId, onValidationComplete]);

  // Handle game over
  const handleGameOver = useCallback(() => {
    const finalScore = scoreRef.current;
    const gameDuration = performance.now() - gameStartTimeRef.current;

    setScore(finalScore);

    // Update best score
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      localStorage.setItem('flappystar_best', finalScore.toString());
    }

    // For tournament mode, validate with server
    if (mode === 'tournament') {
      validateScore(finalScore, gameDuration);
    } else {
      setGameState('gameover');
      gameStateRef.current = 'gameover';
    }

    // Callback
    if (onGameOver) {
      onGameOver(finalScore);
    }
  }, [bestScore, mode, onGameOver, validateScore]);

  // Draw star (bird)
  const drawBird = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FFD700';

      // Star shape
      ctx.beginPath();
      const spikes = 5;
      const outerRadius = BIRD_SIZE / 2;
      const innerRadius = outerRadius / 2;

      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / spikes) * i - Math.PI / 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();

      // Fill with gold gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius);
      gradient.addColorStop(0, '#FFF8DC');
      gradient.addColorStop(0.5, '#FFD700');
      gradient.addColorStop(1, '#FFA500');
      ctx.fillStyle = gradient;
      ctx.fill();

      // White edge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    },
    []
  );

  // Draw pipe
  const drawPipe = useCallback(
    (ctx: CanvasRenderingContext2D, pipe: Pipe, height: number) => {
      const { x, gapY, gapHeight } = pipe;

      // Top pipe
      ctx.fillStyle = '#1e0a3c';
      ctx.fillRect(x, 0, G.PIPE_WIDTH, gapY);

      // Top pipe gold edge
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x - 4, gapY - 20, G.PIPE_WIDTH + 8, 20);

      // Bottom pipe
      ctx.fillStyle = '#1e0a3c';
      ctx.fillRect(x, gapY + gapHeight, G.PIPE_WIDTH, height - gapY - gapHeight);

      // Bottom pipe gold edge
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x - 4, gapY + gapHeight, G.PIPE_WIDTH + 8, 20);
    },
    []
  );

  // Draw background stars
  const drawStars = useCallback(
    (ctx: CanvasRenderingContext2D, deltaTime: number) => {
      starsRef.current.forEach((star) => {
        // Move stars down
        star.y += star.speed * deltaTime * 0.1;
        if (star.y > canvasSize.height) {
          star.y = 0;
          star.x = Math.random() * canvasSize.width;
        }

        // Twinkle effect
        star.opacity = 0.3 + Math.sin(Date.now() * 0.003 + star.x) * 0.3;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });
    },
    [canvasSize]
  );

  // Check collision
  const checkCollision = useCallback(
    (bird: typeof birdRef.current, pipes: Pipe[]) => {
      // Use G.BIRD_SIZE for collision to match server
      const birdLeft = G.BIRD_X - G.BIRD_SIZE;
      const birdRight = G.BIRD_X + G.BIRD_SIZE;
      const birdTop = bird.y - G.BIRD_SIZE;
      const birdBottom = bird.y + G.BIRD_SIZE;

      // Floor and ceiling
      if (birdTop < 0 || birdBottom > G.CANVAS_HEIGHT) {
        return true;
      }

      // Pipes
      for (const pipe of pipes) {
        if (birdRight > pipe.x && birdLeft < pipe.x + G.PIPE_WIDTH) {
          if (birdTop < pipe.gapY || birdBottom > pipe.gapY + pipe.gapHeight) {
            return true;
          }
        }
      }

      return false;
    },
    []
  );

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent text selection and default behaviors on canvas
    canvas.style.userSelect = 'none';
    canvas.style.webkitUserSelect = 'none';
    canvas.style.touchAction = 'none';

    let lastTime = 0;

    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      // Clear canvas
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // Draw background gradient
      const bgGradient = ctx.createRadialGradient(
        canvasSize.width / 2,
        canvasSize.height / 2,
        0,
        canvasSize.width / 2,
        canvasSize.height / 2,
        canvasSize.width
      );
      bgGradient.addColorStop(0, '#0a0a1f');
      bgGradient.addColorStop(0.5, '#0a0a0f');
      bgGradient.addColorStop(1, '#050508');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // Draw stars
      drawStars(ctx, deltaTime);

      if (gameStateRef.current === 'playing') {
        // Increment frame counter for deterministic pipe generation
        frameCountRef.current++;

        // Update bird physics
        birdRef.current.velocity += G.GRAVITY;
        birdRef.current.y += birdRef.current.velocity;

        // Calculate current time in ms
        const currentTimeMs = frameCountRef.current * G.FRAME_MS;

        // Calculate current pipe gap based on score
        const pipeGap = Math.max(
          G.PIPE_GAP_MIN,
          G.PIPE_GAP_START - Math.floor(scoreRef.current / 10) * G.PIPE_GAP_DECREASE_PER_10
        );

        // Calculate current pipe speed based on score
        const speedMultiplier = 1 + Math.floor(scoreRef.current / 10) *
          (G.PIPE_SPEED_INCREASE_PER_10 / G.PIPE_SPEED_START);
        const pipeSpeed = G.PIPE_SPEED_START * speedMultiplier;

        // Spawn pipes deterministically (same algorithm as server)
        if (currentTimeMs - lastPipeSpawnRef.current >= G.PIPE_INTERVAL_MS) {
          // Use deterministic pipe Y position based on frame count
          // MUST match server algorithm: seed = frame * 9301 + 49297
          const gapY = getPipeGapY(frameCountRef.current, pipeGap);
          pipesRef.current.push({
            x: G.PIPE_START_X,
            gapY,
            gapHeight: pipeGap,
            passed: false,
          });
          lastPipeSpawnRef.current = currentTimeMs;
        }

        // Update pipes
        pipesRef.current = pipesRef.current.filter((pipe) => {
          pipe.x -= pipeSpeed;

          // Score when passing pipe
          if (!pipe.passed && pipe.x + G.PIPE_WIDTH < G.BIRD_X) {
            pipe.passed = true;
            scoreRef.current++;
            setScore(scoreRef.current);
          }

          return pipe.x > -G.PIPE_WIDTH;
        });

        // Check collision
        if (checkCollision(birdRef.current, pipesRef.current)) {
          handleGameOver();
        }
      }

      // Draw pipes
      pipesRef.current.forEach((pipe) => {
        drawPipe(ctx, pipe, canvasSize.height);
      });

      // Draw bird
      const rotation =
        gameStateRef.current === 'playing'
          ? Math.min(Math.max(birdRef.current.velocity * 0.05, -0.5), 0.5)
          : 0;
      drawBird(ctx, birdRef.current.x, birdRef.current.y, rotation);

      // Draw score
      ctx.font = 'bold 48px Syne, sans-serif';
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FFD700';
      ctx.fillText(scoreRef.current.toString(), canvasSize.width / 2, 60);
      ctx.shadowBlur = 0;

      // Idle state: floating animation (no physics, just gentle bobbing)
      if (gameStateRef.current === 'idle') {
        birdRef.current.x = G.BIRD_X;
        birdRef.current.y = G.BIRD_START_Y + Math.sin(timestamp * 0.002) * 15;
        birdRef.current.velocity = 0; // Reset velocity so bird doesn't fall on start
      }

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    // Initialize bird position
    birdRef.current = {
      x: G.BIRD_X,
      y: G.BIRD_START_Y,
      velocity: G.BIRD_START_VELOCITY,
    };

    frameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [
    canvasSize,
    drawBird,
    drawPipe,
    drawStars,
    checkCollision,
    handleGameOver,
  ]);

  // Input handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (gameState !== 'gameover' && gameState !== 'validating' && gameState !== 'loading') {
      jump();
    }
  };

  const handlePlayAgain = () => {
    if (mode === 'free') {
      resetGame();
      setGameState('idle');
      gameStateRef.current = 'idle';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] flex items-center justify-center select-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="relative select-none"
        onClick={handleInteraction}
        onPointerDown={handleInteraction}
        onTouchStart={handleInteraction}
      >
        {/* Game canvas */}
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleInteraction}
          onPointerDown={handleInteraction}
          onTouchStart={handleInteraction}
          onMouseDown={(e) => e.preventDefault()}
          onDoubleClick={(e) => e.preventDefault()}
          className="rounded-xl border border-surface-border cursor-pointer"
          style={{
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            pointerEvents: 'auto',
          }}
        />

        {/* Loading overlay (tournament mode) */}
        <AnimatePresence>
          {gameState === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl"
            >
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white">{t('loading') || 'Preparing game...'}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle overlay - clickable to start game */}
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleInteraction}
              onPointerDown={handleInteraction}
              onTouchStart={handleInteraction}
              className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl cursor-pointer"
            >
              <div className="text-center pointer-events-none">
                <motion.p
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xl font-medium text-white"
                >
                  {t('tapToStart')}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validating overlay (tournament mode) */}
        <AnimatePresence>
          {gameState === 'validating' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl"
            >
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white">Validating score...</p>
                <p className="text-text-muted text-sm mt-2">Please wait</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game over overlay */}
        <AnimatePresence>
          {gameState === 'gameover' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="text-center p-6 glass-card rounded-xl mx-4"
              >
                <h2 className="text-2xl font-display font-bold text-white mb-4">
                  {t('gameOver')}
                </h2>

                {validationError ? (
                  <div className="mb-6">
                    <p className="text-red-400 text-sm">{validationError}</p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-6">
                    <div>
                      <p className="text-text-muted text-sm">{t('yourScore')}</p>
                      <p className="text-4xl font-display font-bold gold-shimmer">
                        {score}
                      </p>
                    </div>

                    <div>
                      <p className="text-text-muted text-sm">{t('bestScore')}</p>
                      <p className="text-xl font-medium text-white">
                        {Math.max(score, bestScore)}
                      </p>
                    </div>
                  </div>
                )}

                {mode === 'free' && (
                  <button
                    onClick={handlePlayAgain}
                    className="btn-primary w-full"
                  >
                    {t('playAgain')}
                  </button>
                )}

                {mode === 'tournament' && !validationError && (
                  <p className="text-primary font-medium">
                    {t('submitScore')}
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tournament/Free mode indicator */}
        {mode === 'free' && (
          <div className="absolute top-4 left-4 right-4">
            <div className="glass-card px-3 py-1.5 rounded-full text-center">
              <span className="text-sm text-text-muted">
                {t('freePlayBanner')}
              </span>
            </div>
          </div>
        )}

        {mode === 'tournament' && gameState !== 'gameover' && gameState !== 'validating' && (
          <div className="absolute top-4 left-4 right-4">
            <div className="glass-card px-3 py-1.5 rounded-full text-center border border-primary/30">
              <span className="text-sm text-primary font-medium">
                {t('tournamentMode')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export types for parent components
export type { ValidationResult, GameInput };
