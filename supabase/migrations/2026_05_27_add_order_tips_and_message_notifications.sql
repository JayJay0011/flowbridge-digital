create table if not exists public.tips (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  amount_cents int not null check (amount_cents between 100 and 100000),
  currency text not null default 'usd',
  stripe_session_id text not null unique,
  status text not null default 'paid' check (status in ('paid', 'refunded')),
  created_at timestamptz not null default now()
);

alter table public.tips enable row level security;

drop policy if exists "Tips: account read own" on public.tips;
create policy "Tips: account read own"
on public.tips for select
using (auth.uid() = client_id);

drop policy if exists "Tips: admin read" on public.tips;
create policy "Tips: admin read"
on public.tips for select
using (public.is_admin());

drop policy if exists "Messages: client create" on public.messages;
