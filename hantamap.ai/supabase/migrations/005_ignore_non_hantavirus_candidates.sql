-- Mark all existing source_candidates as ignored unless they match
-- the Hantavirus MVP topic filter.
--
-- Matching terms (case-insensitive):
--   hantavirus, hanta virus, andes virus, andes hantavirus,
--   orthohantavirus, hantavirus pulmonary syndrome,
--   hantavirus cardiopulmonary syndrome, HPS, HCPS, HFRS,
--   hemorrhagic fever with renal syndrome,
--   haemorrhagic fever with renal syndrome,
--   MV Hondius, Hondius
--
-- Does NOT delete any rows. Sets review_status = 'ignored'.

UPDATE public.source_candidates
SET review_status = 'ignored', updated_at = now()
WHERE review_status = 'pending'
  AND id NOT IN (
    SELECT id FROM public.source_candidates
    WHERE
      lower(title || ' ' || coalesce(extracted_summary, '') || ' ' || coalesce(raw_payload::text, ''))
      ~* '(hantavirus|hanta virus|andes virus|andes hantavirus|orthohantavirus|hantavirus pulmonary syndrome|hantavirus cardiopulmonary syndrome|hemorrhagic fever with renal syndrome|haemorrhagic fever with renal syndrome|hfrs|hcps|hondius)'
  );
