alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_default_payment_method_id text,
  add column if not exists stripe_card_brand text,
  add column if not exists stripe_card_last4 text,
  add column if not exists stripe_card_exp_month integer,
  add column if not exists stripe_card_exp_year integer;
