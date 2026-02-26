alter table public.profiles
  add column if not exists business_category text;

alter table public.profiles
  add column if not exists avatar_url text;
