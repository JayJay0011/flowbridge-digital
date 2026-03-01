create table if not exists public.case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  industry text,
  body text,
  cover_url text,
  results text[],
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

alter table public.case_studies enable row level security;

create policy "Case studies: public read published"
on public.case_studies for select
using (status = 'published');

create policy "Case studies: admin manage"
on public.case_studies for all
using (public.is_admin())
with check (public.is_admin());

alter table public.portfolio
  add column if not exists case_study_slug text;
