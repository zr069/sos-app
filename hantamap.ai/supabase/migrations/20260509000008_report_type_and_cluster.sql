-- Add report_type, cluster_relation and source_type_detail to reports
-- These fields classify what a map marker represents

ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS report_type text DEFAULT 'confirmed_case_location'
  CHECK (report_type IN (
    'outbreak_origin',
    'confirmed_case_location',
    'probable_case_location',
    'suspected_case_location',
    'treatment_location',
    'monitoring_location',
    'evacuation_location',
    'response_location',
    'media_signal'
  )),
ADD COLUMN IF NOT EXISTS cluster_relation text DEFAULT 'unknown_relation'
  CHECK (cluster_relation IN (
    'linked_to_mv_hondius',
    'separate_hantavirus_case',
    'unknown_relation'
  )),
ADD COLUMN IF NOT EXISTS counts_as_case boolean DEFAULT true;

-- counts_as_case: only true for outbreak_origin, confirmed_case_location
-- false for treatment, monitoring, evacuation, response, media_signal

-- Update verification_status to support media_reported
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_verification_status_check;
ALTER TABLE public.reports ADD CONSTRAINT reports_verification_status_check
  CHECK (verification_status IN ('verified', 'probable', 'suspected', 'media_reported', 'disputed', 'retracted', 'awaiting_source'));
