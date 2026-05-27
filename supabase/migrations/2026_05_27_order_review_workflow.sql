alter table public.orders
drop constraint if exists orders_status_check;

alter table public.orders
add constraint orders_status_check
check (status in ('new', 'in_progress', 'delivered', 'revision_requested', 'complete', 'cancelled'));

alter table public.orders
add column if not exists revision_request text;

alter table public.reviews
add column if not exists video_url text;

alter table public.reviews
add column if not exists status text not null default 'published'
check (status in ('pending', 'published', 'hidden'));

alter table public.reviews
add column if not exists improvement_feedback text;

create unique index if not exists reviews_one_per_order_idx
on public.reviews (order_id)
where order_id is not null;

drop policy if exists "Orders: account delivery action" on public.orders;
create policy "Orders: account delivery action"
on public.orders for update
using (auth.uid() = client_id and status = 'delivered')
with check (auth.uid() = client_id and status in ('revision_requested', 'complete'));

drop policy if exists "Reviews: public read" on public.reviews;
create policy "Reviews: public read"
on public.reviews for select
using (status = 'published');

drop policy if exists "Reviews: author read own" on public.reviews;
create policy "Reviews: author read own"
on public.reviews for select
using (auth.uid() = client_id);

drop policy if exists "Reviews: client create" on public.reviews;
create policy "Reviews: client create"
on public.reviews for insert
with check (
  auth.uid() = client_id
  and order_id is not null
  and status = 'pending'
  and exists (
    select 1
    from public.orders
    where orders.id = order_id
      and orders.client_id = auth.uid()
      and orders.status = 'complete'
  )
);
