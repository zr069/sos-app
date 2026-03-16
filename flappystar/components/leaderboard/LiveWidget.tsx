'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { getCountryFlag } from '@/components/ui/CountrySelect';
import { LeaderboardSkeleton } from '@/components/ui/Skeleton';

interface LeaderboardEntry {
  id: string;
  nickname: string;
  country: string;
  score: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LiveWidget() {
  const t = useTranslations('landing.leaderboard');

  const { data, isLoading, error } = useSWR<{
    entries: LeaderboardEntry[];
    total: number;
  }>('/api/leaderboard?page=1&limit=10', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  });

  const getRankDisplay = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return index + 1;
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-xl font-display font-bold text-white mb-4">
          {t('title')}
        </h3>
        <LeaderboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display font-bold text-white">
          {t('title')}
        </h3>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-text-muted">Live</span>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-12 gap-2 text-xs text-text-muted uppercase tracking-wider font-medium mb-2 px-2">
        <div className="col-span-1">{t('rank')}</div>
        <div className="col-span-7">{t('player')}</div>
        <div className="col-span-4 text-right">{t('score')}</div>
      </div>

      {/* Entries */}
      <div className="space-y-1">
        {data.entries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="grid grid-cols-12 gap-2 px-2 py-2 rounded-lg hover:bg-white/[0.02] transition-colors items-center"
          >
            <div className="col-span-1">
              <span className={index < 3 ? 'text-lg' : 'text-sm text-text-muted'}>
                {getRankDisplay(index)}
              </span>
            </div>
            <div className="col-span-7 flex items-center gap-2 min-w-0">
              <span className="text-lg flex-shrink-0">
                {getCountryFlag(entry.country)}
              </span>
              <span className="text-white truncate text-sm">
                {entry.nickname}
              </span>
            </div>
            <div className="col-span-4 text-right">
              <span
                className={`font-display font-bold ${
                  index < 3 ? 'text-primary' : 'text-white'
                }`}
              >
                {entry.score.toLocaleString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View all link */}
      <div className="mt-4 pt-4 border-t border-surface-border">
        <Link
          href="/leaderboard"
          className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1"
        >
          {t('viewAll')}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
