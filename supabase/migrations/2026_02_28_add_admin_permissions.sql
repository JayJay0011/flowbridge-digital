create table if not exists public.admin_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  module text not null,
  can_read boolean not null default false,
  can_write boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, module)
);

alter table public.admin_permissions enable row level security;

create policy "Admin permissions: admin manage"
on public.admin_permissions for all
using (public.is_admin())
with check (public.is_admin());

create or replace function public.has_admin_permission(p_module text, p_action text)
returns boolean
language sql
stable
security definer
as $$
  select case
    when not exists (
      select 1 from public.admin_permissions ap
      where ap.user_id = auth.uid()
    ) then true
    else exists (
      select 1
      from public.admin_permissions ap
      where ap.user_id = auth.uid()
        and ap.module = p_module
        and (
          (p_action = 'read' and ap.can_read)
          or (p_action = 'write' and ap.can_write)
        )
    )
  end;
$$;

drop policy if exists "Services: admin manage" on public.services;
create policy "Services: admin read"
on public.services for select
using (public.is_admin() and public.has_admin_permission('services', 'read'));

create policy "Services: admin write"
on public.services for all
using (public.is_admin() and public.has_admin_permission('services', 'write'))
with check (public.is_admin() and public.has_admin_permission('services', 'write'));

drop policy if exists "Gigs: admin manage" on public.gigs;
create policy "Gigs: admin read"
on public.gigs for select
using (public.is_admin() and public.has_admin_permission('gigs', 'read'));

create policy "Gigs: admin write"
on public.gigs for all
using (public.is_admin() and public.has_admin_permission('gigs', 'write'))
with check (public.is_admin() and public.has_admin_permission('gigs', 'write'));

drop policy if exists "Portfolio: admin manage" on public.portfolio;
create policy "Portfolio: admin read"
on public.portfolio for select
using (public.is_admin() and public.has_admin_permission('portfolio', 'read'));

create policy "Portfolio: admin write"
on public.portfolio for all
using (public.is_admin() and public.has_admin_permission('portfolio', 'write'))
with check (public.is_admin() and public.has_admin_permission('portfolio', 'write'));

drop policy if exists "Case studies: admin manage" on public.case_studies;
create policy "Case studies: admin read"
on public.case_studies for select
using (public.is_admin() and public.has_admin_permission('case_studies', 'read'));

create policy "Case studies: admin write"
on public.case_studies for all
using (public.is_admin() and public.has_admin_permission('case_studies', 'write'))
with check (public.is_admin() and public.has_admin_permission('case_studies', 'write'));

drop policy if exists "Blog: admin manage" on public.blog_posts;
create policy "Blog: admin read"
on public.blog_posts for select
using (public.is_admin() and public.has_admin_permission('blog', 'read'));

create policy "Blog: admin write"
on public.blog_posts for all
using (public.is_admin() and public.has_admin_permission('blog', 'write'))
with check (public.is_admin() and public.has_admin_permission('blog', 'write'));

drop policy if exists "Orders: admin manage" on public.orders;
create policy "Orders: admin read"
on public.orders for select
using (public.is_admin() and public.has_admin_permission('orders', 'read'));

create policy "Orders: admin write"
on public.orders for all
using (public.is_admin() and public.has_admin_permission('orders', 'write'))
with check (public.is_admin() and public.has_admin_permission('orders', 'write'));

drop policy if exists "Messages: admin manage" on public.messages;
create policy "Messages: admin read"
on public.messages for select
using (public.is_admin() and public.has_admin_permission('messages', 'read'));

create policy "Messages: admin write"
on public.messages for all
using (public.is_admin() and public.has_admin_permission('messages', 'write'))
with check (public.is_admin() and public.has_admin_permission('messages', 'write'));

drop policy if exists "Reviews: admin manage" on public.reviews;
create policy "Reviews: admin read"
on public.reviews for select
using (public.is_admin() and public.has_admin_permission('reviews', 'read'));

create policy "Reviews: admin write"
on public.reviews for all
using (public.is_admin() and public.has_admin_permission('reviews', 'write'))
with check (public.is_admin() and public.has_admin_permission('reviews', 'write'));

drop policy if exists "Profiles: admin update" on public.profiles;
create policy "Profiles: admin update"
on public.profiles for update
using (public.is_admin() and public.has_admin_permission('settings', 'write'))
with check (public.is_admin() and public.has_admin_permission('settings', 'write'));
