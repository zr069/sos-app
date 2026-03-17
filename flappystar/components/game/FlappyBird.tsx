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
  mode: 'free' | 'tournament' | 'demo';
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

// Level difficulty settings - MUST match server (gameEngine.ts)
const LEVEL_CONFIG = [
  { minScore: 0,  speed: 2.2, gap: 200 },  // Level 1
  { minScore: 15, speed: 2.5, gap: 188 },  // Level 2
  { minScore: 30, speed: 2.8, gap: 176 },  // Level 3
  { minScore: 45, speed: 3.1, gap: 165 },  // Level 4
  { minScore: 60, speed: 3.4, gap: 156 },  // Level 5
  { minScore: 75, speed: 3.7, gap: 148 },  // Level 6+
];

function getLevel(score: number): number {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (score >= LEVEL_CONFIG[i].minScore) {
      return i + 1;
    }
  }
  return 1;
}

function getLevelConfig(score: number) {
  const level = getLevel(score);
  return LEVEL_CONFIG[Math.min(level - 1, LEVEL_CONFIG.length - 1)];
}

// Sound effects using Web Audio API
function playScoreSound() {
  try {
    const AudioContext = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Layer 1: Rising sparkle tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    osc1.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.25);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Layer 2: Warm chord underneath
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(523, ctx.currentTime); // C5
    osc2.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
    gain2.gain.setValueAtTime(0.15, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.3);

    // Layer 3: High sparkle ping
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1760, ctx.currentTime + 0.1);
    gain3.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    gain3.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.12);
    gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc3.start(ctx.currentTime + 0.1);
    osc3.stop(ctx.currentTime + 0.4);

    // Close context after sounds finish
    setTimeout(() => ctx.close(), 500);
  } catch {
    // Audio not available
  }
}

