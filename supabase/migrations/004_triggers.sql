-- ============================================================
-- AI Study Partner - Triggers
-- ============================================================

-- Auto-create profile + garden on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  insert into public.garden_stats (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update word_count and updated_at on materials
create or replace function public.update_material_meta()
returns trigger
language plpgsql
as $$
begin
  new.word_count := array_length(
    regexp_split_to_array(trim(new.markdown_content), '\s+'), 1
  );
  if new.word_count is null then new.word_count := 0; end if;
  new.updated_at := now();
  -- If content changed, mark as needing re-indexing
  if (tg_op = 'UPDATE' and old.markdown_content is distinct from new.markdown_content) then
    new.is_indexed := false;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_materials_meta on materials;
create trigger trg_materials_meta
  before insert or update on materials
  for each row execute function public.update_material_meta();

-- Auto-update updated_at on profiles
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

create trigger trg_profiles_touch before update on profiles
  for each row execute function public.touch_updated_at();
create trigger trg_garden_touch before update on garden_stats
  for each row execute function public.touch_updated_at();
