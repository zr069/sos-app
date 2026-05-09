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
-- Allows service_role operations for initial admin setup
create or replace function public.prevent_role_escalation()
returns trigger as $$
begin
  if NEW.role <> OLD.role then
    -- Allow service_role operations (admin setup, migrations)
    if current_setting('request.jwt.claim.role', true) = 'service_role' then
      return NEW;
    end if;

    -- Block non-admin users from changing roles
    if not public.is_admin(auth.uid()) then
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
-- ADMIN PROFILE ACCESS
-- Uses a security definer function to avoid RLS recursion
-- when checking admin role from within the profiles table.
-- ============================================================

create or replace function public.is_admin(check_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where user_id = check_user_id and role = 'admin'
  );
$$ language sql security definer stable;

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));
