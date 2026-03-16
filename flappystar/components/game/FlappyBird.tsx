'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

interface FlappyBirdProps {
  mode: 'free' | 'tournament';
  onGameOver?: (score: number) => void;
  disabled?: boolean;
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

type GameState = 'idle' | 'playing' | 'gameover';

// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -9;
const BIRD_SIZE = 24;
const PIPE_WIDTH = 60;
const PIPE_GAP_START = 180;
const PIPE_GAP_MIN = 120;
const PIPE_SPEED_START = 3;
const PIPE_SPAWN_INTERVAL = 1800;
const STAR_COUNT = 50;

export default function FlappyBird({
  mode,
  onGameOver,
  disabled = false,
}: FlappyBirdProps) {
  const t = useTranslations('game');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 600 });

  // Game refs (to avoid state in animation loop)
  const gameStateRef = useRef<GameState>('idle');
  const scoreRef = useRef(0);
  const birdRef = useRef({ x: 0, y: 0, velocity: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef<number>(0);
  const lastPipeSpawnRef = useRef(0);
  const difficultyRef = useRef({ speed: PIPE_SPEED_START, gapHeight: PIPE_GAP_START });

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

  // Reset game
  const resetGame = useCallback(() => {
    birdRef.current = {
      x: canvasSize.width * 0.25,
      y: canvasSize.height * 0.5,
      velocity: 0,
    };
    pipesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    lastPipeSpawnRef.current = 0;
    difficultyRef.current = { speed: PIPE_SPEED_START, gapHeight: PIPE_GAP_START };
  }, [canvasSize]);

  // Start game
  const startGame = useCallback(() => {
    if (disabled) return;
    resetGame();
    setGameState('playing');
    gameStateRef.current = 'playing';
  }, [disabled, resetGame]);

  // Jump action
  const jump = useCallback(() => {
    if (disabled) return;

    if (gameStateRef.current === 'idle') {
      startGame();
    } else if (gameStateRef.current === 'playing') {
      birdRef.current.velocity = JUMP_FORCE;
    }
  }, [disabled, startGame]);

  // Handle game over
  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    gameStateRef.current = 'gameover';

    const finalScore = scoreRef.current;
    setScore(finalScore);

    // Update best score
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      localStorage.setItem('flappystar_best', finalScore.toString());
    }

    // Callback for tournament mode
    if (onGameOver) {
      onGameOver(finalScore);
    }
  }, [bestScore, onGameOver]);

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
      ctx.fillRect(x, 0, PIPE_WIDTH, gapY);

      // Top pipe gold edge
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x - 4, gapY - 20, PIPE_WIDTH + 8, 20);

      // Bottom pipe
      ctx.fillStyle = '#1e0a3c';
      ctx.fillRect(x, gapY + gapHeight, PIPE_WIDTH, height - gapY - gapHeight);

      // Bottom pipe gold edge
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x - 4, gapY + gapHeight, PIPE_WIDTH + 8, 20);
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
      const birdRadius = BIRD_SIZE / 2 - 4; // Slightly smaller hitbox

      // Floor and ceiling
      if (bird.y - birdRadius < 0 || bird.y + birdRadius > canvasSize.height) {
        return true;
      }

      // Pipes
      for (const pipe of pipes) {
        if (
          bird.x + birdRadius > pipe.x &&
          bird.x - birdRadius < pipe.x + PIPE_WIDTH
        ) {
          if (
            bird.y - birdRadius < pipe.gapY ||
            bird.y + birdRadius > pipe.gapY + pipe.gapHeight
          ) {
            return true;
          }
        }
      }

      return false;
    },
    [canvasSize]
  );

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
        // Update bird physics
        birdRef.current.velocity += GRAVITY;
        birdRef.current.y += birdRef.current.velocity;

        // Spawn pipes
        if (timestamp - lastPipeSpawnRef.current > PIPE_SPAWN_INTERVAL) {
          const gapY =
            Math.random() * (canvasSize.height - difficultyRef.current.gapHeight - 100) + 50;
          pipesRef.current.push({
            x: canvasSize.width,
            gapY,
            gapHeight: difficultyRef.current.gapHeight,
            passed: false,
          });
          lastPipeSpawnRef.current = timestamp;
        }

        // Update pipes
        pipesRef.current = pipesRef.current.filter((pipe) => {
          pipe.x -= difficultyRef.current.speed;

          // Score when passing pipe
          if (!pipe.passed && pipe.x + PIPE_WIDTH < birdRef.current.x) {
            pipe.passed = true;
            scoreRef.current++;
            setScore(scoreRef.current);

            // Increase difficulty every 10 points
            if (scoreRef.current % 10 === 0) {
              difficultyRef.current.speed += 0.25;
              difficultyRef.current.gapHeight = Math.max(
                PIPE_GAP_MIN,
                difficultyRef.current.gapHeight - 2
              );
            }
          }

          return pipe.x > -PIPE_WIDTH;
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

      // Idle state: floating animation
      if (gameStateRef.current === 'idle') {
        birdRef.current.x = canvasSize.width * 0.25;
        birdRef.current.y =
          canvasSize.height * 0.5 + Math.sin(timestamp * 0.003) * 20;
      }

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    // Initialize bird position
    birdRef.current = {
      x: canvasSize.width * 0.25,
      y: canvasSize.height * 0.5,
      velocity: 0,
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

  const handleClick = () => {
    if (gameState !== 'gameover') {
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
      className="relative w-full h-full min-h-[500px] flex items-center justify-center"
    >
      <div className="relative">
        {/* Game canvas */}
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleClick}
          onTouchStart={(e) => {
            e.preventDefault();
            handleClick();
          }}
          className="rounded-xl border border-surface-border cursor-pointer"
          style={{ touchAction: 'none' }}
        />

        {/* Idle overlay */}
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl"
            >
              <div className="text-center">
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

                {mode === 'free' && (
                  <button
                    onClick={handlePlayAgain}
                    className="btn-primary w-full"
                  >
                    {t('playAgain')}
                  </button>
                )}

                {mode === 'tournament' && (
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

        {mode === 'tournament' && gameState !== 'gameover' && (
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
