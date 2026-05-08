-- HantaMap.ai Database Schema
-- Run this in your Supabase SQL editor

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text,
  country text,
  city text,
  household_size int,
  has_children boolean default false,
  has_elderly boolean default false,
  has_pets boolean default false,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- OUTBREAKS
-- ============================================================
create table public.outbreaks (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  pathogen_name text,
  summary text,
  status text default 'monitoring' check (status in ('monitoring', 'active', 'escalating', 'declining', 'resolved')),
  transmission_notes text,
  what_is_known text,
  what_is_not_known text,
  what_to_do text,
  first_reported_at timestamptz,
  last_reviewed_at timestamptz,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- LOCATIONS
-- ============================================================
create table public.locations (
  id uuid primary key default uuid_generate_v4(),
  country text not null,
  region text,
  city text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now()
);

-- ============================================================
-- SOURCES
-- ============================================================
create table public.sources (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  publisher text not null,
  url text not null,
  published_at timestamptz,
  source_type text default 'official' check (source_type in ('who', 'ecdc', 'cdc', 'national_ministry', 'regional_authority', 'scientific', 'media', 'other')),
  reliability_level int default 3 check (reliability_level between 1 and 5),
  created_at timestamptz default now()
);

-- ============================================================
-- REPORTS
-- ============================================================
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  outbreak_id uuid references public.outbreaks(id) on delete cascade not null,
  location_id uuid references public.locations(id) on delete cascade not null,
  status text default 'suspected' check (status in ('confirmed', 'probable', 'suspected', 'disputed', 'retracted')),
  confirmed_cases int,
  probable_cases int,
  suspected_cases int,
  deaths int,
  recovered int,
  report_date timestamptz,
  verification_status text default 'suspected' check (verification_status in ('verified', 'probable', 'suspected', 'disputed', 'retracted', 'awaiting_source')),
  editor_note text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- REPORT_SOURCES (join table)
-- ============================================================
create table public.report_sources (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid references public.reports(id) on delete cascade not null,
  source_id uuid references public.sources(id) on delete cascade not null,
  unique(report_id, source_id)
);

-- ============================================================
-- UPDATES
-- ============================================================
create table public.updates (
  id uuid primary key default uuid_generate_v4(),
  outbreak_id uuid references public.outbreaks(id) on delete cascade,
  title text not null,
  summary text,
  body text,
  location_id uuid references public.locations(id) on delete set null,
  verification_status text default 'suspected' check (verification_status in ('verified', 'probable', 'suspected', 'disputed', 'retracted', 'awaiting_source')),
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- UPDATE_SOURCES (join table)
-- ============================================================
create table public.update_sources (
  id uuid primary key default uuid_generate_v4(),
  update_id uuid references public.updates(id) on delete cascade not null,
  source_id uuid references public.sources(id) on delete cascade not null,
  unique(update_id, source_id)
);

-- ============================================================
-- SAVED_REGIONS
-- ============================================================
create table public.saved_regions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null,
  country text,
  region text,
  city text,
  latitude double precision,
  longitude double precision,
  alert_enabled boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- TRAVEL_PLANS
-- ============================================================
create table public.travel_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  destination_country text not null,
  destination_region text,
  destination_city text,
  departure_date date,
  return_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PREPAREDNESS_ITEMS
-- ============================================================
create table public.preparedness_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  label text not null,
  completed boolean default false,
  quantity int,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ALERT_PREFERENCES
-- ============================================================
create table public.alert_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  email_enabled boolean default true,
  push_enabled boolean default false,
  frequency text default 'daily' check (frequency in ('immediate', 'daily', 'weekly')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  name text not null,
  description text,
  affiliate_url text,
  image_url text,
  active boolean default true,
  disclaimer text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles: users can read/update their own
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- Outbreaks: public read for published, admin full access
alter table public.outbreaks enable row level security;

create policy "Public can view published outbreaks"
  on public.outbreaks for select
  using (published = true);

create policy "Admins can manage outbreaks"
  on public.outbreaks for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Locations: public read
alter table public.locations enable row level security;

create policy "Public can view locations"
  on public.locations for select
  using (true);

create policy "Admins can manage locations"
  on public.locations for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Sources: public read
alter table public.sources enable row level security;

create policy "Public can view sources"
  on public.sources for select
  using (true);

create policy "Admins can manage sources"
  on public.sources for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Reports: public read for published
alter table public.reports enable row level security;

create policy "Public can view published reports"
  on public.reports for select
  using (published = true);

create policy "Admins can manage reports"
  on public.reports for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Report sources: public read
alter table public.report_sources enable row level security;

create policy "Public can view report sources"
  on public.report_sources for select
  using (true);

create policy "Admins can manage report sources"
  on public.report_sources for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Updates: public read for published
alter table public.updates enable row level security;

create policy "Public can view published updates"
  on public.updates for select
  using (published = true);

create policy "Admins can manage updates"
  on public.updates for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Update sources: public read
alter table public.update_sources enable row level security;

create policy "Public can view update sources"
  on public.update_sources for select
  using (true);

create policy "Admins can manage update sources"
  on public.update_sources for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Saved regions: user own data
alter table public.saved_regions enable row level security;

create policy "Users can manage own saved regions"
  on public.saved_regions for all
  using (auth.uid() = user_id);

-- Travel plans: user own data
alter table public.travel_plans enable row level security;

create policy "Users can manage own travel plans"
  on public.travel_plans for all
  using (auth.uid() = user_id);

-- Preparedness items: user own data
alter table public.preparedness_items enable row level security;

create policy "Users can manage own preparedness items"
  on public.preparedness_items for all
  using (auth.uid() = user_id);

-- Alert preferences: user own data
alter table public.alert_preferences enable row level security;

create policy "Users can manage own alert preferences"
  on public.alert_preferences for all
  using (auth.uid() = user_id);

-- Products: public read
alter table public.products enable row level security;

create policy "Public can view active products"
  on public.products for select
  using (active = true);

create policy "Admins can manage products"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ============================================================
-- TRIGGERS: Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_reports_outbreak on public.reports(outbreak_id);
create index idx_reports_location on public.reports(location_id);
create index idx_reports_published on public.reports(published) where published = true;
create index idx_updates_outbreak on public.updates(outbreak_id);
create index idx_updates_published on public.updates(published) where published = true;
create index idx_outbreaks_published on public.outbreaks(published) where published = true;
create index idx_outbreaks_slug on public.outbreaks(slug);
create index idx_saved_regions_user on public.saved_regions(user_id);
create index idx_travel_plans_user on public.travel_plans(user_id);
create index idx_preparedness_items_user on public.preparedness_items(user_id);
