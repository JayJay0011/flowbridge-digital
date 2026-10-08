alter table public.profiles
  add column if not exists referral_code text,
  add column if not exists referred_by uuid references public.profiles(id) on delete set null;

create unique index if not exists profiles_referral_code_unique_idx
  on public.profiles (referral_code)
  where referral_code is not null;

create index if not exists profiles_referred_by_idx
  on public.profiles (referred_by)
  where referred_by is not null;

create or replace function public.generate_referral_code()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare candidate text;
begin
  loop
    candidate := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    exit when not exists (select 1 from public.profiles where referral_code = candidate);
  end loop;
  return candidate;
end;
$$;

update public.profiles
set referral_code = public.generate_referral_code()
where referral_code is null;

alter table public.profiles
  alter column referral_code set default public.generate_referral_code();
