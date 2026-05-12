-- RPC: vector similarity search
create or replace function public.match_chunks(
  query_embedding vector(384),
  match_user_id uuid,
  match_material_id uuid default null,
  match_threshold float default 0.5,
  match_count int default 5
)
returns table (
  id uuid,
  material_id uuid,
  chunk_index int,
  content text,
  section_heading text,
  char_start int,
  char_end int,
  similarity float
)
language sql stable
security definer
set search_path = public
as $$
  select
    mc.id,
    mc.material_id,
    mc.chunk_index,
    mc.content,
    mc.section_heading,
    mc.char_start,
    mc.char_end,
    1 - (mc.embedding <=> query_embedding) as similarity
  from material_chunks mc
  where mc.user_id = match_user_id
    and (match_material_id is null or mc.material_id = match_material_id)
    and mc.embedding is not null
    and 1 - (mc.embedding <=> query_embedding) > match_threshold
  order by mc.embedding <=> query_embedding
  limit match_count;
$$;

-- RPC: increment streak (idempotent for same day)
create or replace function public.record_study_day(
  p_user_id uuid,
  p_minutes int default 0
)
returns table (
  current_streak int,
  longest_streak int,
  current_plant_stage int,
  is_new_day boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := current_date;
  v_last date;
  v_streak int;
  v_longest int;
  v_stage int;
  v_new_day boolean := false;
begin
  select last_study_date, gs.current_streak, gs.longest_streak
    into v_last, v_streak, v_longest
  from garden_stats gs where gs.user_id = p_user_id;

  if v_last is null or v_last < v_today then
    v_new_day := true;
    if v_last = v_today - 1 then
      v_streak := v_streak + 1;
    else
      v_streak := 1;
    end if;
    if v_streak > v_longest then v_longest := v_streak; end if;
  end if;

  -- Stage formula: floor(streak / 3), capped at 4
  v_stage := least(4, v_streak / 3);

  update garden_stats gs set
    current_streak = v_streak,
    longest_streak = v_longest,
    last_study_date = v_today,
    total_study_days = gs.total_study_days + (case when v_new_day then 1 else 0 end),
    total_minutes_studied = gs.total_minutes_studied + p_minutes,
    current_plant_stage = v_stage,
    plants_grown_total = gs.plants_grown_total + (case when v_stage = 4 and gs.current_plant_stage < 4 then 1 else 0 end),
    garden_layout = case
      when v_stage = 4 and gs.current_plant_stage < 4
        then gs.garden_layout || jsonb_build_object('grown_at', now(), 'streak', v_streak)
      else gs.garden_layout
    end
  where gs.user_id = p_user_id;

  return query select v_streak, v_longest, v_stage, v_new_day;
end;
$$;
