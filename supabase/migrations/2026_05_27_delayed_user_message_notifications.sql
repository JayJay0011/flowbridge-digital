alter table public.messages
add column if not exists user_seen_at timestamptz;

alter table public.messages
add column if not exists user_notified_at timestamptz;

create index if not exists messages_unseen_replies_idx
on public.messages (created_at)
where status = 'replied' and user_seen_at is null and user_notified_at is null;
