-- Stripe may retry webhook events. A session must map to one order only.
create unique index if not exists orders_stripe_session_id_unique_idx
  on public.orders (stripe_session_id)
  where stripe_session_id is not null;

alter table public.messages
  add column if not exists order_id uuid references public.orders(id) on delete cascade;

create unique index if not exists messages_order_subject_unique_idx
  on public.messages (order_id, subject)
  where order_id is not null and subject = 'Paid order';

do $$
declare constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.offers'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%sent%accepted%rejected%withdrawn%'
  loop
    execute format('alter table public.offers drop constraint %I', constraint_name);
  end loop;

  alter table public.offers
    add constraint offers_status_check
    check (status in ('sent', 'accepted', 'rejected', 'withdrawn', 'paid'));
end $$;

alter table public.offers
  add column if not exists stripe_session_id text;

create unique index if not exists offers_stripe_session_id_unique_idx
  on public.offers (stripe_session_id)
  where stripe_session_id is not null;

alter table public.orders
  add column if not exists offer_id uuid references public.offers(id) on delete set null;

create unique index if not exists orders_paid_offer_unique_idx
  on public.orders (offer_id)
  where offer_id is not null and payment_status = 'paid';
