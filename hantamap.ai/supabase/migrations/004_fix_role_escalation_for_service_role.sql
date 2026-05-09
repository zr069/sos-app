-- Fix role escalation trigger to allow service_role operations.
-- Service role requests (used for initial admin setup) have auth.uid() = NULL
-- and auth.role() = 'service_role'. These should be allowed.

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
