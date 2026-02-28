create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  username text unique,
  avatar_url text,
  company_name text,
  business_category text,
  phone text,
  role text not null default 'client' check (role in ('admin', 'client')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

create table if not exists public.gigs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  highlights text[],
  price_text text,
  order_here_url text,
  order_fiverr_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  outcomes text[],
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_blog_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_blog_post_updated on public.blog_posts;
create trigger on_blog_post_updated
before update on public.blog_posts
for each row execute function public.set_blog_updated_at();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete set null,
  gig_id uuid references public.gigs(id) on delete set null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'complete', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete set null,
  subject text,
  body text not null,
  status text not null default 'new' check (status in ('new', 'replied', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  professionalism int,
  communication int,
  expertise int,
  summary text,
  body text,
  seller_response text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.gigs enable row level security;
alter table public.portfolio enable row level security;
alter table public.blog_posts enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

create policy "Profiles: select own or admin"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

create policy "Profiles: update own"
on public.profiles for update
using (auth.uid() = id);

create policy "Profiles: admin update"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

create policy "Services: public read published"
on public.services for select
using (status = 'published');

create policy "Services: admin manage"
on public.services for all
using (public.is_admin())
with check (public.is_admin());

create policy "Gigs: public read published"
on public.gigs for select
using (status = 'published');

create policy "Gigs: admin manage"
on public.gigs for all
using (public.is_admin())
with check (public.is_admin());

create policy "Portfolio: public read published"
on public.portfolio for select
using (status = 'published');

create policy "Portfolio: admin manage"
on public.portfolio for all
using (public.is_admin())
with check (public.is_admin());

create policy "Blog: public read published"
on public.blog_posts for select
using (status = 'published');

create policy "Blog: admin manage"
on public.blog_posts for all
using (public.is_admin())
with check (public.is_admin());

create policy "Orders: client create"
on public.orders for insert
with check (auth.uid() = client_id);

create policy "Orders: client read own"
on public.orders for select
using (auth.uid() = client_id);

create policy "Orders: admin manage"
on public.orders for all
using (public.is_admin())
with check (public.is_admin());

create policy "Messages: client create"
on public.messages for insert
with check (auth.uid() = client_id);

create policy "Messages: client read own"
on public.messages for select
using (auth.uid() = client_id);

create policy "Messages: admin manage"
on public.messages for all
using (public.is_admin())
with check (public.is_admin());

create policy "Reviews: public read"
on public.reviews for select
using (true);

create policy "Reviews: client create"
on public.reviews for insert
with check (auth.uid() = client_id);

create policy "Reviews: admin manage"
on public.reviews for all
using (public.is_admin())
with check (public.is_admin());
