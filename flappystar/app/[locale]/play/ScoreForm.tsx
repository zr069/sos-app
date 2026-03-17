'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import CountrySelect from '@/components/ui/CountrySelect';
import Confetti from '@/components/ui/Confetti';
import { Link } from '@/i18n/routing';

import type { GameInput } from '@/lib/gameConstants';

interface GameValidationData {
  gameSessionToken: string;
  inputs: GameInput[];
  gameDuration: number;
  stripeSessionId?: string;
}

interface ScoreFormProps {
  score: number;
  sessionId: string;
  gameData: GameValidationData;
  tournamentEndDate?: string;
}

interface FormData {
  fullName: string;
  email: string;
  nickname: string;
  country: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  nickname?: string;
  country?: string;
  submit?: string;
}

export default function ScoreForm({
  score,
  sessionId,
  gameData,
  tournamentEndDate = '17. September 2026',
}: ScoreFormProps) {
  const t = useTranslations('scoreForm');

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    nickname: '',
    country: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ rank: number; score: number } | null>(
    null
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('errors.fullNameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('errors.emailInvalid');
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = t('errors.nicknameRequired');
    } else if (formData.nickname.trim().length < 2) {
      newErrors.nickname = t('errors.nicknameTooShort');
    }

    if (!formData.country) {
      newErrors.country = t('errors.countryRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Call the server-side validation API with game inputs
      const response = await fetch('/api/validate-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameSessionToken: gameData.gameSessionToken,
          stripeSessionId: sessionId,
          claimedScore: score,
          gameDuration: gameData.gameDuration,
          inputs: gameData.inputs,
          fullName: formData.fullName,
          email: formData.email,
          nickname: formData.nickname,
          country: formData.country,
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setResult({ rank: data.rank, score: data.score });
        setShowConfetti(true);
        // Success screen will be shown - no redirect
      } else {
        setErrors({ submit: data.error || t('errors.submitFailed') });
      }
    } catch {
      setErrors({ submit: t('errors.submitFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;

    const nickname = formData.nickname.trim();
    const shareUrl = `${window.location.origin}/score/${encodeURIComponent(nickname)}?score=${result.score}&rank=${result.rank}`;
    const shareText = `Ich bin auf Platz #${result.rank} mit ${result.score} Punkten! Kannst du mich schlagen?`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${nickname} - FlappyStar`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
      } catch {
        // Clipboard failed
      }
    }
  };

  // Show success screen after submission - full screen overlay
  if (result) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <Confetti active={showConfetti} />

        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          {/* Animated Gold Star */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
            className="mb-8"
          >
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              className="mx-auto drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]"
            >
              <defs>
                <radialGradient id="successStarGrad" cx="50%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFF8DC" />
                  <stop offset="50%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </radialGradient>
              </defs>
              {/* Glow */}
              <polygon
                points="60,5 72,42 110,42 80,65 90,102 60,80 30,102 40,65 10,42 48,42"
                fill="#FFD700"
                opacity="0.3"
                transform="scale(1.1) translate(-6, -6)"
              />
              {/* Main star */}
              <polygon
                points="60,5 72,42 110,42 80,65 90,102 60,80 30,102 40,65 10,42 48,42"
                fill="url(#successStarGrad)"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2"
              />
            </svg>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
              🎉 Dein Score wurde eingetragen!
            </h1>
          </motion.div>

          {/* Score Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="my-8"
          >
            <p className="text-6xl sm:text-8xl font-display font-bold gold-shimmer">
              {result.score}
            </p>
            <p className="text-xl text-text-muted mt-2">Punkte</p>
          </motion.div>

          {/* Rank */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <p className="text-2xl font-display text-white">
              Du bist auf <span className="text-primary font-bold">Platz #{result.rank}</span>!
            </p>
          </motion.div>

          {/* Tournament End Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mb-10 p-4 rounded-xl bg-white/[0.02] border border-surface-border"
          >
            <p className="text-text-muted">
              Viel Glück! Der Gewinner wird am{' '}
              <span className="text-white font-medium">{tournamentEndDate}</span>{' '}
              bekannt gegeben.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="space-y-3"
          >
            <Link href="/leaderboard" className="btn-primary w-full block text-center">
              Rangliste ansehen
            </Link>

            <button
              onClick={handleShare}
              className={`btn-secondary w-full flex items-center justify-center gap-2 transition-colors ${
                linkCopied ? 'bg-green-500/20 border-green-500/50' : ''
              }`}
            >
              {linkCopied ? (
                <>
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-400">Link kopiert!</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Teilen
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-4 px-4 pb-8 overflow-y-auto scroll-smooth">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-5 sm:p-8 w-full max-w-lg"
      >
        {/* Compact header */}
        <div className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-1">
            {t('title')}
          </h2>
          <p className="text-text-muted text-sm">{t('subtitle')}</p>

          {/* Compact score display */}
          <div className="mt-3 py-2 px-4 rounded-xl bg-primary/10 inline-block">
            <p className="text-text-muted text-xs">Your Score</p>
            <p className="text-3xl sm:text-4xl font-display font-bold gold-shimmer">
              {score}
            </p>
          </div>
        </div>

        {/* Form with reduced gaps and keyboard-friendly padding */}
        <form onSubmit={handleSubmit} className="space-y-3 pb-32">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {t('fullName')}
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder={t('fullNamePlaceholder')}
              className={`w-full px-4 py-3 bg-surface border rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary ${
                errors.fullName ? 'border-red-500' : 'border-surface-border'
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {t('email')}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder={t('emailPlaceholder')}
              className={`w-full px-4 py-3 bg-surface border rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary ${
                errors.email ? 'border-red-500' : 'border-surface-border'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Country - moved up for better mobile keyboard flow */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {t('country')}
            </label>
            <CountrySelect
              value={formData.country}
              onChange={(code) => setFormData({ ...formData, country: code })}
              placeholder={t('countryPlaceholder')}
              error={errors.country}
            />
          </div>

          {/* Nickname - moved down */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {t('nickname')}
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) =>
                setFormData({ ...formData, nickname: e.target.value })
              }
              placeholder={t('nicknamePlaceholder')}
              className={`w-full px-4 py-3 bg-surface border rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary ${
                errors.nickname ? 'border-red-500' : 'border-surface-border'
              }`}
            />
            {errors.nickname && (
              <p className="mt-1 text-xs text-red-500">{errors.nickname}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-500">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t('submitting')}
              </>
            ) : (
              t('submit')
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
