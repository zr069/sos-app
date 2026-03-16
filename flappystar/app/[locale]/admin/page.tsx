'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { StatsSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { getCountryFlag } from '@/components/ui/CountrySelect';

interface Stats {
  totalEntries: number;
  uniqueCountries: number;
  highestScore: number;
  totalRevenue: string;
}

interface Settings {
  id: number;
  start_date: string | null;
  end_date: string | null;
  prize_amount: number;
  is_active: boolean;
  max_entries: number | null;
}

interface Entry {
  id: string;
  full_name: string;
  email: string;
  nickname: string;
  country: string;
  score: number;
  created_at: string;
}

interface EntriesData {
  entries: Entry[];
  total: number;
  page: number;
  totalPages: number;
}

// Helper to create auth header
const getAuthHeader = (password: string) => {
  return `Basic ${btoa(`admin:${password}`)}`;
};

export default function AdminPage() {
  const t = useTranslations('admin');

  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [entries, setEntries] = useState<EntriesData | null>(null);
  const [entriesPage, setEntriesPage] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmWinner, setShowConfirmWinner] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);

    try {
      const headers = { Authorization: getAuthHeader(password) };

      const [statsRes, settingsRes, entriesRes] = await Promise.all([
        fetch('/api/admin?type=stats', { headers }),
        fetch('/api/admin?type=settings', { headers }),
        fetch(`/api/admin?type=entries&page=${entriesPage}`, { headers }),
      ]);

      if (statsRes.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Session expired');
        return;
      }

      const [statsData, settingsData, entriesData] = await Promise.all([
        statsRes.json(),
        settingsRes.json(),
        entriesRes.json(),
      ]);

      setStats(statsData);
      setSettings(settingsData);
      setEntries(entriesData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, password, entriesPage]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const response = await fetch('/api/admin?type=stats', {
        headers: { Authorization: getAuthHeader(password) },
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setAuthError('Invalid password');
      }
    } catch (error) {
      setAuthError('Connection error');
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(password),
        },
        body: JSON.stringify({
          action: 'update_settings',
          settings: {
            start_date: settings.start_date,
            end_date: settings.end_date,
            prize_amount: settings.prize_amount,
            is_active: settings.is_active,
            max_entries: settings.max_entries,
          },
        }),
      });

      if (response.ok) {
        // Show success
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Flush cache
  const handleFlushCache = async () => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(password),
        },
        body: JSON.stringify({ action: 'flush_cache' }),
      });
    } catch (error) {
      console.error('Failed to flush cache:', error);
    }
  };

  // Declare winner
  const handleDeclareWinner = async () => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(password),
        },
        body: JSON.stringify({ action: 'declare_winner' }),
      });
      setShowConfirmWinner(false);
    } catch (error) {
      console.error('Failed to declare winner:', error);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!entries) return;

    const headers = ['Rank', 'Name', 'Email', 'Nickname', 'Country', 'Score', 'Date'];
    const rows = entries.entries.map((entry, index) => [
      (entriesPage - 1) * 50 + index + 1,
      entry.full_name,
      entry.email,
      entry.nickname,
      entry.country,
      entry.score,
      new Date(entry.created_at).toISOString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flappystar-entries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8"
        >
          <h1 className="text-2xl font-display font-bold text-white text-center mb-6">
            {t('title')}
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-surface-border rounded-lg text-white focus:outline-none focus:border-primary"
                placeholder="Enter admin password"
              />
            </div>

            {authError && (
              <p className="text-sm text-red-500">{authError}</p>
            )}

            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-white mb-8">
        {t('title')}
      </h1>

      {/* Stats */}
      <section className="mb-8">
        <h2 className="text-xl font-display font-bold text-white mb-4">
          {t('stats.title')}
        </h2>

        {isLoading && !stats ? (
          <StatsSkeleton />
        ) : stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-display font-bold text-primary">
                {stats.totalEntries}
              </div>
              <div className="text-xs text-text-muted">{t('stats.totalEntries')}</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-display font-bold text-white">
                {stats.uniqueCountries}
              </div>
              <div className="text-xs text-text-muted">{t('stats.uniqueCountries')}</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-display font-bold text-white">
                {stats.highestScore}
              </div>
              <div className="text-xs text-text-muted">{t('stats.highestScore')}</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-display font-bold gold-shimmer">
                €{stats.totalRevenue}
              </div>
              <div className="text-xs text-text-muted">{t('stats.totalRevenue')}</div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Settings */}
      <section className="mb-8">
        <h2 className="text-xl font-display font-bold text-white mb-4">
          {t('settings.title')}
        </h2>

        {settings && (
          <div className="glass-card rounded-xl p-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t('settings.endDate')}
                </label>
                <input
                  type="datetime-local"
                  value={settings.end_date?.slice(0, 16) || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      end_date: new Date(e.target.value).toISOString(),
                    })
                  }
                  className="w-full px-4 py-2 bg-surface border border-surface-border rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {t('settings.prizeAmount')}
                </label>
                <input
                  type="number"
                  value={settings.prize_amount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      prize_amount: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-4 py-2 bg-surface border border-surface-border rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.is_active}
                  onChange={(e) =>
                    setSettings({ ...settings, is_active: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-surface-border text-primary focus:ring-primary"
                />
                <span className="text-white">{t('settings.isActive')}</span>
              </label>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? 'Saving...' : t('settings.save')}
            </button>
          </div>
        )}
      </section>

      {/* Actions */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-4">
          <button onClick={handleFlushCache} className="btn-secondary">
            {t('actions.flushCache')}
          </button>

          <button
            onClick={() => setShowConfirmWinner(true)}
            className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-500 font-medium rounded-lg hover:bg-red-500/20 transition-colors"
          >
            {t('actions.declareWinner')}
          </button>
        </div>

        {showConfirmWinner && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-display font-bold text-white mb-4">
                Confirm Action
              </h3>
              <p className="text-text-muted mb-6">{t('actions.confirmWinner')}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmWinner(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeclareWinner}
                  className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Entries */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-white">
            {t('entries.title')}
          </h2>
          <button onClick={handleExportCSV} className="btn-secondary text-sm">
            {t('entries.export')}
          </button>
        </div>

        {isLoading && !entries ? (
          <TableSkeleton />
        ) : entries ? (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border text-left text-xs text-text-muted uppercase tracking-wider">
                    <th className="px-4 py-3">{t('entries.columns.rank')}</th>
                    <th className="px-4 py-3">{t('entries.columns.name')}</th>
                    <th className="px-4 py-3">{t('entries.columns.email')}</th>
                    <th className="px-4 py-3">{t('entries.columns.nickname')}</th>
                    <th className="px-4 py-3">{t('entries.columns.country')}</th>
                    <th className="px-4 py-3">{t('entries.columns.score')}</th>
                    <th className="px-4 py-3">{t('entries.columns.date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {entries.entries.map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white">
                        {(entriesPage - 1) * 50 + index + 1}
                      </td>
                      <td className="px-4 py-3 text-white">{entry.full_name}</td>
                      <td className="px-4 py-3 text-text-muted">{entry.email}</td>
                      <td className="px-4 py-3 text-white">{entry.nickname}</td>
                      <td className="px-4 py-3">
                        <span className="text-lg">
                          {getCountryFlag(entry.country)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-primary font-bold">
                        {entry.score}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-sm">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {entries.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-surface-border flex items-center justify-between">
                <span className="text-sm text-text-muted">
                  Page {entries.page} of {entries.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEntriesPage(entriesPage - 1)}
                    disabled={entriesPage <= 1}
                    className="px-3 py-1 text-sm border border-surface-border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setEntriesPage(entriesPage + 1)}
                    disabled={entriesPage >= entries.totalPages}
                    className="px-3 py-1 text-sm border border-surface-border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
