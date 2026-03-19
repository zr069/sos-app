'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

// Promo end date: April 20, 2026
const PROMO_END = new Date('2026-04-20T23:59:59Z');

interface StakeOption {
  stake: number;
  label: string;
  multiplier: number;
  icon?: string;
  isPromo?: boolean;
  originalPrice?: string;
}

const STAKE_OPTIONS: StakeOption[] = [
  { stake: 50, label: '€0,50', multiplier: 1, isPromo: true, originalPrice: '€1,00' },
  { stake: 100, label: '€1,00', multiplier: 1 },
  { stake: 500, label: '€5,00', multiplier: 2, icon: '⚡' },
  { stake: 1000, label: '€10,00', multiplier: 3, icon: '🏆' },
  { stake: 2500, label: '€25,00', multiplier: 5, icon: '👑' },
];

interface StakeSelectorProps {
  locale: string;
}

export default function StakeSelector({ locale }: StakeSelectorProps) {
  // Calculate promo status
  const now = Date.now();
  const daysLeft = Math.max(0, Math.ceil((PROMO_END.getTime() - now) / 86400000));
  const promoActive = daysLeft > 0;

  // Default: promo card if active, otherwise standard
  const [selectedStake, setSelectedStake] = useState<number>(promoActive ? 50 : 100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locale, stake: selectedStake }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create checkout';
      console.error('Checkout error:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Filter options: hide promo if not active
  const visibleOptions = promoActive
    ? STAKE_OPTIONS
    : STAKE_OPTIONS.filter(opt => !opt.isPromo);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Stake options grid */}
      <div className={`grid gap-3 mb-6 ${
        visibleOptions.length === 5
          ? 'grid-cols-2 sm:grid-cols-5'
          : 'grid-cols-2 sm:grid-cols-4'
      }`}>
        {visibleOptions.map((option) => {
          const isSelected = selectedStake === option.stake;
          const isPromoCard = option.isPromo && promoActive;

          return (
            <motion.button
              key={option.stake}
              onClick={() => setSelectedStake(option.stake)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : isPromoCard
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-surface-border bg-surface/50 hover:border-primary/50'
                }
                ${isPromoCard ? 'sm:col-span-1' : ''}
              `}
            >
              {/* Promo badge */}
              {isPromoCard && (
                <div className="absolute -top-2 left-2 right-2 flex justify-center">
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-background whitespace-nowrap">
                    🔥 PROMO - Noch {daysLeft} Tage!
                  </span>
                </div>
              )}

              {/* Multiplier badge for 2x+ */}
              {option.multiplier > 1 && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-background">
                  {option.multiplier}x
                </div>
              )}

              <div className={`${isPromoCard ? 'mt-3' : ''}`}>
                {/* Card title with icon */}
                <div className="text-xs text-text-muted mb-1">
                  {option.isPromo ? 'Promo' :
                   option.stake === 100 ? 'Standard' :
                   option.stake === 500 ? `Pro ${option.icon}` :
                   option.stake === 1000 ? `Elite ${option.icon}` :
                   option.stake === 2500 ? `Champion ${option.icon}` : ''}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  {isPromoCard && option.originalPrice && (
                    <span className="text-sm text-text-muted line-through">
                      {option.originalPrice}
                    </span>
                  )}
                  <span className={`text-xl font-display font-bold ${isSelected ? 'text-primary' : 'text-white'}`}>
                    {option.label}
                  </span>
                </div>

                {/* Multiplier text */}
                <div className={`text-sm mt-1 ${option.multiplier > 1 ? 'text-primary' : 'text-text-muted'}`}>
                  {option.multiplier}x Score
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Enter button */}
      <div className="flex flex-col items-center gap-3">
        <motion.button
          onClick={handleCheckout}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary min-w-[280px] text-lg py-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
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
              Laden...
            </>
          ) : (
            <>Jetzt spielen →</>
          )}
        </motion.button>

        {error && (
          <p className="text-red-400 text-sm text-center max-w-xs">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
