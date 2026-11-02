-- supabase/migrations/0003_progress.sql
-- Progress aggregation in one statement so category, no-category, and track counts
-- come from the same snapshot. The backend sums the overall row from the track rows.
begin;

create function public.get_progress()
returns table (
  scope text,
  track public.track_key,
  category_id uuid,
  total bigint,
  todo_count bigint,
  doing_count bigint,
  done_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with track_keys as (
    select k.track
    from pg_catalog.unnest(pg_catalog.enum_range(null::public.track_key)) as k(track)
  ),
  progress_groups as (
    select 'track'::text as scope, tk.track, null::uuid as category_id
    from track_keys tk
    union all
    select 'category'::text, tk.track, null::uuid
    from track_keys tk
    union all
    select 'category'::text, c.track, c.id
    from public.categories c
    where c.archived_at is null
  )
  select
    g.scope,
    g.track,
    g.category_id,
    count(t.id) as total,
    count(t.id) filter (where t.status = 'todo') as todo_count,
    count(t.id) filter (where t.status = 'doing') as doing_count,
    count(t.id) filter (where t.status = 'done') as done_count
  from progress_groups g
  left join public.tasks t
    on t.archived_at is null
   and t.track = g.track
   and (g.scope = 'track' or t.category_id is not distinct from g.category_id)
  group by g.scope, g.track, g.category_id
  order by g.track, g.scope desc, g.category_id nulls first;
$$;

revoke all on function public.get_progress()
  from public, anon, authenticated;
grant execute on function public.get_progress()
  to service_role;

commit;
