-- Allow authenticated admin checks to read profiles without recursively
-- re-entering the profiles RLS policy.
alter function public.is_admin() security definer;
alter function public.is_admin() set search_path = public, pg_temp;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;
