-- Storage bucket and RLS policies for calyx-users
-- Allow anonymous clients to read and write files in the calyx-users bucket only

insert into storage.buckets (id, name, public)
values ('calyx-users', 'calyx-users', false)
on conflict (id) do nothing;

drop policy if exists "Allow anon to upload to calyx-users" on storage.objects;
create policy "Allow anon to upload to calyx-users"
  on storage.objects for insert
  to anon
  with check (
    bucket_id = 'calyx-users'
  );

drop policy if exists "Allow anon to update calyx-users" on storage.objects;
create policy "Allow anon to update calyx-users"
  on storage.objects for update
  to anon
  using (
    bucket_id = 'calyx-users'
  )
  with check (
    bucket_id = 'calyx-users'
  );

drop policy if exists "Allow anon to read calyx-users" on storage.objects;
create policy "Allow anon to read calyx-users"
  on storage.objects for select
  to anon
  using (
    bucket_id = 'calyx-users'
  );
