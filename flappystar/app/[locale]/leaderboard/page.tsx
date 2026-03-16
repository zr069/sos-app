'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import { LeaderboardSkeleton } from '@/components/ui/Skeleton';

interface LeaderboardEntry {
  id: string;
  nickname: string;
  country: string;
  score: number;
  created_at: string;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  totalPages: number;
}

export default function LeaderboardPage() {
  const t = useTranslations('leaderboard');

  const [data, setData] = useState<LeaderboardData | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
      });

      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }

      const response = await fetch(`/api/leaderboard?${params}`);
      const result = await response.json();

      setData(result);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
          {t('title')}
        </h1>
        <p className="text-text-muted">{t('subtitle')}</p>
      </div>

      {isLoading && !data ? (
        <LeaderboardSkeleton />
      ) : data ? (
        <LeaderboardTable
          entries={data.entries}
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          onPageChange={handlePageChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoading}
        />
      ) : null}
    </div>
  );
}
