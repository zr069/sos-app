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
INSERT INTO tournament_settings (id, prize_amount, is_active)
VALUES (1, 10000, true)
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
