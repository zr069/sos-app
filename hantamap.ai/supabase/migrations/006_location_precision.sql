-- Add location_precision to locations table
-- Values: exact, approximate, country_level, unknown

ALTER TABLE public.locations
ADD COLUMN IF NOT EXISTS precision text
  DEFAULT 'unknown'
  CHECK (precision IN ('exact', 'approximate', 'country_level', 'unknown'));
