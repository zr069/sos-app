import { createClient } from '@supabase/supabase-js';

/**
 * Database Performance: Required Indexes
 * Run these in Supabase SQL Editor if not already created:
 *
 * -- Fast leaderboard queries (ORDER BY score DESC)
 * CREATE INDEX IF NOT EXISTS idx_entries_score ON tournament_entries(score DESC);
 *
 * -- Fast recent entries queries (ORDER BY created_at DESC)
 * CREATE INDEX IF NOT EXISTS idx_entries_created ON tournament_entries(created_at DESC);
 *
 * -- Fast country count (for stats)
 * CREATE INDEX IF NOT EXISTS idx_entries_country ON tournament_entries(country);
 */

// Types for our database
export interface TournamentEntry {
  id: string;
  created_at: string;
  stripe_session_id: string;
  full_name: string;
  email: string;
  nickname: string;
  country: string;
  score: number;
  ip_address: string | null;
  used: boolean;
}

export interface TournamentSettings {
  id: number;
  start_date: string | null;
  end_date: string | null;
  prize_amount: number;
  is_active: boolean;
  max_entries: number | null;
}

// Client-side Supabase client (uses anon key, limited access)
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Server-side Supabase client with service role (full access)
// Uses PgBouncer connection pooling for scalability
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase server environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  });
}

// Database helper functions
export async function getLeaderboard(page: number = 1, limit: number = 25) {
  const supabase = createServerClient();
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('tournament_entries')
    .select('id, nickname, country, score, created_at', { count: 'exact' })
    .order('score', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    entries: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getTopLeaderboard(limit: number = 10) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('tournament_entries')
    .select('id, nickname, country, score')
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data || [];
}

export async function submitScore(entry: {
  stripe_session_id: string;
  full_name: string;
  email: string;
  nickname: string;
  country: string;
  score: number;
  ip_address?: string;
}) {
  const supabase = createServerClient();

  // Use INSERT ... ON CONFLICT DO NOTHING for idempotency
  const { data, error } = await supabase
    .from('tournament_entries')
    .insert({
      ...entry,
      used: true,
    })
    .select()
    .single();

  if (error) {
    // Check if it's a duplicate key error
    if (error.code === '23505') {
      return { duplicate: true };
    }
    throw error;
  }

  // Get the rank
  const { count } = await supabase
    .from('tournament_entries')
    .select('*', { count: 'exact', head: true })
    .gt('score', entry.score);

  const rank = (count || 0) + 1;

  return { data, rank, duplicate: false };
}

export async function isSessionUsed(sessionId: string): Promise<boolean> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('tournament_entries')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return !!data;
}

