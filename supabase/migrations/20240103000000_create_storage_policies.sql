-- Storage RLS Policies for all buckets
-- Allow admins to upload and manage files in any bucket
create policy "Allow admins to upload to any bucket"
  on storage.objects for insert
  to authenticated
  with check (
    public.is_admin()
  );

-- Allow admins to update files in any bucket
create policy "Allow admins to update any bucket"
  on storage.objects for update
  to authenticated
  using (
    public.is_admin()
  );

-- Allow admins to delete files from any bucket
create policy "Allow admins to delete from any bucket"
  on storage.objects for delete
  to authenticated
  using (
    public.is_admin()
  );

-- Allow admins to read files from any bucket
create policy "Allow admins to read any bucket"
  on storage.objects for select
  to authenticated
  using (
    public.is_admin()
  );
  