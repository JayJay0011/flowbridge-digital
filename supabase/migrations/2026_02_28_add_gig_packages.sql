alter table public.gigs
  add column if not exists cover_url text,
  add column if not exists gallery_urls text[],
  add column if not exists seller_name text,
  add column if not exists seller_title text,
  add column if not exists delivery_days int,
  add column if not exists package_basic jsonb,
  add column if not exists package_standard jsonb,
  add column if not exists package_premium jsonb;
