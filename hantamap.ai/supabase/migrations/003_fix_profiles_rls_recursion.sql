-- Fix infinite recursion in profiles RLS policy.
-- The "Admins can view all profiles" policy was querying profiles
-- from within a profiles policy, causing infinite recursion.
-- Solution: use a security definer function that bypasses RLS.

-- Drop the broken policy if it exists
drop policy if exists "Admins can view all profiles" on public.profiles;

-- Create a security definer function to check admin role without RLS
create or replace function public.is_admin(check_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where user_id = check_user_id and role = 'admin'
  );
$$ language sql security definer stable;

-- Re-create the policy using the function
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));
