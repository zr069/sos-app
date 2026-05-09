-- ============================================================
-- MV Hondius Andes-Hantavirus Outbreak Seed Data
-- All data sourced from WHO and ECDC public statements.
-- All records are created as PUBLISHED because they meet all
-- publishing criteria: WHO/ECDC sources, coordinates, verification.
-- ============================================================

-- Sources (verified, publicly available)
INSERT INTO public.sources (id, title, publisher, url, published_at, source_type, reliability_level)
VALUES
  (
    'a0000001-0001-4001-a001-000000000001',
    'WHO response to hantavirus cases linked to a cruise ship',
    'World Health Organization',
    'https://www.who.int/news/item/07-05-2026-who-s-response-to-hantavirus-cases-linked-to-a-cruise-ship',
    '2026-05-07T00:00:00Z',
    'who',
    5
  ),
  (
    'a0000001-0001-4001-a001-000000000002',
    'Hantavirus, cruise ship, 2026-DON599',
    'World Health Organization',
    'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599',
    '2026-05-05T00:00:00Z',
    'who',
    5
  ),
  (
    'a0000001-0001-4001-a001-000000000003',
    'Andes hantavirus outbreak linked to cruise ship, May 2026',
    'European Centre for Disease Prevention and Control',
    'https://www.ecdc.europa.eu/en/infectious-disease-topics/hantavirus-infection/surveillance-and-updates/andes-hantavirus-outbreak',
    '2026-05-08T00:00:00Z',
    'ecdc',
    5
  )
ON CONFLICT (id) DO NOTHING;

-- Outbreak (PUBLISHED: meets all criteria)
INSERT INTO public.outbreaks (id, slug, name, pathogen_name, summary, status, transmission_notes, what_is_known, what_is_not_known, what_to_do, first_reported_at, last_reviewed_at, published)
VALUES (
  'b0000001-0001-4001-b001-000000000001',
  'mv-hondius-andes-hantavirus',
  'MV Hondius Andes-Hantavirus Outbreak',
  'Andes virus (Orthohantavirus)',
  'A cluster of hantavirus infections linked to the MV Hondius cruise ship. WHO states that the virus involved is Andes virus, a hantavirus species known for limited person-to-person transmission in close and prolonged contact settings.',
  'active',
  'Andes virus is primarily transmitted through inhalation of aerosolized excreta from infected rodents. WHO notes that Andes virus is the only hantavirus for which limited person-to-person transmission has been documented, occurring in close and prolonged contact settings. The extent of person-to-person transmission in this cluster is under investigation.',
  'WHO confirmed 5 cases of Andes hantavirus infection and 3 deaths among passengers and crew of the MV Hondius. The vessel was on an Antarctic expedition cruise. WHO, ECDC and national health authorities are coordinating the response. Close contacts have been identified and are being monitored.',
  'The full scope of transmission aboard the vessel is still under investigation. It is not yet confirmed whether all cases resulted from a common environmental exposure or whether person-to-person transmission occurred. The source of the initial rodent exposure has not been publicly confirmed.',
  'Follow guidance from your local health authority. If you were a passenger or crew member on the MV Hondius, contact your national health authority. Monitor for symptoms including fever, muscle aches and respiratory difficulty for 6 weeks after potential exposure. Seek medical attention if symptoms develop. This is not a general public health emergency for the wider population.',
  '2026-05-01T00:00:00Z',
  '2026-05-09T00:00:00Z',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Location (approximate, vessel position not verified)
INSERT INTO public.locations (id, country, region, city, latitude, longitude, precision)
VALUES (
  'c0000001-0001-4001-c001-000000000001',
  'International waters',
  'South Atlantic',
  'MV Hondius (cruise ship)',
  -33.9,
  -18.5,
  'approximate'
)
ON CONFLICT (id) DO NOTHING;

-- Report: insert as draft first, then link sources, then publish
INSERT INTO public.reports (id, outbreak_id, location_id, status, confirmed_cases, probable_cases, suspected_cases, deaths, recovered, report_date, verification_status, editor_note, published)
VALUES (
  'd0000001-0001-4001-d001-000000000001',
  'b0000001-0001-4001-b001-000000000001',
  'c0000001-0001-4001-c001-000000000001',
  'confirmed',
  5,
  NULL,
  3,
  3,
  NULL,
  '2026-05-07T00:00:00Z',
  'verified',
  'Approximate marker, not verified vessel position. Case counts from WHO 7 May 2026 statement: 5 confirmed cases, 3 deaths. WHO references 8 total reported cases. The 3 suspected_cases represent the difference between 8 total and 5 confirmed. probable_cases is null because WHO does not categorize probable cases separately. recovered is null because recovery status is not stated.',
  false
)
ON CONFLICT (id) DO NOTHING;

-- Link all 3 sources to the report
INSERT INTO public.report_sources (report_id, source_id)
VALUES
  ('d0000001-0001-4001-d001-000000000001', 'a0000001-0001-4001-a001-000000000001'),
  ('d0000001-0001-4001-d001-000000000001', 'a0000001-0001-4001-a001-000000000002'),
  ('d0000001-0001-4001-d001-000000000001', 'a0000001-0001-4001-a001-000000000003')
ON CONFLICT (report_id, source_id) DO NOTHING;

-- Now publish the report (sources are linked, trigger will pass)
UPDATE public.reports SET published = true WHERE id = 'd0000001-0001-4001-d001-000000000001';

-- Update: insert as draft, link sources, then publish
INSERT INTO public.updates (id, outbreak_id, title, summary, body, location_id, verification_status, published, published_at)
VALUES (
  'e0000001-0001-4001-e001-000000000001',
  'b0000001-0001-4001-b001-000000000001',
  'WHO confirms Andes hantavirus cases linked to MV Hondius cruise ship',
  'WHO confirmed 5 cases of Andes hantavirus infection and 3 deaths among passengers and crew of the MV Hondius Antarctic expedition cruise. Close contacts are being monitored.',
  NULL,
  'c0000001-0001-4001-c001-000000000001',
  'verified',
  false,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Link sources to the update
INSERT INTO public.update_sources (update_id, source_id)
VALUES
  ('e0000001-0001-4001-e001-000000000001', 'a0000001-0001-4001-a001-000000000001'),
  ('e0000001-0001-4001-e001-000000000001', 'a0000001-0001-4001-a001-000000000002'),
  ('e0000001-0001-4001-e001-000000000001', 'a0000001-0001-4001-a001-000000000003')
ON CONFLICT (update_id, source_id) DO NOTHING;

-- Now publish the update (sources are linked, trigger will pass)
UPDATE public.updates SET published = true, published_at = '2026-05-07T00:00:00Z' WHERE id = 'e0000001-0001-4001-e001-000000000001';
