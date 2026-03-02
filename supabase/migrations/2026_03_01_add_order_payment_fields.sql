alter table public.orders
  add column if not exists package_tier text,
  add column if not exists amount_cents int,
  add column if not exists currency text default 'usd',
  add column if not exists stripe_session_id text,
  add column if not exists payment_status text default 'unpaid' check (payment_status in ('unpaid', 'paid', 'failed'));
