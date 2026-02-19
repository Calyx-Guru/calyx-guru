-- Create trigger function to automatically create a profile when a user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email, created_at, updated_at)
  values (new.id, split_part(new.email, '@', 1), new.email, now(), now());
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Create trigger that fires when a new user is inserted
drop trigger on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
