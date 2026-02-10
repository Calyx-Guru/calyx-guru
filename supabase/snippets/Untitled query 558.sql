-- Storage RLS Policies for all buckets
-- Allow admins to upload and manage files in any bucket
drop policy "Allow admins to upload to any bucket"
  on storage.objects;
create policy "Allow admins to upload to any bucket"
  on storage.objects for insert
  to authenticated
  with check (
    public.is_admin()
  );
