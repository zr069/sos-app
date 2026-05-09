-- Add media monitoring fields to source_candidates
-- Supports official, media, and aggregator source types

ALTER TABLE public.source_candidates
ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'official'
  CHECK (source_type IN ('official', 'media', 'aggregator')),
ADD COLUMN IF NOT EXISTS confidence_level text DEFAULT 'medium'
  CHECK (confidence_level IN ('official', 'high', 'medium', 'low')),
ADD COLUMN IF NOT EXISTS original_publisher text,
ADD COLUMN IF NOT EXISTS aggregator_source text,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- is_public: media monitoring items that are approved for the public
-- media layer. NOT the same as a verified published report.

-- Index for public media items
CREATE INDEX IF NOT EXISTS idx_source_candidates_public
  ON public.source_candidates(is_public) WHERE is_public = true;

-- Policy: allow anonymous read of public media monitoring items
CREATE POLICY "Public can view public media candidates"
  ON public.source_candidates FOR SELECT
  USING (is_public = true);
