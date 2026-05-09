-- Add city_level to location precision check constraint
ALTER TABLE public.locations DROP CONSTRAINT IF EXISTS locations_precision_check;
ALTER TABLE public.locations ADD CONSTRAINT locations_precision_check
  CHECK (precision IN ('exact', 'approximate', 'city_level', 'country_level', 'unknown'));
