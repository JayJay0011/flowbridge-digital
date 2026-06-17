alter table public.gigs
add column if not exists category_slugs text[] not null default '{}';

create index if not exists gigs_category_slugs_idx
on public.gigs using gin (category_slugs);
