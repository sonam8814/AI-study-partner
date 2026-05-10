-- ============================================================
-- AI Study Partner - Initial Schema
-- ============================================================

-- 1. Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  display_name text,
  preferred_mode text not null default 'tutor'
    check (preferred_mode in ('peer','tutor','examiner','feynman')),
  voice_always_on boolean not null default false,
  llm_preference text not null default 'groq'
    check (llm_preference in ('groq','ollama')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Materials (study notes / knowledge base items)
create table public.materials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  markdown_content text not null default '',
  tags text[] not null default '{}',
  word_count int not null default 0,
  last_studied_at timestamptz,
  is_indexed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_materials_user on materials(user_id);
create index idx_materials_updated on materials(updated_at desc);
create index idx_materials_tags on materials using gin(tags);

-- 3. Study Sessions (chat history)
create table public.study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  material_id uuid references materials(id) on delete cascade,
  mode text not null check (mode in ('peer','tutor','examiner','feynman')),
  messages jsonb not null default '[]'::jsonb,
  duration_seconds int not null default 0,
  message_count int not null default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create index idx_sessions_user on study_sessions(user_id, started_at desc);
create index idx_sessions_material on study_sessions(material_id);

-- 4. Weak Spots (tracked struggles)
create table public.weak_spots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  material_id uuid references materials(id) on delete cascade,
  topic text not null check (char_length(topic) between 1 and 200),
  description text,
  miss_count int not null default 1 check (miss_count >= 1),
  last_missed_at timestamptz not null default now(),
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_weakspots_user on weak_spots(user_id, resolved, last_missed_at desc);
create unique index idx_weakspots_unique
  on weak_spots(user_id, material_id, topic)
  where resolved = false;

-- 5. Garden Stats (gamification)
create table public.garden_stats (
  user_id uuid primary key references auth.users on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  total_study_days int not null default 0,
  total_minutes_studied int not null default 0,
  last_study_date date,
  current_plant_stage int not null default 0
    check (current_plant_stage between 0 and 4),
  plants_grown_total int not null default 0,
  garden_layout jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
