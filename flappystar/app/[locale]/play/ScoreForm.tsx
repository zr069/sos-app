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
  onSubmitted: () => void;
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
  onSubmitted,
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
        onSubmitted();
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
    const shareText = t('success.shareMessage', { score: score });
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FlappyStar',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    }
  };

  // Show success screen after submission
  if (result) {
    return (
      <>
        <Confetti active={showConfetti} />

        <div className="max-w-lg mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-primary"
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
            </div>

            <h2 className="text-2xl font-display font-bold text-white mb-6">
              {t('success.title')}
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-white/[0.02]">
                <p className="text-text-muted text-sm mb-1">
                  {t('success.rank')}
                </p>
                <p className="text-3xl font-display font-bold text-primary">
                  #{result.rank}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02]">
                <p className="text-text-muted text-sm mb-1">
                  {t('success.score')}
                </p>
                <p className="text-3xl font-display font-bold text-white">
                  {result.score}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleShare}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
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
                {t('success.shareButton')}
              </button>

              <Link href="/leaderboard" className="btn-secondary w-full block">
                {t('success.viewLeaderboard')}
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            {t('title')}
          </h2>
          <p className="text-text-muted">{t('subtitle')}</p>

          <div className="mt-4 p-4 rounded-xl bg-primary/10">
            <p className="text-text-muted text-sm">Your Score</p>
            <p className="text-4xl font-display font-bold gold-shimmer">
              {score}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
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
              <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
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
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
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
              <p className="mt-1 text-sm text-red-500">{errors.nickname}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('country')}
            </label>
            <CountrySelect
              value={formData.country}
              onChange={(code) => setFormData({ ...formData, country: code })}
              placeholder={t('countryPlaceholder')}
              error={errors.country}
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-500">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
