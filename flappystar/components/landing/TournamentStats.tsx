'use client';

import { useTranslations } from 'next-intl';
import useSWR from 'swr';

interface StatsData {
  totalEntries: number;
  uniqueCountries: number;
  highestScore: number;
  daysRemaining: number;
  prizeAmount: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TournamentStats() {
  const t = useTranslations('landing.stats');

  const { data, isLoading } = useSWR<StatsData>('/api/stats', fetcher, {
    refreshInterval: 60000, // Refresh every 60 seconds
    revalidateOnFocus: true,
    fallbackData: {
      totalEntries: 0,
      uniqueCountries: 0,
      highestScore: 0,
      daysRemaining: 0,
      prizeAmount: 10000,
    },
  });

  const stats = data ?? {
    totalEntries: 0,
    uniqueCountries: 0,
    highestScore: 0,
    daysRemaining: 0,
    prizeAmount: 10000,
  };

  const formatNumber = (num: number) => {
    if (isLoading || num === 0) return '--';
    return num.toLocaleString();
  };

  const formatPrize = (amount: number) => {
    return `€${amount.toLocaleString()}`;
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-xl font-display font-bold text-white mb-6">
        Tournament Stats
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 rounded-xl bg-white/[0.02]">
          <div className="text-2xl sm:text-3xl font-display font-bold text-primary mb-1">
            {formatNumber(stats.totalEntries)}
          </div>
          <div className="text-xs text-text-muted uppercase tracking-wider">
            {t('entries')}
          </div>
        </div>

        <div className="text-center p-4 rounded-xl bg-white/[0.02]">
          <div className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">
            {formatNumber(stats.daysRemaining)}
          </div>
          <div className="text-xs text-text-muted uppercase tracking-wider">
            {t('daysLeft')}
          </div>
        </div>

        <div className="text-center p-4 rounded-xl bg-white/[0.02]">
          <div className="text-2xl sm:text-3xl font-display font-bold gold-shimmer mb-1">
            {formatPrize(stats.prizeAmount)}
          </div>
          <div className="text-xs text-text-muted uppercase tracking-wider">
            {t('prize')}
          </div>
        </div>

        <div className="text-center p-4 rounded-xl bg-white/[0.02]">
          <div className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">
            {formatNumber(stats.uniqueCountries)}
          </div>
          <div className="text-xs text-text-muted uppercase tracking-wider">
            {t('countries')}
          </div>
        </div>
      </div>
    </div>
  );
}
