'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LeaderboardPage() {
  const t = useTranslations('leaderboard');

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build API URL
  const apiUrl = useCallback(() => {
    const params = new URLSearchParams({ page: page.toString() });
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    }
    return `/api/leaderboard?${params}`;
  }, [page, debouncedSearch]);

  // Use SWR with stale-while-revalidate
  const { data, isLoading, isValidating } = useSWR<LeaderboardData>(
    apiUrl(),
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
      keepPreviousData: true,
      fallbackData: {
        entries: [],
        total: 0,
        page: 1,
        totalPages: 0,
      },
    }
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show skeleton only on initial load
  const showSkeleton = isLoading && !data?.entries?.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
          {t('title')}
        </h1>
        <p className="text-text-muted">{t('subtitle')}</p>
      </div>

      {showSkeleton ? (
        <LeaderboardSkeleton />
      ) : (
        <LeaderboardTable
          entries={data?.entries ?? []}
          page={data?.page ?? 1}
          totalPages={data?.totalPages ?? 0}
          total={data?.total ?? 0}
          onPageChange={handlePageChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isValidating}
        />
      )}
    </div>
  );
}
