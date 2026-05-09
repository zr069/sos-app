-- ============================================================
-- MV Hondius Andes-Hantavirus Outbreak Seed Data
-- All data is sourced from WHO and ECDC public statements.
-- Nothing is auto-published. All records are drafts.
-- Admin must review and explicitly publish each record.
-- ============================================================

-- Sources (verified, publicly available)
INSERT INTO public.sources (id, title, publisher, url, published_at, source_type, reliability_level)
VALUES
  (
    'a0000001-seed-0001-0001-000000000001',
    'WHO response to hantavirus cases linked to a cruise ship',
    'World Health Organization',
    'https://www.who.int/news/item/07-05-2026-who-s-response-to-hantavirus-cases-linked-to-a-cruise-ship',
    '2026-05-07T00:00:00Z',
    'who',
    5
  ),
  (
    'a0000001-seed-0001-0001-000000000002',
    'Hantavirus - cruise ship, 2026-DON599',
    'World Health Organization',
    'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599',
    '2026-05-05T00:00:00Z',
    'who',
    5
  ),
  (
    'a0000001-seed-0001-0001-000000000003',
    'Andes hantavirus outbreak linked to cruise ship, May 2026',
    'European Centre for Disease Prevention and Control',
    'https://www.ecdc.europa.eu/en/infectious-disease-topics/hantavirus-infection/surveillance-and-updates/andes-hantavirus-outbreak',
    '2026-05-08T00:00:00Z',
    'ecdc',
    5
  )
ON CONFLICT (id) DO NOTHING;

-- Outbreak (draft, not published)
INSERT INTO public.outbreaks (id, slug, name, pathogen_name, summary, status, transmission_notes, what_is_known, what_is_not_known, what_to_do, first_reported_at, last_reviewed_at, published)
VALUES (
  'b0000001-seed-0001-0001-000000000001',
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
  false
)
ON CONFLICT (id) DO NOTHING;

-- Location (approximate, vessel position not verified)
INSERT INTO public.locations (id, country, region, city, latitude, longitude, precision)
VALUES (
  'c0000001-seed-0001-0001-000000000001',
  'International waters',
  'South Atlantic',
  'MV Hondius (cruise ship)',
  -33.9,
  -18.5,
  'approximate'
)
ON CONFLICT (id) DO NOTHING;

-- Report (draft, not published, linked to outbreak and location)
INSERT INTO public.reports (id, outbreak_id, location_id, status, confirmed_cases, probable_cases, suspected_cases, deaths, recovered, report_date, verification_status, editor_note, published)
VALUES (
  'd0000001-seed-0001-0001-000000000001',
  'b0000001-seed-0001-0001-000000000001',
  'c0000001-seed-0001-0001-000000000001',
  'confirmed',
  5,
  NULL,
  3,
  3,
  NULL,
  '2026-05-07T00:00:00Z',
  'verified',
  'Case counts from WHO 7 May 2026 statement: 5 confirmed cases, 3 deaths. WHO also references 8 total reported cases. The 3 suspected_cases here represent the difference between 8 total reported and 5 confirmed. probable_cases is null because WHO does not separately categorize probable cases in this statement. recovered is null because recovery status is not stated by WHO. Location marker is approximate and does not represent a verified vessel position.',
  false
)
ON CONFLICT (id) DO NOTHING;

-- Link all 3 sources to the report
INSERT INTO public.report_sources (report_id, source_id)
VALUES
  ('d0000001-seed-0001-0001-000000000001', 'a0000001-seed-0001-0001-000000000001'),
  ('d0000001-seed-0001-0001-000000000001', 'a0000001-seed-0001-0001-000000000002'),
  ('d0000001-seed-0001-0001-000000000001', 'a0000001-seed-0001-0001-000000000003')
ON CONFLICT (report_id, source_id) DO NOTHING;

-- Create an initial update (draft, not published)
INSERT INTO public.updates (id, outbreak_id, title, summary, body, location_id, verification_status, published, published_at)
VALUES (
  'e0000001-seed-0001-0001-000000000001',
  'b0000001-seed-0001-0001-000000000001',
  'WHO confirms Andes hantavirus cases linked to MV Hondius cruise ship',
  'WHO confirmed 5 cases of Andes hantavirus infection and 3 deaths among passengers and crew of the MV Hondius Antarctic expedition cruise. Close contacts are being monitored.',
  NULL,
  'c0000001-seed-0001-0001-000000000001',
  'verified',
  false,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Link sources to the update
INSERT INTO public.update_sources (update_id, source_id)
VALUES
  ('e0000001-seed-0001-0001-000000000001', 'a0000001-seed-0001-0001-000000000001'),
  ('e0000001-seed-0001-0001-000000000001', 'a0000001-seed-0001-0001-000000000002'),
  ('e0000001-seed-0001-0001-000000000001', 'a0000001-seed-0001-0001-000000000003')
ON CONFLICT (update_id, source_id) DO NOTHING;
