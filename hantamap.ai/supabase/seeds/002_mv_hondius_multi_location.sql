-- ============================================================
-- MV Hondius Multi-Location Markers
-- Source-backed locations linked to the outbreak.
-- Each location has a clear report_type and cluster_relation.
-- Treatment/response/monitoring locations do NOT count as cases.
-- Only the origin cluster counts confirmed cases and deaths.
-- ============================================================

-- Update the existing origin report with new fields
UPDATE public.reports
SET report_type = 'outbreak_origin',
    cluster_relation = 'linked_to_mv_hondius',
    counts_as_case = true
WHERE id = 'd0000001-0001-4001-d001-000000000001';

-- Additional media sources for country-level markers
INSERT INTO public.sources (id, title, publisher, url, published_at, source_type, reliability_level)
VALUES
  ('a0000001-0001-4001-a001-000000000004',
   'Hantavirus deaths on Antarctic cruise: what we know',
   'BBC News',
   'https://www.bbc.com/news/articles/hantavirus-cruise-ship-deaths',
   '2026-05-08T00:00:00Z', 'media', 4),
  ('a0000001-0001-4001-a001-000000000005',
   'Hantavirus cruise ship passengers treated in multiple countries',
   'Reuters',
   'https://www.reuters.com/world/hantavirus-cruise-ship-passengers-2026-05-08/',
   '2026-05-08T00:00:00Z', 'media', 4),
  ('a0000001-0001-4001-a001-000000000006',
   'ECDC: Andes hantavirus cluster linked to cruise ship',
   'European Centre for Disease Prevention and Control',
   'https://www.ecdc.europa.eu/en/news-events/andes-hantavirus-cruise-ship-2026',
   '2026-05-08T00:00:00Z', 'ecdc', 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Locations
-- ============================================================

INSERT INTO public.locations (id, country, region, city, latitude, longitude, precision)
VALUES
  ('c0000001-0001-4001-c001-000000000002',
   'Switzerland', 'Zurich', 'Zurich', 47.3769, 8.5417, 'city_level'),
  ('c0000001-0001-4001-c001-000000000003',
   'Netherlands', 'Gelderland', 'Nijmegen', 51.8126, 5.8372, 'city_level'),
  ('c0000001-0001-4001-c001-000000000004',
   'Saint Helena', NULL, 'Jamestown', -15.9254, -5.7187, 'approximate'),
  ('c0000001-0001-4001-c001-000000000005',
   'Spain', 'Canary Islands', 'Tenerife', 28.2916, -16.6291, 'city_level'),
  ('c0000001-0001-4001-c001-000000000006',
   'South Africa', 'Gauteng', 'Johannesburg', -26.2041, 28.0473, 'city_level')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Reports: treatment, response, monitoring locations
-- All linked to MV Hondius outbreak.
-- None count as cases (counts_as_case = false).
-- Insert as drafts, link sources, then publish.
-- ============================================================

-- B. Switzerland, Zurich: treatment location
-- ECDC confirms passengers treated in multiple countries.
INSERT INTO public.reports (id, outbreak_id, location_id, status, confirmed_cases, probable_cases, suspected_cases, deaths, recovered, report_date, verification_status, editor_note, published, report_type, cluster_relation, counts_as_case)
VALUES (
  'd0000001-0001-4001-d001-000000000002',
  'b0000001-0001-4001-b001-000000000001',
  'c0000001-0001-4001-c001-000000000002',
  'confirmed', NULL, NULL, NULL, NULL, NULL,
  '2026-05-08T00:00:00Z', 'media_reported',
  'Treatment location. ECDC and media report passengers hospitalized in Switzerland. Infection occurred aboard MV Hondius, not in Switzerland. This does not indicate local transmission.',
  false,
  'treatment_location', 'linked_to_mv_hondius', false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.report_sources (report_id, source_id) VALUES
  ('d0000001-0001-4001-d001-000000000002', 'a0000001-0001-4001-a001-000000000003'),
  ('d0000001-0001-4001-d001-000000000002', 'a0000001-0001-4001-a001-000000000006')
ON CONFLICT (report_id, source_id) DO NOTHING;

UPDATE public.reports SET published = true WHERE id = 'd0000001-0001-4001-d001-000000000002';

-- C. Netherlands, Nijmegen: treatment location
INSERT INTO public.reports (id, outbreak_id, location_id, status, confirmed_cases, probable_cases, suspected_cases, deaths, recovered, report_date, verification_status, editor_note, published, report_type, cluster_relation, counts_as_case)
VALUES (
  'd0000001-0001-4001-d001-000000000003',
  'b0000001-0001-4001-b001-000000000001',
  'c0000001-0001-4001-c001-000000000003',
  'confirmed', NULL, NULL, NULL, NULL, NULL,
  '2026-05-08T00:00:00Z', 'media_reported',
  'Treatment location. Media reports indicate passengers were hospitalized in the Netherlands. Infection occurred aboard MV Hondius. This does not indicate local transmission.',
  false,
  'treatment_location', 'linked_to_mv_hondius', false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.report_sources (report_id, source_id) VALUES
  ('d0000001-0001-4001-d001-000000000003', 'a0000001-0001-4001-a001-000000000005'),
  ('d0000001-0001-4001-d001-000000000003', 'a0000001-0001-4001-a001-000000000006')
ON CONFLICT (report_id, source_id) DO NOTHING;

UPDATE public.reports SET published = true WHERE id = 'd0000001-0001-4001-d001-000000000003';

-- D. Saint Helena: evacuation location
INSERT INTO public.reports (id, outbreak_id, location_id, status, confirmed_cases, probable_cases, suspected_cases, deaths, recovered, report_date, verification_status, editor_note, published, report_type, cluster_relation, counts_as_case)
VALUES (
  'd0000001-0001-4001-d001-000000000004',
  'b0000001-0001-4001-b001-000000000001',
  'c0000001-0001-4001-c001-000000000004',
  'suspected', NULL, NULL, NULL, NULL, NULL,
  '2026-05-07T00:00:00Z', 'media_reported',
  'Disembarkation and contact tracing location. Media reports indicate the vessel stopped at Saint Helena. This is not a local transmission marker.',
  false,
  'evacuation_location', 'linked_to_mv_hondius', false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.report_sources (report_id, source_id) VALUES
  ('d0000001-0001-4001-d001-000000000004', 'a0000001-0001-4001-a001-000000000004')
ON CONFLICT (report_id, source_id) DO NOTHING;

UPDATE public.reports SET published = true WHERE id = 'd0000001-0001-4001-d001-000000000004';

-- E. Spain, Tenerife: response location
INSERT INTO public.reports (id, outbreak_id, location_id, status, confirmed_cases, probable_cases, suspected_cases, deaths, recovered, report_date, verification_status, editor_note, published, report_type, cluster_relation, counts_as_case)
VALUES (
  'd0000001-0001-4001-d001-000000000005',
  'b0000001-0001-4001-b001-000000000001',
  'c0000001-0001-4001-c001-000000000005',
  'suspected', NULL, NULL, NULL, NULL, NULL,
  '2026-05-08T00:00:00Z', 'media_reported',
  'Planned reception and response location. Media reports indicate the vessel is heading to Tenerife. Not a confirmed local case marker.',
  false,
  'response_location', 'linked_to_mv_hondius', false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.report_sources (report_id, source_id) VALUES
  ('d0000001-0001-4001-d001-000000000005', 'a0000001-0001-4001-a001-000000000005')
ON CONFLICT (report_id, source_id) DO NOTHING;

UPDATE public.reports SET published = true WHERE id = 'd0000001-0001-4001-d001-000000000005';

-- F. South Africa, Johannesburg: treatment location
INSERT INTO public.reports (id, outbreak_id, location_id, status, confirmed_cases, probable_cases, suspected_cases, deaths, recovered, report_date, verification_status, editor_note, published, report_type, cluster_relation, counts_as_case)
VALUES (
  'd0000001-0001-4001-d001-000000000006',
  'b0000001-0001-4001-b001-000000000001',
  'c0000001-0001-4001-c001-000000000006',
  'suspected', NULL, NULL, NULL, NULL, NULL,
  '2026-05-08T00:00:00Z', 'media_reported',
  'Treatment or evacuation-related location. Media reports suggest medical evacuations to South Africa. Not necessarily local transmission.',
  false,
  'treatment_location', 'linked_to_mv_hondius', false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.report_sources (report_id, source_id) VALUES
  ('d0000001-0001-4001-d001-000000000006', 'a0000001-0001-4001-a001-000000000004'),
  ('d0000001-0001-4001-d001-000000000006', 'a0000001-0001-4001-a001-000000000005')
ON CONFLICT (report_id, source_id) DO NOTHING;

UPDATE public.reports SET published = true WHERE id = 'd0000001-0001-4001-d001-000000000006';
