-- Circle Match schema for Lean In Connect prototype
-- Run in Supabase SQL editor or via CLI migration tooling.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  email text not null unique,
  preferences jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text not null,
  who_its_for text not null,
  topics text[] not null default '{}',
  support_types text[] not null default '{}',
  career_stages text[] not null default '{}',
  format text not null check (format in ('virtual', 'in-person', 'hybrid')),
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly', 'flexible')),
  location text not null,
  schedule text not null,
  member_count integer not null default 0 check (member_count >= 0),
  image_tone text not null check (image_tone in ('burgundy', 'blush', 'sage', 'sand', 'slate', 'rose')),
  leader jsonb not null,
  members jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  circle_id uuid not null references public.circles (id) on delete cascade,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  unique (profile_id, circle_id)
);

create index if not exists circles_slug_idx on public.circles (slug);
create index if not exists join_requests_profile_idx on public.join_requests (profile_id);
create index if not exists join_requests_circle_idx on public.join_requests (circle_id);

alter table public.profiles enable row level security;
alter table public.circles enable row level security;
alter table public.join_requests enable row level security;

-- Prototype policies: readable Circles for anon; demo profile + join requests writable via anon key.
-- Replace with authenticated user policies when auth is added.

drop policy if exists "circles are readable" on public.circles;
create policy "circles are readable"
  on public.circles for select
  using (true);

drop policy if exists "demo profile readable" on public.profiles;
create policy "demo profile readable"
  on public.profiles for select
  using (true);

drop policy if exists "demo profile updatable" on public.profiles;
create policy "demo profile updatable"
  on public.profiles for update
  using (true)
  with check (true);

drop policy if exists "join requests readable" on public.join_requests;
create policy "join requests readable"
  on public.join_requests for select
  using (true);

drop policy if exists "join requests insertable" on public.join_requests;
create policy "join requests insertable"
  on public.join_requests for insert
  with check (true);
