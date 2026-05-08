-- ============================================================
-- SOURCE ENFORCEMENT TRIGGERS
-- Reports cannot be published without at least one linked source.
-- Updates cannot be published without at least one linked source.
-- ============================================================

create or replace function public.enforce_report_source_on_publish()
returns trigger as $$
begin
  if NEW.published = true then
    if not exists (
      select 1 from public.report_sources
      where report_id = NEW.id
    ) then
      raise exception 'A source is required before publishing.';
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_enforce_report_source
  before insert or update on public.reports
  for each row
  when (NEW.published = true)
  execute function public.enforce_report_source_on_publish();

create or replace function public.enforce_update_source_on_publish()
returns trigger as $$
begin
  if NEW.published = true then
    if not exists (
      select 1 from public.update_sources
      where update_id = NEW.id
    ) then
      raise exception 'A source is required before publishing.';
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_enforce_update_source
  before insert or update on public.updates
  for each row
  when (NEW.published = true)
  execute function public.enforce_update_source_on_publish();

-- ============================================================
-- RLS HARDENING
-- Ensure admins reading outbreaks/reports can also see unpublished
-- records (the existing "for all" policy handles this).
-- Ensure profiles table prevents users from escalating their own role.
-- ============================================================

-- Prevent users from setting their own role to admin
create or replace function public.prevent_role_escalation()
returns trigger as $$
begin
  -- Only allow role changes if the current user is already an admin
  if NEW.role <> OLD.role then
    if not exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    ) then
      raise exception 'Only admins can change user roles.';
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row
  when (NEW.role is distinct from OLD.role)
  execute function public.prevent_role_escalation();

-- ============================================================
-- ADDITIONAL SAFETY: Prevent anonymous inserts on user tables
-- These are already handled by RLS (auth.uid() = user_id),
-- but adding explicit deny for clarity.
-- ============================================================

-- Profiles: admin can view all profiles (needed for admin dashboard)
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );
