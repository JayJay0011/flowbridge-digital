create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

create policy "Blog: public read published"
on public.blog_posts for select
using (status = 'published');

create policy "Blog: admin manage"
on public.blog_posts for all
using (public.is_admin())
with check (public.is_admin());

create or replace function public.set_blog_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_blog_post_updated on public.blog_posts;
create trigger on_blog_post_updated
before update on public.blog_posts
for each row execute function public.set_blog_updated_at();

create policy "Profiles: admin update"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());
