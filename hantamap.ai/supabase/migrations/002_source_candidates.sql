-- ============================================================
-- SOURCE CANDIDATES
-- Imported from official feeds, awaiting editorial review.
-- Never shown publicly. Admin-only access.
-- ============================================================

create table public.source_candidates (
  id uuid primary key default uuid_generate_v4(),
  source_provider text not null,
  external_id text not null,
  title text not null,
  url text,
  publisher text not null,
  published_at timestamptz,
  fetched_at timestamptz default now(),
  raw_payload jsonb,
  extracted_summary text,
  detected_keywords text[],
  detected_countries text[],
  review_status text default 'pending' check (review_status in ('pending', 'reviewed', 'ignored')),
  linked_source_id uuid references public.sources(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(source_provider, external_id)
);

-- RLS: admin-only, no public or anonymous access
alter table public.source_candidates enable row level security;

create policy "Admins can manage source candidates"
  on public.source_candidates for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Index for review queue
create index idx_source_candidates_status on public.source_candidates(review_status);
create index idx_source_candidates_provider on public.source_candidates(source_provider);
create index idx_source_candidates_fetched on public.source_candidates(fetched_at desc);
