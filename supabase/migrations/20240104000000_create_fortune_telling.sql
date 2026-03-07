-- Create fortune_telling table
create table public.fortune_telling (
  id uuid primary key default gen_random_uuid(),
  draw_no integer not null,
  locale text not null default 'en',
  value integer not null default 0,
  original_explanation text not null default '',
  updated_explanation text not null default '',
  hexagram text not null default '',
  picture_explanation text not null default '',
  implications text not null default '',
  matsus_words text not null default '',
  highlights jsonb not null default '{}'::jsonb,
  applications jsonb not null default '{}'::jsonb,
  last_reminders text not null default '',
  illustration_url text,
  hexagram_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (draw_no, locale)
);

-- Enable RLS
alter table public.fortune_telling enable row level security;

-- Allow all authenticated users to read
create policy "Anyone can read fortune_telling"
  on public.fortune_telling
  for select
  using (true);

-- Only admins can insert/update/delete
create policy "Admins can insert fortune_telling"
  on public.fortune_telling
  for insert
  with check (public.is_admin());

create policy "Admins can update fortune_telling"
  on public.fortune_telling
  for update
  using (public.is_admin());

create policy "Admins can delete fortune_telling"
  on public.fortune_telling
  for delete
  using (public.is_admin());

-- Auto-update updated_at
create or replace function public.update_fortune_telling_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger fortune_telling_updated_at
  before update on public.fortune_telling
  for each row
  execute function public.update_fortune_telling_updated_at();

-- Add public read access to fortune_data storage bucket for fortune_telling images
drop policy if exists "Public can read fortune_telling images" on storage.objects;
create policy "Public can read fortune_telling images"
  on storage.objects
  for select
  using (bucket_id = 'fortune_data' and (storage.foldername(name))[1] = 'fortune_telling');
