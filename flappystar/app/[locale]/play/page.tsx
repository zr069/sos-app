'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import FlappyBird, { type ValidationResult } from '@/components/game/FlappyBird';
import type { GameInput } from '@/lib/gameConstants';
import ScoreForm from './ScoreForm';
import { Skeleton } from '@/components/ui/Skeleton';

// Extended validation result with game data
interface GameValidationData extends ValidationResult {
  gameSessionToken: string;
  inputs: GameInput[];
  gameDuration: number;
  stripeSessionId?: string;
}

function PlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('errors');

  const mode = (searchParams.get('mode') as 'free' | 'tournament') || 'free';
  const sessionId = searchParams.get('session_id');

  const [isValidating, setIsValidating] = useState(mode === 'tournament');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [gameData, setGameData] = useState<GameValidationData | null>(null);

  const validateSession = async () => {
    try {
      const response = await fetch(
        `/api/validate-session?session_id=${sessionId}`
      );
      const data = await response.json();

      if (data.valid) {
        setIsValid(true);
      } else {
        setError(
          data.reason === 'Session already used'
            ? t('sessionUsed')
            : data.reason === 'Payment not completed'
            ? t('paymentNotCompleted')
            : t('sessionInvalid')
        );
      }
    } catch {
      setError(t('serverError'));
    } finally {
      setIsValidating(false);
    }
  };

  // Validate session for tournament mode
  useEffect(() => {
    if (mode === 'tournament' && sessionId) {
      validateSession();
    } else if (mode === 'tournament' && !sessionId) {
      setError(t('sessionInvalid'));
      setIsValidating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, sessionId]);

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    // For free mode, just set game over
    if (mode === 'free') {
      setGameOver(true);
    }
  };

  const handleValidationComplete = (result: ValidationResult & { gameSessionToken?: string; inputs?: GameInput[]; gameDuration?: number }) => {
    setFinalScore(result.score);
    setGameData({
      ...result,
      gameSessionToken: result.gameSessionToken || '',
      inputs: result.inputs || [],
      gameDuration: result.gameDuration || 0,
      stripeSessionId: sessionId || undefined,
    } as GameValidationData);
    setGameOver(true);
  };

  // Show loading state while validating
  if (mode === 'tournament' && isValidating) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4 text-center">
        <div className="glass-card rounded-2xl p-8">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-muted">Validating session...</p>
        </div>
      </div>
    );
  }

  // Show error if validation failed
  if (mode === 'tournament' && error) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4 text-center">
        <div className="glass-card rounded-2xl p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-display font-bold text-white mb-2">
            Error
          </h2>
          <p className="text-text-muted mb-6">{error}</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Show score form after tournament game over (includes success screen after submission)
  if (mode === 'tournament' && gameOver && sessionId && gameData) {
    return (
      <ScoreForm
        score={finalScore}
        sessionId={sessionId}
        gameData={gameData}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-2">
      <div className="h-[550px] sm:h-[650px]">
        <FlappyBird
          mode={mode}
          stripeSessionId={sessionId || undefined}
          onGameOver={mode === 'free' ? handleGameOver : undefined}
          onValidationComplete={mode === 'tournament' ? handleValidationComplete : undefined}
          disabled={mode === 'tournament' && !isValid}
        />
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto px-4 pt-2">
          <Skeleton className="h-[550px] rounded-xl" />
        </div>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
