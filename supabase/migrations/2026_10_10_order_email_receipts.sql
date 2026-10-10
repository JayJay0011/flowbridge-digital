alter table public.orders
  add column if not exists receipt_email_sent_at timestamptz,
  add column if not exists admin_order_email_sent_at timestamptz;
