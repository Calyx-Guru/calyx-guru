-- Initial database migration
-- This creates the basic users and profiles tables

create table public.profiles (
  -- Identifications
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  email text unique,
  phone_number text unique,

  -- Profile Information
  full_name text,
  avatar_url text,
  bio text,
  website text,  
  gender text,
  date_of_birth date,
  location text,
  birth_place text,
  family_status text,
  occupation text,
  interests text[],
  social_links jsonb,  

  -- Account Settings
  account_type text,
  status text,  
  subscription_status text,
  preferences jsonb,  
  notification_settings jsonb,
  privacy_settings jsonb,
  language text,
  timezone text,
  profile_completion integer default 0,
  referral_code text unique,
  referred_by uuid references public.profiles,
  custom_fields jsonb,
  
  -- Security
  two_factor_enabled boolean default false,
  failed_login_attempts integer default 0,
  lockout_until timestamp with time zone,
  password_reset_token text,
  password_reset_expires_at timestamp with time zone,
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  modified_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_active_at timestamp with time zone,
  last_login_at timestamp with time zone,
  deactivated_at timestamp with time zone,
  deleted_at timestamp with time zone
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by only owner."
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile."
  on public.profiles for update
  using (auth.uid() = id);

create index idx_profiles_username on public.profiles (username);
create index idx_profiles_email on public.profiles (email);
