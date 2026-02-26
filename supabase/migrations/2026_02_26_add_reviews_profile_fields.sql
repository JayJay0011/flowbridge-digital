alter table public.profiles
add column if not exists avatar_url text;

alter table public.profiles
add column if not exists company_name text;

alter table public.profiles
add column if not exists business_category text;

alter table public.profiles
add column if not exists phone text;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  professionalism int,
  communication int,
  expertise int,
  summary text,
  body text,
  seller_response text,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Reviews: public read"
on public.reviews for select
using (true);

create policy "Reviews: client create"
on public.reviews for insert
with check (auth.uid() = client_id);

create policy "Reviews: admin manage"
on public.reviews for all
using (public.is_admin())
with check (public.is_admin());
