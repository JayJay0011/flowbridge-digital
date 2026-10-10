-- Paid orders begin work automatically; users confirm delivery or request revisions.
update public.orders
set status = 'in_progress'
where payment_status = 'paid' and status = 'new';

drop policy if exists "Orders: admin write" on public.orders;
drop policy if exists "Orders: admin manage" on public.orders;
drop policy if exists "Orders: account delivery action" on public.orders;

-- Order decisions and delivery transitions go through authenticated server routes.
-- Do not grant clients direct UPDATE access to financial or lifecycle columns.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end
$$;
