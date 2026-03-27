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
  mode: 'tournament' | 'demo';
  stripeSessionId?: string;
  onGameOver?: (score: number) => void;
  onValidationComplete?: (result: ValidationResult) => void;
  disabled?: boolean;
  multiplier?: number;
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

// Particle types for juice effects
interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  alpha: number;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

type GameState = 'loading' | 'idle' | 'playing' | 'gameover' | 'validating' | 'frozen';

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

// Shared AudioContext for Safari/Chrome/Firefox compatibility
// Safari requires AudioContext to be created AND resumed synchronously in user gesture
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      // Safari uses webkitAudioContext
      const AudioCtx = (window as typeof window & { webkitAudioContext?: typeof AudioContext }).AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      sharedAudioCtx = new AudioCtx();
    }
    // Safari: must call resume() synchronously in user gesture
    // Check for 'running' state specifically (not just 'suspended')
    if (sharedAudioCtx.state !== 'running') {
      sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

// FLAP SOUND - soft whoosh on every tap (with Safari fallback)
function playFlapSound() {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  try {
    // Create white noise burst with quick decay
    const bufferSize = Math.floor(ctx.sampleRate * 0.08);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Low-pass filter for soft whoosh
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  } catch {
    // Safari fallback: simple soft tone instead of noise buffer
    try {
      const ctx2 = getAudioContext();
      if (!ctx2 || ctx2.state !== 'running') return;
      const o = ctx2.createOscillator();
      const g = ctx2.createGain();
      o.connect(g);
      g.connect(ctx2.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(300, ctx2.currentTime);
      o.frequency.exponentialRampToValueAtTime(150, ctx2.currentTime + 0.08);
      g.gain.setValueAtTime(0.1, ctx2.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 0.08);
      o.start(ctx2.currentTime);
      o.stop(ctx2.currentTime + 0.08);
    } catch {
      // Audio completely unavailable
    }
  }
}

// SCORE SOUND - satisfying rising sparkle
function playScoreSound() {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  try {
    // Rising sparkle
    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    o1.connect(g1);
    g1.connect(ctx.destination);
    o1.type = 'sine';
    o1.frequency.setValueAtTime(440, ctx.currentTime);
    o1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    o1.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.22);
    g1.gain.setValueAtTime(0, ctx.currentTime);
    g1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o1.start(ctx.currentTime);
    o1.stop(ctx.currentTime + 0.3);

    // Warm undertone
    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.connect(g2);
    g2.connect(ctx.destination);
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(523, ctx.currentTime);
    g2.gain.setValueAtTime(0.15, ctx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o2.start(ctx.currentTime);
    o2.stop(ctx.currentTime + 0.25);
  } catch {
    // Audio not available
  }
}

// GAME OVER SOUND - dramatic descending tone with impact
function playGameOverSound() {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  try {
    // Impact thud
    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    o1.connect(g1);
    g1.connect(ctx.destination);
    o1.type = 'sine';
    o1.frequency.setValueAtTime(150, ctx.currentTime);
    o1.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3);
    g1.gain.setValueAtTime(0.5, ctx.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o1.start(ctx.currentTime);
    o1.stop(ctx.currentTime + 0.3);

    // Sad descending tone
    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.connect(g2);
    g2.connect(ctx.destination);
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(400, ctx.currentTime + 0.1);
    o2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
    g2.gain.setValueAtTime(0.2, ctx.currentTime + 0.1);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o2.start(ctx.currentTime + 0.1);
    o2.stop(ctx.currentTime + 0.5);
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
  multiplier = 1,
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

  // Bot detection (tournament mode only)
  const lastMoveTimeRef = useRef(0); // Throttle movement tracking
  const honeypotClickedRef = useRef(false);
  const honeypotIdRef = useRef<string>('');

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

  // Juice effect refs
  const trailParticlesRef = useRef<TrailParticle[]>([]);
  const burstParticlesRef = useRef<BurstParticle[]>([]);
  const shakeRef = useRef({ x: 0, y: 0, intensity: 0 });
  const starPulseRef = useRef(1.0);

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

        // Generate fresh honeypot ID for this game session
        honeypotIdRef.current = `hp_${crypto.randomUUID().slice(0, 8)}`;

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

  // Safari: Resume AudioContext when page becomes visible again
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && sharedAudioCtx) {
        sharedAudioCtx.resume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Record input (tournament mode)
  const recordInput = useCallback(() => {
    if (mode !== 'tournament') return;

    const timestamp = performance.now() - gameStartTimeRef.current;

    // Deduplicate: ignore if last input was less than 50ms ago
    // Mobile fires touchstart + pointerdown simultaneously (0ms interval)
    const lastInput = inputsRef.current[inputsRef.current.length - 1];
    if (lastInput && timestamp - lastInput.timestamp < 50) return;

    inputsRef.current.push({ type: 'flap', timestamp });
  }, [mode]);

  // Record mouse/touch movement (tournament mode only, throttled)
  const recordMovement = useCallback((x: number, y: number) => {
    if (mode !== 'tournament') return;
    if (gameStateRef.current !== 'playing') return;

    // Throttle to max 10 events per second
    const now = performance.now();
    if (now - lastMoveTimeRef.current < 100) return;
    lastMoveTimeRef.current = now;

    const timestamp = now - gameStartTimeRef.current;
    inputsRef.current.push({ type: 'move', timestamp, x: Math.round(x), y: Math.round(y) });
  }, [mode]);

  // Handle honeypot click (instant bot flag)
  const handleHoneypotClick = useCallback(() => {
    if (mode !== 'tournament') return;
    honeypotClickedRef.current = true;
    const timestamp = performance.now() - gameStartTimeRef.current;
    inputsRef.current.push({ type: 'honeypot', timestamp });
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

    // Reset bot detection
    lastMoveTimeRef.current = 0;
    honeypotClickedRef.current = false;

    // Reset juice effects
    trailParticlesRef.current = [];
    burstParticlesRef.current = [];
    shakeRef.current = { x: 0, y: 0, intensity: 0 };
    starPulseRef.current = 1.0;
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
    // MUST be first line - Safari requires AudioContext unlock synchronously in gesture
    getAudioContext();

    if (disabled) return;

    if (gameStateRef.current === 'idle') {
      startGame();
      // Apply flap force immediately so bird doesn't fall right away
      birdRef.current.velocity = G.FLAP_FORCE;
      recordInput();
      // Play flap sound (skip in demo mode)
      if (mode !== 'demo') playFlapSound();
    } else if (gameStateRef.current === 'playing') {
      birdRef.current.velocity = G.FLAP_FORCE;
      recordInput();
      // Play flap sound (skip in demo mode)
      if (mode !== 'demo') playFlapSound();
    }
  }, [disabled, startGame, recordInput, mode]);

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
        canvasWidth: canvasSize.width,
      };

      // Store validation data for later submission with player info
      if (onValidationComplete) {
        onValidationComplete({
          valid: true, // Preliminary - actual validation happens with player info
          score: finalScore,
          ...validationData,
        } as ValidationResult & { gameSessionToken: string; inputs: GameInput[]; gameDuration: number; canvasWidth: number });
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

  // Draw star (bird) with score-based glow and pulse
  const drawBird = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number, currentScore: number, pulse: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Scale by pulse
      ctx.scale(pulse, pulse);

      // Score-based glow effect
      if (currentScore >= 50) {
        // ON FIRE: red/white glow
        ctx.shadowBlur = 50;
        ctx.shadowColor = '#FF2200';
      } else if (currentScore >= 25) {
        // HOT: orange glow
        ctx.shadowBlur = 35;
        ctx.shadowColor = '#FF6600';
      } else if (currentScore >= 10) {
        // Warm: brighter gold glow
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#FFD700';
      } else {
        // Normal glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFD700';
      }

      // Draw flame particles around star when on fire (score 50+)
      if (currentScore >= 50) {
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + Date.now() * 0.005;
          const dist = BIRD_SIZE * 0.6 + Math.sin(Date.now() * 0.01 + i) * 5;
          const flameX = Math.cos(angle) * dist;
          const flameY = Math.sin(angle) * dist;
          const flameSize = 4 + Math.sin(Date.now() * 0.02 + i * 2) * 2;

          const flameGrad = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameSize);
          flameGrad.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
          flameGrad.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)');
          flameGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

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

      // Fill with gradient (hotter colors for higher scores)
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius);
      if (currentScore >= 50) {
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.3, '#FFFF00');
        gradient.addColorStop(0.6, '#FF6600');
        gradient.addColorStop(1, '#FF2200');
      } else if (currentScore >= 25) {
        gradient.addColorStop(0, '#FFFACD');
        gradient.addColorStop(0.5, '#FFD700');
        gradient.addColorStop(1, '#FF6600');
      } else {
        gradient.addColorStop(0, '#FFF8DC');
        gradient.addColorStop(0.5, '#FFD700');
        gradient.addColorStop(1, '#FFA500');
      }
      ctx.fillStyle = gradient;
      ctx.fill();

      // White edge
      ctx.strokeStyle = currentScore >= 50 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = currentScore >= 25 ? 3 : 2;
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

        // Spawn trail particles behind star
        if (mode !== 'demo' || Math.random() > 0.5) {
          for (let i = 0; i < 2; i++) {
            trailParticlesRef.current.push({
              x: birdRef.current.x - 5,
              y: birdRef.current.y + (Math.random() - 0.5) * 10,
              vx: -1 - Math.random(),
              vy: (Math.random() - 0.5) * 1.5,
              life: 20,
              maxLife: 20,
              size: 3 + Math.random() * 3,
              alpha: 0.8,
            });
          }
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

            // Star pulse on score
            starPulseRef.current = 1.4;

            // Play sound (skip in demo mode)
            if (mode !== 'demo') {
              playScoreSound();
            }

            // Spawn burst particles at pipe location
            const burstX = pipe.x + G.PIPE_WIDTH;
            const burstY = birdRef.current.y;
            for (let i = 0; i < 12; i++) {
              const angle = (i / 12) * Math.PI * 2;
              const speed = 3 + Math.random() * 4;
              burstParticlesRef.current.push({
                x: burstX,
                y: burstY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 25,
                maxLife: 25,
                size: 4 + Math.random() * 4,
                color: Math.random() > 0.5 ? '#FFD700' : '#FFA500',
              });
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

        // Check collision - freeze frame then game over
        if (checkCollision(birdRef.current, pipesRef.current)) {
          // Trigger screen shake
          shakeRef.current.intensity = 12;

          // Freeze frame for 80ms
          gameStateRef.current = 'frozen';
          setTimeout(() => {
            handleGameOver();
          }, 80);
        }
      }

      // Frozen state - just draw, don't update physics
      if (gameStateRef.current === 'frozen') {
        // Update shake
        if (shakeRef.current.intensity > 0) {
          shakeRef.current.x = (Math.random() - 0.5) * shakeRef.current.intensity;
          shakeRef.current.y = (Math.random() - 0.5) * shakeRef.current.intensity;
          shakeRef.current.intensity *= 0.85;
        }
      }

      // Apply screen shake
      ctx.save();
      if (shakeRef.current.intensity > 0.1) {
        ctx.translate(shakeRef.current.x, shakeRef.current.y);
        if (gameStateRef.current !== 'frozen') {
          shakeRef.current.intensity *= 0.85;
          shakeRef.current.x = (Math.random() - 0.5) * shakeRef.current.intensity;
          shakeRef.current.y = (Math.random() - 0.5) * shakeRef.current.intensity;
        }
      }

      // Update star pulse (decay toward 1.0)
      starPulseRef.current += (1.0 - starPulseRef.current) * 0.2;

      // Update and draw trail particles
      ctx.save();
      for (const p of trailParticlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.alpha = (p.life / p.maxLife) * 0.8;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(255, 215, 0, ${p.alpha})`);
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.size *= 0.95;
      }
      ctx.restore();
      trailParticlesRef.current = trailParticlesRef.current.filter(p => p.life > 0);

      // Update and draw burst particles
      ctx.save();
      for (const p of burstParticlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity
        p.life--;
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      burstParticlesRef.current = burstParticlesRef.current.filter(p => p.life > 0);

      // Draw pipes
      pipesRef.current.forEach((pipe) => {
        drawPipe(ctx, pipe, canvasSize.height);
      });

      // Draw bird with score-based glow and pulse
      const rotation =
        gameStateRef.current === 'playing' || gameStateRef.current === 'frozen'
          ? Math.min(Math.max(birdRef.current.velocity * 0.05, -0.5), 0.5)
          : 0;
      drawBird(ctx, birdRef.current.x, birdRef.current.y, rotation, scoreRef.current, starPulseRef.current);

      // Draw score and level
      ctx.textAlign = 'center';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FFD700';

      // Score (offset left if multiplier shown)
      ctx.font = 'bold 48px Syne, sans-serif';
      ctx.fillStyle = '#FFD700';
      const scoreX = multiplier > 1 ? canvasSize.width / 2 - 25 : canvasSize.width / 2;
      ctx.fillText(scoreRef.current.toString(), scoreX, 60);

      // Multiplier badge (if > 1)
      if (multiplier > 1) {
        ctx.font = 'bold 28px Syne, sans-serif';
        ctx.fillStyle = '#FF6600';
        ctx.shadowColor = '#FF6600';
        ctx.fillText(`×${multiplier}`, canvasSize.width / 2 + 35, 60);
        ctx.shadowColor = '#FFD700';
      }

      // Level indicator
      ctx.font = 'bold 16px Syne, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 0;
      const levelText = `Level ${levelRef.current}`;
      ctx.fillText(levelText, canvasSize.width / 2, 85);

      ctx.shadowBlur = 0;

      // Restore from screen shake
      ctx.restore();

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

  // Mouse/touch movement tracking (tournament mode only, for bot detection)
  useEffect(() => {
    if (mode !== 'tournament') return;

    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      recordMovement(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        const touch = e.touches[0];
        recordMovement(touch.clientX - rect.left, touch.clientY - rect.top);
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [mode, recordMovement]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    // Safari: unlock audio synchronously in gesture handler
    getAudioContext();

    if (mode === 'demo') return; // No input in demo mode
    e.preventDefault();
    e.stopPropagation();
    if (gameState !== 'gameover' && gameState !== 'validating' && gameState !== 'loading' && gameStateRef.current !== 'frozen') {
      jump();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[380px] flex items-center justify-center select-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Invisible honeypot for bot detection (tournament mode only) */}
      {mode === 'tournament' && honeypotIdRef.current && (
        <button
          id={honeypotIdRef.current}
          onClick={handleHoneypotClick}
          aria-hidden="true"
          tabIndex={-1}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            width: '1px',
            height: '1px',
            opacity: 0,
            pointerEvents: 'auto',
          }}
        />
      )}
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
