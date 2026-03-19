'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

// Must match lib/stripe.ts STAKE_TIERS
const STAKE_TIERS = [
  { id: 'basic', price: 50, multiplier: 1, label: '€0.50' },
  { id: 'standard', price: 100, multiplier: 1, label: '€1.00' },
  { id: 'premium', price: 500, multiplier: 2, label: '€5.00' },
  { id: 'elite', price: 1000, multiplier: 3, label: '€10.00' },
  { id: 'champion', price: 2500, multiplier: 5, label: '€25.00' },
] as const;

interface StakeSelectorProps {
  locale: string;
}

export default function StakeSelector({ locale }: StakeSelectorProps) {
  const [selectedStake, setSelectedStake] = useState<string>('basic');
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

  const selectedTier = STAKE_TIERS.find(t => t.id === selectedStake) || STAKE_TIERS[0];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Stake options grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-6">
        {STAKE_TIERS.map((tier) => {
          const isSelected = selectedStake === tier.id;
          return (
            <motion.button
              key={tier.id}
              onClick={() => setSelectedStake(tier.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-surface-border bg-surface/50 hover:border-primary/50'
                }
              `}
            >
              {/* Multiplier badge for premium tiers */}
              {tier.multiplier > 1 && (
                <div className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs font-bold rounded-full bg-primary text-background">
                  {tier.multiplier}x
                </div>
              )}

              {/* Price */}
              <div className={`text-lg sm:text-xl font-display font-bold ${isSelected ? 'text-primary' : 'text-white'}`}>
                {tier.label}
              </div>

              {/* Multiplier text for non-premium */}
              {tier.multiplier === 1 && (
                <div className="text-xs text-text-muted mt-1">1x</div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected tier info */}
      <div className="glass-card rounded-xl p-4 mb-6 text-center">
        <div className="flex items-center justify-center gap-4">
          <div>
            <span className="text-text-muted text-sm">Entry:</span>
            <span className="text-white font-bold ml-2">{selectedTier.label}</span>
          </div>
          <div className="w-px h-6 bg-surface-border" />
          <div>
            <span className="text-text-muted text-sm">Score Multiplier:</span>
            <span className={`font-bold ml-2 ${selectedTier.multiplier > 1 ? 'text-primary' : 'text-white'}`}>
              {selectedTier.multiplier}x
            </span>
          </div>
        </div>
        {selectedTier.multiplier > 1 && (
          <p className="text-primary/80 text-sm mt-2">
            Your final score will be multiplied by {selectedTier.multiplier}!
          </p>
        )}
      </div>

      {/* Enter button */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="btn-primary min-w-[280px] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
              Loading...
            </>
          ) : (
            <>Enter Tournament — {selectedTier.label}</>
          )}
        </button>
        {error && (
          <p className="text-red-400 text-sm text-center max-w-xs">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
