alter table public.reviews
add column if not exists video_url text;

alter table public.reviews
add column if not exists status text not null default 'published'
check (status in ('pending', 'published', 'hidden'));

drop policy if exists "Reviews: public read" on public.reviews;
create policy "Reviews: public read"
on public.reviews for select
using (status = 'published');
