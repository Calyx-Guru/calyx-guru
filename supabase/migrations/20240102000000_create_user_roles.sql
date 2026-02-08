-- Create user_roles table
-- This table stores user role information (admin or normal user)
-- Only modifiable through Supabase dashboard

create type user_role as enum ('user', 'admin');

create table public.user_roles (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  role user_role not null default 'user',
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_roles enable row level security;

-- RLS Policy: Users can only view their own role
create policy "Users can view own role."
  on public.user_roles for select
  using (auth.uid() = id);

-- RLS Policy: Admins can view all roles
create policy "Admins can view all roles."
  on public.user_roles for select
  using (
    exists (
      select 1 from public.user_roles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Prevent all INSERT, UPDATE, DELETE operations for non-service roles
-- Only Supabase dashboard and migrations can modify this table
create policy "Prevent direct INSERT on user_roles."
  on public.user_roles for insert
  with check (false);

create policy "Prevent direct UPDATE on user_roles."
  on public.user_roles for update
  with check (false);

revoke insert, update, delete on user_roles from anon, authenticated;

-- Create ergonomic role check function
create or replace function public.is_admin()
returns boolean as $$
declare
  v_role user_role;
begin
  select role into v_role from public.user_roles where id = auth.uid();
  return v_role = 'admin';
end;
$$ language plpgsql security definer set search_path = public;
