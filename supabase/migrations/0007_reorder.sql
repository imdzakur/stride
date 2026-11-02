-- supabase/migrations/0007_reorder.sql
-- Lets the app reorder topics within a track and sections within a topic.
-- The app may change only sort_order; titles, slugs, and content still change in the database.
-- Each function takes the full list of ids in the new order and writes it in one statement.
-- A list that is not exactly the current set (missing, extra, or repeated ids) is rejected
-- with SQLSTATE 22023, so a stale screen can never scramble the order.
begin;

grant update (sort_order) on public.topics, public.sections to service_role;

create function public.reorder_topics(p_track public.track_key, p_ids uuid[])
returns void
language plpgsql
set search_path = ''
as $$
begin
  if cardinality(p_ids) is distinct from (select count(*) from public.topics where track = p_track)
     or cardinality(p_ids) <> (select count(distinct id) from unnest(p_ids) as id)
     or exists (
       select 1 from unnest(p_ids) as given(id)
       where not exists (select 1 from public.topics t where t.id = given.id and t.track = p_track)
     )
  then
    raise exception 'order does not match the topics of this track' using errcode = '22023';
  end if;

  update public.topics t
  set sort_order = o.position
  from unnest(p_ids) with ordinality as o(id, position)
  where t.id = o.id;
end;
$$;

create function public.reorder_sections(p_topic uuid, p_ids uuid[])
returns void
language plpgsql
set search_path = ''
as $$
begin
  if cardinality(p_ids) is distinct from (select count(*) from public.sections where topic_id = p_topic)
     or cardinality(p_ids) <> (select count(distinct id) from unnest(p_ids) as id)
     or exists (
       select 1 from unnest(p_ids) as given(id)
       where not exists (
         select 1 from public.sections s where s.id = given.id and s.topic_id = p_topic
       )
     )
  then
    raise exception 'order does not match the sections of this topic' using errcode = '22023';
  end if;

  update public.sections s
  set sort_order = o.position
  from unnest(p_ids) with ordinality as o(id, position)
  where s.id = o.id;
end;
$$;

revoke all on function public.reorder_topics(public.track_key, uuid[]) from public, anon, authenticated;
revoke all on function public.reorder_sections(uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.reorder_topics(public.track_key, uuid[]) to service_role;
grant execute on function public.reorder_sections(uuid, uuid[]) to service_role;

commit;
