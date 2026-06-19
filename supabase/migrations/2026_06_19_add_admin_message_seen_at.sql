alter table public.messages
add column if not exists admin_seen_at timestamptz;

create index if not exists messages_unread_admin_idx
on public.messages (client_id, created_at)
where status = 'new' and admin_seen_at is null;
