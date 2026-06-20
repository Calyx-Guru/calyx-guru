-- Storage bucket and RLS policies for calyx-fortune-data
-- Allow admins to CRUD files in the calyx-fortune-data bucket only

insert into storage.buckets (id, name, public)
values ('calyx-fortune-data', 'calyx-fortune-data', false)
on conflict (id) do nothing;

drop policy if exists "Allow admins to upload to calyx-fortune-data" on storage.objects;
create policy "Allow admins to upload to calyx-fortune-data"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'calyx-fortune-data'
    and public.is_admin()
  );

drop policy if exists "Allow admins to update calyx-fortune-data" on storage.objects;
create policy "Allow admins to update calyx-fortune-data"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'calyx-fortune-data'
    and public.is_admin()
  )
  with check (
    bucket_id = 'calyx-fortune-data'
    and public.is_admin()
  );

drop policy if exists "Allow admins to delete from calyx-fortune-data" on storage.objects;
create policy "Allow admins to delete from calyx-fortune-data"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'calyx-fortune-data'
    and public.is_admin()
  );

drop policy if exists "Allow admins to read calyx-fortune-data" on storage.objects;
create policy "Allow admins to read calyx-fortune-data"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'calyx-fortune-data'
    and public.is_admin()
  );
