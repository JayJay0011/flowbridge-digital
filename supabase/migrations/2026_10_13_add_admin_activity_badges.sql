alter table public.orders add column if not exists admin_seen_at timestamptz;
alter table public.reviews add column if not exists admin_seen_at timestamptz;

-- Existing orders predate the badge and should not all appear as new.
update public.orders set admin_seen_at = now() where admin_seen_at is null;

create index if not exists orders_admin_unseen_idx on public.orders (created_at) where admin_seen_at is null;
create index if not exists reviews_admin_unseen_idx on public.reviews (created_at) where admin_seen_at is null;
