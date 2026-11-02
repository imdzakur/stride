-- supabase/migrations/0005_topics.sql
-- Replaces tasks and steps with a three-level study tree:
--   track (fixed enum) -> topic (for example Java) -> section (Basic, Intermediate, Advanced)
--   -> item (for example JDK), which can be ticked.
-- Content is created, edited, and deleted directly in the database. The app only reads
-- the tree and ticks items, so its backend role gets select plus update of items.done.
-- Run once after 0001 to 0004. It permanently drops tasks and task_items (empty on 2 November 2026).
begin;

-- 1. Remove the task model.
drop table if exists public.task_items cascade;
drop table if exists public.tasks cascade;
drop function if exists public.get_progress();
drop function if exists public.create_task_with_items(public.track_key, text, text, date, text[]);
drop function if exists public.derive_task_status(uuid);
drop function if exists public.set_task_item_fields();
drop function if exists public.sync_task_status_from_items();
drop function if exists public.apply_derived_task_status();
drop function if exists public.set_task_timestamps();
drop type if exists public.task_status;

-- 2. Topics inside a track, for example Java inside se.
-- slug is derived from the title for readable URLs: 'Java Basics' -> 'java-basics'.
create table public.topics (
  id uuid primary key default gen_random_uuid(),
  track public.track_key not null,
  title text not null check (char_length(btrim(title)) between 1 and 100),
  slug text generated always as (
    btrim(regexp_replace(lower(btrim(title)), '[^a-z0-9]+', '-', 'g'), '-')
  ) stored,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint topics_slug_present check (slug <> ''),
  constraint topics_track_slug_unique unique (track, slug)
);

create index topics_track_order_idx on public.topics (track, sort_order, title, id);

-- 3. Sections inside a topic, for example Basic, Intermediate, Advanced.
create table public.sections (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 100),
  slug text generated always as (
    btrim(regexp_replace(lower(btrim(title)), '[^a-z0-9]+', '-', 'g'), '-')
  ) stored,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint sections_slug_present check (slug <> ''),
  constraint sections_topic_slug_unique unique (topic_id, slug)
);

create index sections_topic_order_idx on public.sections (topic_id, sort_order, title, id);

-- 4. Items inside a section, for example JDK inside Basic. Only items can be ticked.
create table public.items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 300),
  note text check (note is null or char_length(note) <= 2000),
  done boolean not null default false,
  done_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint items_done_at_consistent check (
    (done and done_at is not null) or (not done and done_at is null)
  )
);

create index items_section_order_idx on public.items (section_id, sort_order, created_at, id);

-- Keeps done_at and updated_at correct, whether the app or the SQL Editor changes a row.
create function public.set_item_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.title := btrim(new.title);
  new.updated_at := now();
  if new.done then
    if TG_OP = 'INSERT' or not old.done then
      new.done_at := coalesce(new.done_at, now());
    else
      new.done_at := old.done_at;
    end if;
  else
    new.done_at := null;
  end if;
  return new;
end;
$$;

create trigger items_fields
before insert or update on public.items
for each row execute function public.set_item_fields();

create function public.trim_title()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.title := btrim(new.title);
  return new;
end;
$$;

create trigger topics_trim_title
before insert or update on public.topics
for each row execute function public.trim_title();

create trigger sections_trim_title
before insert or update on public.sections
for each row execute function public.trim_title();

-- 5. Security: RLS on, no public policies, and a read-mostly backend role.
alter table public.topics enable row level security;
alter table public.sections enable row level security;
alter table public.items enable row level security;

revoke all on public.topics, public.sections, public.items
  from public, anon, authenticated, service_role;
revoke all on function public.set_item_fields() from public, anon, authenticated;
revoke all on function public.trim_title() from public, anon, authenticated;

grant select on public.topics, public.sections, public.items to service_role;
-- The app may only tick and untick; every other change happens in the database.
grant update (done) on public.items to service_role;

commit;
