
-- 1. Safe Enum Creation
do $$ begin
    create type experiment_status as enum ('idea', 'hypothesis', 'running', 'complete', 'learnings');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type experiment_result as enum ('won', 'lost', 'inconclusive');
exception
    when duplicate_object then null;
end $$;

-- 2. Tables (Safe Create)
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  bio text,
  linkedin_url text,
  contact_email text
);

create table if not exists experiments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references auth.users default auth.uid(),
  title text not null,
  description text,
  status experiment_status default 'idea'::experiment_status,
  result experiment_result,
  ice_impact integer default 5,
  ice_confidence integer default 5,
  ice_ease integer default 5,
  market text,
  type text,
  tags text[] default '{}',
  archived boolean default false,
  locked boolean default false
);

create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  experiment_id uuid references experiments(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  text text not null
);

-- 3. RLS (Safe Enable)
alter table profiles enable row level security;
alter table experiments enable row level security;
alter table comments enable row level security;

-- 4. Policies (Drop and Recreate to ensure latest version)
-- Profiles
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Experiments
drop policy if exists "Experiments are viewable by everyone." on experiments;
create policy "Experiments are viewable by everyone." on experiments for select using (true);

drop policy if exists "Authenticated users can insert experiments." on experiments;
create policy "Authenticated users can insert experiments." on experiments for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update experiments." on experiments;
create policy "Authenticated users can update experiments." on experiments for update using (auth.role() = 'authenticated');

-- Comments
drop policy if exists "Comments are viewable by everyone." on comments;
create policy "Comments are viewable by everyone." on comments for select using (true);

drop policy if exists "Authenticated users can insert comments." on comments;
create policy "Authenticated users can insert comments." on comments for insert with check (auth.role() = 'authenticated');

-- 5. Triggers
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Storage Buckets (Safe Insert)
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage Policies
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible." on storage.objects for select using ( bucket_id = 'avatars' );

drop policy if exists "Anyone can upload an avatar." on storage.objects;
create policy "Anyone can upload an avatar." on storage.objects for insert with check ( bucket_id = 'avatars' );

drop policy if exists "Anyone can update an avatar." on storage.objects;
create policy "Anyone can update an avatar." on storage.objects for update with check ( bucket_id = 'avatars' );

-- 7. FORCE SCHEMA CACHE RELOAD
-- This fixes the "Could not find the table ... in the schema cache" error
NOTIFY pgrst, 'reload schema';
