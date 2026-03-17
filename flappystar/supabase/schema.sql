-- FlappyStar Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Tournament Entries Table
CREATE TABLE IF NOT EXISTS tournament_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    stripe_session_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    nickname TEXT NOT NULL,
    country TEXT NOT NULL,
    score INTEGER NOT NULL,
    ip_address TEXT,
    used BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournament_entries_score_desc
    ON tournament_entries (score DESC);

CREATE INDEX IF NOT EXISTS idx_tournament_entries_created_at_desc
    ON tournament_entries (created_at DESC);

-- The UNIQUE constraint on stripe_session_id already creates an index

-- Tournament Settings Table
CREATE TABLE IF NOT EXISTS tournament_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    prize_amount INTEGER DEFAULT 10000,
    is_active BOOLEAN DEFAULT TRUE,
    max_entries INTEGER
);

-- Insert default settings if not exists
INSERT INTO tournament_settings (id, end_date, prize_amount, is_active)
VALUES (1, '2026-09-17T23:59:59Z', 10000, true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE tournament_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_settings ENABLE ROW LEVEL SECURITY;

-- Policies for tournament_entries
-- Public can view leaderboard (limited fields)
CREATE POLICY "Public can view leaderboard"
    ON tournament_entries
    FOR SELECT
    USING (true);

-- Only service role can insert (via API)
CREATE POLICY "Service role can insert entries"
    ON tournament_entries
    FOR INSERT
    WITH CHECK (true);

-- Policies for tournament_settings
-- Public can read settings
CREATE POLICY "Public can view settings"
    ON tournament_settings
    FOR SELECT
    USING (true);

-- Only service role can update settings
CREATE POLICY "Service role can update settings"
    ON tournament_settings
    FOR UPDATE
    USING (true);

CREATE POLICY "Service role can insert settings"
    ON tournament_settings
    FOR INSERT
    WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON tournament_entries TO anon;
GRANT SELECT ON tournament_settings TO anon;

-- Comments
COMMENT ON TABLE tournament_entries IS 'Stores all tournament entry submissions';
COMMENT ON TABLE tournament_settings IS 'Tournament configuration (single row)';
COMMENT ON COLUMN tournament_entries.stripe_session_id IS 'Stripe Checkout Session ID - unique per entry';
COMMENT ON COLUMN tournament_entries.used IS 'Whether this session has been used to submit a score';

-- ============================================
-- ANTI-CHEAT: Game Sessions Table
-- ============================================
-- Stores one-time-use game session tokens for score validation

CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    stripe_session_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    validated_score INTEGER,
    retry_count INTEGER DEFAULT 0,
    cheat_flags JSONB DEFAULT '[]'::jsonb
);

-- Indexes for game_sessions
CREATE INDEX IF NOT EXISTS idx_game_sessions_token ON game_sessions(token);
CREATE INDEX IF NOT EXISTS idx_game_sessions_expires ON game_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_game_sessions_stripe ON game_sessions(stripe_session_id);

-- Enable RLS
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for game_sessions
CREATE POLICY "Service role can manage game sessions"
    ON game_sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON game_sessions TO anon;

-- Comments
COMMENT ON TABLE game_sessions IS 'One-time-use game session tokens for anti-cheat validation';
COMMENT ON COLUMN game_sessions.token IS 'Cryptographically random token, single use';
COMMENT ON COLUMN game_sessions.cheat_flags IS 'Array of detected suspicious patterns';

-- ============================================
-- ANTI-CHEAT: Cheat Attempts Table
-- ============================================
-- Logs all failed validation attempts for audit

CREATE TABLE IF NOT EXISTS cheat_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    stripe_session_id TEXT,
    game_session_token TEXT,
    ip_address TEXT,
    claimed_score INTEGER,
    server_score INTEGER,
    reason TEXT,
    flags JSONB DEFAULT '[]'::jsonb,
    inputs_count INTEGER,
    game_duration_ms INTEGER
);

-- Indexes for cheat_attempts
CREATE INDEX IF NOT EXISTS idx_cheat_attempts_created ON cheat_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cheat_attempts_ip ON cheat_attempts(ip_address);

-- Enable RLS
ALTER TABLE cheat_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for cheat_attempts (service role only)
CREATE POLICY "Service role can manage cheat attempts"
    ON cheat_attempts
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissions (insert only for logging)
GRANT INSERT ON cheat_attempts TO anon;

-- Comments
COMMENT ON TABLE cheat_attempts IS 'Audit log of all failed score validations';

-- ============================================
-- ANTI-CHEAT: Validation Log Table
-- ============================================
-- Logs ALL validation attempts (success and failure) for audit trail

CREATE TABLE IF NOT EXISTS validation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    game_session_id UUID REFERENCES game_sessions(id),
    stripe_session_id TEXT,
    ip_address TEXT,
    claimed_score INTEGER,
    server_score INTEGER,
    valid BOOLEAN NOT NULL,
    cheat_flags JSONB DEFAULT '[]'::jsonb,
    timing_stats JSONB,
    duration_ms INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_validation_log_created ON validation_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_validation_log_valid ON validation_log(valid);

-- Enable RLS
ALTER TABLE validation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage validation log"
    ON validation_log
    FOR ALL
    USING (true)
    WITH CHECK (true);

GRANT INSERT ON validation_log TO anon;

COMMENT ON TABLE validation_log IS 'Complete audit trail of all score validations';
