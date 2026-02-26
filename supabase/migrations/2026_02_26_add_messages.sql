create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete set null,
  subject text,
  body text not null,
  status text not null default 'new' check (status in ('new', 'replied', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

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