export async function getTournamentSettings(): Promise<TournamentSettings | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('tournament_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

export async function updateTournamentSettings(settings: Partial<TournamentSettings>) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('tournament_settings')
    .upsert({ id: 1, ...settings })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getTournamentStats() {
  const supabase = createServerClient();

  // Get total entries
  const { count: totalEntries } = await supabase
    .from('tournament_entries')
    .select('*', { count: 'exact', head: true });

  // Get unique countries
  const { data: countriesData } = await supabase
    .from('tournament_entries')
    .select('country');

  const uniqueCountries = new Set(countriesData?.map((e) => e.country)).size;

  // Get highest score
  const { data: topScore } = await supabase
    .from('tournament_entries')
    .select('score')
    .order('score', { ascending: false })
    .limit(1)
    .single();

  return {
    totalEntries: totalEntries || 0,
    uniqueCountries,
    highestScore: topScore?.score || 0,
    totalRevenue: ((totalEntries || 0) * 0.5).toFixed(2),
  };
}

export async function getAllEntries(page: number = 1, limit: number = 50) {
  const supabase = createServerClient();
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('tournament_entries')
    .select('*', { count: 'exact' })
    .order('score', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    entries: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function searchLeaderboard(query: string, page: number = 1, limit: number = 25) {
  const supabase = createServerClient();
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('tournament_entries')
    .select('id, nickname, country, score, created_at', { count: 'exact' })
    .ilike('nickname', `%${query}%`)
    .order('score', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    entries: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

// ============================================
// GAME SESSION FUNCTIONS (Anti-Cheat)
// ============================================

export interface GameSession {
  id: string;
  token: string;
  stripe_session_id: string;
  created_at: string;
  expires_at: string;
  game_start_server_time: string;
  used: boolean;
  used_at: string | null;
  validated_score: number | null;
  retry_count: number;
  cheat_flags: string[];
}

/**
 * Delete expired unused game sessions for a stripe session
 */
export async function deleteExpiredGameSessions(stripeSessionId: string): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from('game_sessions')
    .delete()
    .eq('stripe_session_id', stripeSessionId)
    .eq('used', false)
    .lt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Failed to delete expired sessions:', error);
  }
}

/**
 * Create a new game session token
 */
export async function createGameSession(
  stripeSessionId: string,
  expiresInMs: number = 30 * 60 * 1000
): Promise<{ token: string; expiresAt: string }> {
  const supabase = createServerClient();

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + expiresInMs).toISOString();

  const { error } = await supabase.from('game_sessions').insert({
    token,
    stripe_session_id: stripeSessionId,
    expires_at: expiresAt,
  });

  if (error) throw error;

  return { token, expiresAt };
}

/**
 * Get and validate a game session token
 */
export async function getGameSession(token: string): Promise<GameSession | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('token', token)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

/**
 * Check if a stripe session already has an active (unused, not expired) game token
 */
export async function getActiveGameSessionForStripe(
  stripeSessionId: string
): Promise<GameSession | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('stripe_session_id', stripeSessionId)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

/**
 * SECURITY: Check if stripe session has ANY game session (used or unused)
 * Prevents replay attacks where user tries to get multiple tokens
 */
export async function getAnyGameSessionForStripe(
  stripeSessionId: string
): Promise<{ session: GameSession | null; hasUsedSession: boolean }> {
  const supabase = createServerClient();

  // Get the most recent session for this stripe_session_id
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('stripe_session_id', stripeSessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!data) {
    return { session: null, hasUsedSession: false };
  }

  return {
    session: data,
    hasUsedSession: data.used === true,
  };
}

/**
 * SECURITY: Check if tournament entry exists for this stripe session
 */
export async function hasExistingTournamentEntry(
  stripeSessionId: string
): Promise<boolean> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('tournament_entries')
    .select('id')
    .eq('stripe_session_id', stripeSessionId)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return !!data;
}

/**
 * SECURITY: Get request count for a stripe session (rate limiting)
 */
export async function getGameSessionRequestCount(
  stripeSessionId: string
): Promise<number> {
  const supabase = createServerClient();

  const { count, error } = await supabase
    .from('game_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('stripe_session_id', stripeSessionId);

  if (error) {
    console.error('Failed to get request count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * SECURITY: Simple in-memory rate limiter for validation attempts by IP
 */
const validationAttemptsByIP = new Map<string, { count: number; resetAt: number }>();

export function checkValidationRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxAttempts = 3;

  const record = validationAttemptsByIP.get(ip);

  if (!record || record.resetAt < now) {
    // New window or expired
    validationAttemptsByIP.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count };
}

// Cleanup old entries periodically (call this occasionally)
export function cleanupRateLimitRecords(): void {
  const now = Date.now();
  validationAttemptsByIP.forEach((record, ip) => {
    if (record.resetAt < now) {
      validationAttemptsByIP.delete(ip);
    }
  });
}

/**
 * Mark a game session as used with the validated score
 */
export async function markGameSessionUsed(
  token: string,
  score: number,
  cheatFlags: string[] = []
): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from('game_sessions')
    .update({
      used: true,
      used_at: new Date().toISOString(),
      validated_score: score,
      cheat_flags: cheatFlags,
    })
    .eq('token', token);

  if (error) throw error;
}

/**
 * Increment retry count for a game session
 */
export async function incrementGameSessionRetry(token: string): Promise<number> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('game_sessions')
    .update({ retry_count: supabase.rpc('increment') })
    .eq('token', token)
    .select('retry_count')
    .single();

  if (error) {
    // Fallback: do manual increment
    const session = await getGameSession(token);
    if (session) {
      const newCount = (session.retry_count || 0) + 1;
      await supabase
        .from('game_sessions')
        .update({ retry_count: newCount })
        .eq('token', token);
      return newCount;
    }
    throw error;
  }

  return data?.retry_count || 1;
}

/**
 * Log a cheat attempt
 */
export async function logCheatAttempt(attempt: {
  stripe_session_id?: string;
  game_session_token?: string;
  ip_address?: string;
  claimed_score: number;
  server_score: number;
  reason: string;
  flags: string[];
  inputs_count: number;
  game_duration_ms: number;
}): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase.from('cheat_attempts').insert({
    stripe_session_id: attempt.stripe_session_id,
    game_session_token: attempt.game_session_token,
    ip_address: attempt.ip_address,
    claimed_score: attempt.claimed_score,
    server_score: attempt.server_score,
    reason: attempt.reason,
    flags: attempt.flags,
    inputs_count: attempt.inputs_count,
    game_duration_ms: attempt.game_duration_ms,
  });

  if (error) {
    console.error('Failed to log cheat attempt:', error);
  }
}

/**
 * Get cheat attempts with pagination
 */
export async function getCheatAttempts(page: number = 1, limit: number = 50) {
  const supabase = createServerClient();
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('cheat_attempts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    attempts: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Log a validation attempt (success or failure)
 */
export async function logValidationAttempt(log: {
  game_session_id?: string;
  stripe_session_id?: string;
  ip_address?: string;
  claimed_score: number;
  server_score: number;
  valid: boolean;
  cheat_flags: string[];
  timing_stats?: Record<string, unknown>;
  duration_ms: number;
}): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase.from('validation_log').insert({
    game_session_id: log.game_session_id,
    stripe_session_id: log.stripe_session_id,
    ip_address: log.ip_address,
    claimed_score: log.claimed_score,
    server_score: log.server_score,
    valid: log.valid,
    cheat_flags: log.cheat_flags,
    timing_stats: log.timing_stats,
    duration_ms: log.duration_ms,
  });

  if (error) {
    console.error('Failed to log validation attempt:', error);
  }
}
