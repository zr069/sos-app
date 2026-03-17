'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { getCountryFlag } from '@/components/ui/CountrySelect';

interface LeaderboardEntry {
  id: string;
  nickname: string;
  country: string;
  score: number;
  created_at: string;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
}

export default function LeaderboardTable({
  entries: entriesProp,
  page,
  totalPages,
  onPageChange,
  searchQuery = '',
  onSearchChange,
  isLoading = false,
}: LeaderboardTableProps) {
  const t = useTranslations('leaderboard');
  const entries = entriesProp ?? [];

  const getRankDisplay = (index: number) => {
    const rank = (page - 1) * 25 + index + 1;
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      {onSearchChange && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('search')}
            className="w-full px-4 py-3 pl-11 bg-surface border border-surface-border rounded-xl text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 border-b border-surface-border text-xs text-text-muted uppercase tracking-wider font-medium">
          <div className="col-span-1">{t('rank')}</div>
          <div className="col-span-5">{t('player')}</div>
          <div className="col-span-2">{t('country')}</div>
          <div className="col-span-2 text-right">{t('score')}</div>
          <div className="col-span-2 text-right">{t('date')}</div>
        </div>

        {/* Entries */}
        <div className={`divide-y divide-surface-border ${isLoading ? 'opacity-50' : ''}`}>
          {entries.length === 0 ? (
            <div className="px-4 py-12 text-center text-text-muted">
              {t('empty')}
            </div>
          ) : (
            entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors"
              >
                {/* Rank */}
                <div className="col-span-2 sm:col-span-1">
                  <span
                    className={`text-lg ${
                      (page - 1) * 25 + index < 3
                        ? ''
                        : 'text-text-muted'
                    }`}
                  >
                    {getRankDisplay(index)}
                  </span>
                </div>

                {/* Player */}
                <div className="col-span-6 sm:col-span-5">
                  <div className="font-medium text-white truncate">
                    {entry.nickname}
                  </div>
                </div>

                {/* Country */}
                <div className="col-span-4 sm:col-span-2 flex items-center gap-2">
                  <span className="text-xl">{getCountryFlag(entry.country)}</span>
                  <span className="text-sm text-text-muted hidden sm:block">
                    {entry.country}
                  </span>
                </div>

                {/* Score */}
                <div className="col-span-6 sm:col-span-2 text-right">
                  <span
                    className={`font-display font-bold ${
                      (page - 1) * 25 + index < 3
                        ? 'text-primary'
                        : 'text-white'
                    }`}
                  >
                    {entry.score.toLocaleString()}
                  </span>
                </div>

                {/* Date */}
                <div className="col-span-6 sm:col-span-2 text-right text-sm text-text-muted">
                  {formatDate(entry.created_at)}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {t('page', { current: page, total: totalPages })}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-surface-border text-text-muted hover:text-white hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('previous')}
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-surface-border text-text-muted hover:text-white hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
