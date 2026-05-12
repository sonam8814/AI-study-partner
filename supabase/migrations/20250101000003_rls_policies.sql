-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.materials enable row level security;
alter table public.study_sessions enable row level security;
alter table public.weak_spots enable row level security;
alter table public.garden_stats enable row level security;
alter table public.material_chunks enable row level security;

-- Profiles
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- Materials
create policy "materials_all_own" on materials for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Study Sessions
create policy "sessions_all_own" on study_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Weak Spots
create policy "weakspots_all_own" on weak_spots for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Garden Stats
create policy "garden_select_own" on garden_stats for select using (auth.uid() = user_id);
create policy "garden_update_own" on garden_stats for update using (auth.uid() = user_id);
create policy "garden_insert_own" on garden_stats for insert with check (auth.uid() = user_id);

-- Material Chunks (read-only from client; backend uses service role)
create policy "chunks_select_own" on material_chunks for select using (auth.uid() = user_id);
