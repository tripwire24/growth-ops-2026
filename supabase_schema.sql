-- 1. Create a table for public profiles (Syncs with Auth)
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text
);

-- 2. Enable Enums for strict status control
create type experiment_status as enum ('idea', 'hypothesis', 'running', 'complete', 'learnings');
create type experiment_result as enum ('won', 'lost', 'inconclusive');

-- 3. Create Experiments Table
create table experiments (
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

-- 4. Create Comments Table
create table comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  experiment_id uuid references experiments(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  text text not null
);

-- 5. Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table experiments enable row level security;
alter table comments enable row level security;

-- 6. Create Access Policies
-- Profiles
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Experiments
create policy "Experiments are viewable by everyone." on experiments for select using (true);
create policy "Authenticated users can insert experiments." on experiments for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update experiments." on experiments for update using (auth.role() = 'authenticated');

-- Comments
create policy "Comments are viewable by everyone." on comments for select using (true);
create policy "Authenticated users can insert comments." on comments for insert with check (auth.role() = 'authenticated');

-- 7. Trigger to automatically create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