function playGameOverSound() {
  try {
    const AudioContext = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio not available
  }
}

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

  // Game state - demo mode starts playing immediately
  const [gameState, setGameState] = useState<GameState>(
    mode === 'tournament' ? 'loading' : mode === 'demo' ? 'playing' : 'idle'
  );
  const [score, setScore] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
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
  const gameStateRef = useRef<GameState>(mode === 'tournament' ? 'loading' : mode === 'demo' ? 'playing' : 'idle');
  const demoRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const birdRef = useRef({ x: 0, y: 0, velocity: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef<number>(0);
  const difficultyRef = useRef({ speed: G.PIPE_SPEED_START, gapHeight: G.PIPE_GAP_START });
  const frameCountRef = useRef(0); // Frame counter for deterministic pipe generation
  const firstPipeSpawnedRef = useRef(false); // Track if first pipe has spawned
  const lastFrameTimeRef = useRef(0); // For delta-time based physics

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

  // Load best score from localStorage (skip in demo mode)
  useEffect(() => {
    if (mode === 'demo') return;
    const saved = localStorage.getItem('flappystar_best');
    if (saved) {
      setBestScore(parseInt(saved, 10));
    }
  }, [mode]);

  // Demo mode: auto-start and cleanup
  useEffect(() => {
    if (mode !== 'demo') return;

    // Start playing immediately
    gameStartTimeRef.current = performance.now();
    setGameState('playing');
    gameStateRef.current = 'playing';

    return () => {
      // Cleanup timeout on unmount
      if (demoRestartTimeoutRef.current) {
        clearTimeout(demoRestartTimeoutRef.current);
      }
    };
  }, [mode]);

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
    levelRef.current = 1;
    setScore(0);
    setShowLevelUp(false);
    frameCountRef.current = 0;
    firstPipeSpawnedRef.current = false; // Reset first pipe tracker
    lastFrameTimeRef.current = 0;
    difficultyRef.current = { speed: LEVEL_CONFIG[0].speed, gapHeight: LEVEL_CONFIG[0].gap };

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

    // Demo mode: auto-restart after 1 second, no sounds
    if (mode === 'demo') {
      // Brief pause then restart
      setGameState('gameover');
      gameStateRef.current = 'gameover';

      demoRestartTimeoutRef.current = setTimeout(() => {
        resetGame();
        gameStartTimeRef.current = performance.now();
        setGameState('playing');
        gameStateRef.current = 'playing';
      }, 1000);
      return;
    }

    playGameOverSound();
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
  }, [bestScore, mode, onGameOver, validateScore, resetGame]);

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
      // Use forgiving hitbox (smaller than visual) for better gameplay
      const collisionRadius = G.BIRD_SIZE * G.BIRD_COLLISION_FACTOR;
      const birdLeft = G.BIRD_X - collisionRadius;
      const birdRight = G.BIRD_X + collisionRadius;
      const birdTop = bird.y - collisionRadius;
      const birdBottom = bird.y + collisionRadius;

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

        // Delta-time based physics for consistent speed across devices
        // Cap deltaTime to prevent huge jumps on slow frames
        const cappedDelta = Math.min(deltaTime, 50);
        // Normalize to 60fps (16.67ms per frame)
        const dt = cappedDelta / 16.67;

        // Get level-based difficulty (needed for bot logic and physics)
        const levelConfig = getLevelConfig(scoreRef.current);
        const pipeGap = levelConfig.gap;
        const pipeSpeed = levelConfig.speed;

        // BOT LOGIC (demo mode only)
        if (mode === 'demo') {
          // Find the next pipe that hasn't been passed
          const nextPipe = pipesRef.current.find(p => !p.passed && p.x + G.PIPE_WIDTH > G.BIRD_X);

          if (nextPipe) {
            // Calculate center of the gap
            const gapCenter = nextPipe.gapY + nextPipe.gapHeight / 2;

            // If bird is below gap center + offset, flap
            // Add randomness so it doesn't look robotic
            if (birdRef.current.y > gapCenter + 30 && Math.random() > 0.3) {
              birdRef.current.velocity = G.FLAP_FORCE;
            }
          } else {
            // No pipes yet - keep bird roughly centered
            if (birdRef.current.y > G.CANVAS_HEIGHT / 2 && Math.random() > 0.5) {
              birdRef.current.velocity = G.FLAP_FORCE;
            }
          }
        }

        // Update bird physics with delta-time
        birdRef.current.velocity += G.GRAVITY * dt;
        birdRef.current.y += birdRef.current.velocity * dt;

        // Distance-based pipe spawning (fixes desktop vs mobile spacing)
        // Minimum distance between pipes = 75% of canvas width
        const MIN_PIPE_DISTANCE = canvasSize.width * 0.75;
        // First pipe delay = bird travels 40% of canvas width worth of time
        const FIRST_PIPE_DISTANCE = canvasSize.width * 0.4;

        // Get last pipe position (or far left if no pipes)
        const lastPipe = pipesRef.current[pipesRef.current.length - 1];
        const lastPipeX = lastPipe ? lastPipe.x : -9999;

        // Pipe spawn position (just off right edge)
        const PIPE_SPAWN_X = canvasSize.width + G.PIPE_WIDTH;

        let shouldSpawnPipe = false;
        if (!firstPipeSpawnedRef.current) {
          // First pipe: spawn after bird has had time to react
          // Use frame count * speed as proxy for distance traveled
          const distanceTraveled = frameCountRef.current * pipeSpeed * 0.5;
          if (distanceTraveled >= FIRST_PIPE_DISTANCE) {
            shouldSpawnPipe = true;
            firstPipeSpawnedRef.current = true;
          }
        } else {
          // Subsequent pipes: spawn when last pipe has moved far enough
          // Last pipe started at PIPE_SPAWN_X, spawn new when gap is MIN_PIPE_DISTANCE
          if (lastPipeX <= PIPE_SPAWN_X - MIN_PIPE_DISTANCE) {
            shouldSpawnPipe = true;
          }
        }

        if (shouldSpawnPipe) {
          // Use deterministic pipe Y position based on frame count
          // MUST match server algorithm: seed = frame * 9301 + 49297
          const gapY = getPipeGapY(frameCountRef.current, pipeGap);
          pipesRef.current.push({
            x: PIPE_SPAWN_X,
            gapY,
            gapHeight: pipeGap,
            passed: false,
          });
        }

        // Update pipes with delta-time
        pipesRef.current = pipesRef.current.filter((pipe) => {
          pipe.x -= pipeSpeed * dt;

          // Score when passing pipe
          if (!pipe.passed && pipe.x + G.PIPE_WIDTH < G.BIRD_X) {
            pipe.passed = true;
            const prevLevel = levelRef.current;
            scoreRef.current++;
            setScore(scoreRef.current);

            // Play sound (skip in demo mode)
            if (mode !== 'demo') {
              playScoreSound();
            }

            // Check for level up
            const newLevel = getLevel(scoreRef.current);
            if (newLevel > prevLevel) {
              levelRef.current = newLevel;
              setShowLevelUp(true);
              setTimeout(() => setShowLevelUp(false), 1000);
            }
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

      // Draw score and level
      ctx.textAlign = 'center';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FFD700';

      // Score
      ctx.font = 'bold 48px Syne, sans-serif';
      ctx.fillStyle = '#FFD700';
      ctx.fillText(scoreRef.current.toString(), canvasSize.width / 2, 60);

      // Level indicator
      ctx.font = 'bold 16px Syne, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 0;
      const levelText = `Level ${levelRef.current}`;
      ctx.fillText(levelText, canvasSize.width / 2, 85);
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
    mode,
  ]);

  // Input handlers (disabled in demo mode)
  useEffect(() => {
    if (mode === 'demo') return; // No input in demo mode

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump, mode]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (mode === 'demo') return; // No input in demo mode
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
      className="relative w-full h-full min-h-[380px] flex items-center justify-center select-none"
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

        {/* Level up animation */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: 1, scale: 1.2, y: -20 }}
              exit={{ opacity: 0, scale: 1.5, y: -40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div
                className="text-4xl font-display font-bold"
                style={{
                  color: '#FFD700',
                  textShadow: '0 0 20px #FFD700, 0 0 40px #FFA500, 0 0 60px #FF8C00',
                }}
              >
                LEVEL UP!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading overlay (tournament mode) - skip in demo */}
        <AnimatePresence>
          {gameState === 'loading' && mode !== 'demo' && (
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

        {/* Idle overlay - clickable to start game - skip in demo */}
        <AnimatePresence>
          {gameState === 'idle' && mode !== 'demo' && (
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

        {/* Validating overlay (tournament mode) - skip in demo */}
        <AnimatePresence>
          {gameState === 'validating' && mode !== 'demo' && (
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

        {/* Game over overlay - skip in demo */}
        <AnimatePresence>
          {gameState === 'gameover' && mode !== 'demo' && (
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

      </div>
    </div>
  );
}

// Export types for parent components
export type { ValidationResult, GameInput };
