create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete set null,
  gig_id uuid references public.gigs(id) on delete set null,
  title text,
  description text,
  price text,
  delivery_date date,
  revisions int,
  deliverables text,
  status text not null default 'sent' check (status in ('sent', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now()
);

alter table public.offers enable row level security;

create policy "Offers: client read own"
on public.offers for select
using (auth.uid() = client_id);

create policy "Offers: client update own"
on public.offers for update
using (auth.uid() = client_id)
with check (auth.uid() = client_id);

create policy "Offers: admin manage"
on public.offers for all
using (public.is_admin())
with check (public.is_admin());
