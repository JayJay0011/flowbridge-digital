insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Public assets: public read" on storage.objects;
create policy "Public assets: public read"
on storage.objects for select
using (bucket_id = 'public-assets');

drop policy if exists "Public assets: authenticated upload" on storage.objects;
create policy "Public assets: authenticated upload"
on storage.objects for insert
with check (
  bucket_id = 'public-assets'
  and auth.role() = 'authenticated'
  and (
    public.is_admin()
    or (
      (storage.foldername(name))[1] = 'avatars'
      and (storage.foldername(name))[2] = auth.uid()::text
    )
  )
);

drop policy if exists "Public assets: owner or admin update" on storage.objects;
create policy "Public assets: owner or admin update"
on storage.objects for update
using (
  bucket_id = 'public-assets'
  and auth.role() = 'authenticated'
  and (
    public.is_admin()
    or (
      (storage.foldername(name))[1] = 'avatars'
      and (storage.foldername(name))[2] = auth.uid()::text
    )
  )
)
with check (
  bucket_id = 'public-assets'
  and auth.role() = 'authenticated'
  and (
    public.is_admin()
    or (
      (storage.foldername(name))[1] = 'avatars'
      and (storage.foldername(name))[2] = auth.uid()::text
    )
  )
);

drop policy if exists "Public assets: owner or admin delete" on storage.objects;
create policy "Public assets: owner or admin delete"
on storage.objects for delete
using (
  bucket_id = 'public-assets'
  and auth.role() = 'authenticated'
  and (
    public.is_admin()
    or (
      (storage.foldername(name))[1] = 'avatars'
      and (storage.foldername(name))[2] = auth.uid()::text
    )
  )
);
