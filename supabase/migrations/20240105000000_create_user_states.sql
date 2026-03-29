-- Per-user app state (kaucim history, etc.)

create table public.user_states (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  kaucim_history jsonb not null default '[]'::jsonb
);

alter table public.user_states enable row level security;

create policy "Users can read own user_states."
  on public.user_states for select
  using (auth.uid() = id);

create policy "Users can insert own user_states."
  on public.user_states for insert
  with check (auth.uid() = id);

create policy "Users can update own user_states."
  on public.user_states for update
  using (auth.uid() = id);
