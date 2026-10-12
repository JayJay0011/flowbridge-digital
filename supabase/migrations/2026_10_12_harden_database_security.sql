-- Pin function name resolution to trusted schemas.
alter function public.set_blog_updated_at() set search_path = public, pg_temp;
alter function public.is_admin() set search_path = public, pg_temp;
alter function public.handle_new_user() set search_path = public, auth, pg_temp;
alter function public.has_admin_permission(text, text) set search_path = public, pg_temp;

-- The signup trigger is invoked by PostgreSQL and is not a client RPC.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- This permission lookup can safely run with the caller's privileges because
-- admin_permissions already has an admin-only RLS policy.
alter function public.has_admin_permission(text, text) security invoker;
revoke all on function public.has_admin_permission(text, text) from public, anon;
grant execute on function public.has_admin_permission(text, text) to authenticated, service_role;

-- Index every foreign key currently reported by the database advisor.
create index if not exists offers_client_id_idx on public.offers (client_id);
create index if not exists offers_gig_id_idx on public.offers (gig_id);
create index if not exists orders_client_id_idx on public.orders (client_id);
create index if not exists orders_gig_id_idx on public.orders (gig_id);
create index if not exists reviews_client_id_idx on public.reviews (client_id);
create index if not exists tips_client_id_idx on public.tips (client_id);
create index if not exists tips_order_id_idx on public.tips (order_id);

-- Remove only legacy policies whose access is already covered by the newer
-- permission-aware admin policies.
drop policy if exists "Blog: admin manage" on public.blog_posts;
drop policy if exists "Case studies: admin manage" on public.case_studies;
drop policy if exists "Gigs: admin manage" on public.gigs;
drop policy if exists "Portfolio: admin manage" on public.portfolio;
drop policy if exists "Services: admin manage" on public.services;
drop policy if exists "Messages: admin manage" on public.messages;

-- Preserve the exact existing access rules while evaluating auth.uid() once
-- per statement instead of once per row.
drop policy if exists "Offers: client read own" on public.offers;
create policy "Offers: client read own"
on public.offers for select to authenticated
using ((select auth.uid()) = client_id);

drop policy if exists "Offers: client update own" on public.offers;
create policy "Offers: client update own"
on public.offers for update to authenticated
using ((select auth.uid()) = client_id)
with check ((select auth.uid()) = client_id);

drop policy if exists "Messages: client read own" on public.messages;
create policy "Messages: client read own"
on public.messages for select to authenticated
using ((select auth.uid()) = client_id);

drop policy if exists "Profiles: select own or admin" on public.profiles;
create policy "Profiles: select own or admin"
on public.profiles for select to authenticated
using ((select auth.uid()) = id or public.is_admin());

drop policy if exists "Profiles: update own" on public.profiles;
create policy "Profiles: update own"
on public.profiles for update to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Orders: client create" on public.orders;
create policy "Orders: client create"
on public.orders for insert to authenticated
with check ((select auth.uid()) = client_id);

drop policy if exists "Orders: client read own" on public.orders;
create policy "Orders: client read own"
on public.orders for select to authenticated
using ((select auth.uid()) = client_id);

drop policy if exists "Reviews: author read own" on public.reviews;
create policy "Reviews: author read own"
on public.reviews for select to authenticated
using ((select auth.uid()) = client_id);

drop policy if exists "Reviews: client create" on public.reviews;
create policy "Reviews: client create"
on public.reviews for insert to authenticated
with check (
  (select auth.uid()) = client_id
  and order_id is not null
  and status = 'pending'
  and exists (
    select 1 from public.orders
    where orders.id = reviews.order_id
      and orders.client_id = (select auth.uid())
      and orders.status = 'complete'
  )
);

drop policy if exists "Tips: account read own" on public.tips;
create policy "Tips: account read own"
on public.tips for select to authenticated
using ((select auth.uid()) = client_id);
