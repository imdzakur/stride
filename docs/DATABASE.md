# DATABASE.md

Status (2 November 2026): migrations `0001` to `0005` are **applied**. The database holds content entered by the owner: Software Engineering, Java, with Java Fundamentals (22 items), Java OOP (26), Java Intermediate (27), and Java Advanced (29), 104 items in all, read through `GET /api/tree`. The example seed `supabase/seed/java_example.sql` is not needed with that content and would fail on the existing Java slug.

## Migrations

The SQL files are the source of truth. This document does not copy the SQL.

| Order | File | Contents | State |
| --- | --- | --- | --- |
| 1 | `0001_init.sql` | Enums, `tasks`, `login_attempts`, `reserve_login_attempt`, RLS, grants | Applied; `tasks` later dropped by 0005 |
| 2 | `0002_categories.sql` | Categories | Applied, removed by 0004 |
| 3 | `0003_progress.sql` | First `get_progress()` | Applied, replaced by 0004 |
| 4 | `0004_checklists.sql` | `task_items`, derived status, second `get_progress()` | Applied, removed by 0005 |
| 5 | `0005_topics.sql` | Drops the task model; creates `topics`, `sections`, `items`, triggers, RLS, grants | Applied |
| seed | `supabase/seed/java_example.sql` | Software Engineering, Java, Basic, Intermediate, Advanced, 18 items | Optional example, not applied |

A draft `0006_system_areas.sql` was removed before it ever ran: System areas are maps shipped with the app and have no rows in the database.

Never edit a migration that has run. New changes ship as `0006_*.sql` and later.

## How to run

1. Open the Supabase SQL Editor for project `cbpsuhsuvnirlnqmatsc`.
2. Paste and run `supabase/migrations/0005_topics.sql`.
3. Optional, on an empty database only: paste and run `supabase/seed/java_example.sql`.

Each file is wrapped in `begin` and `commit`. Never run `supabase db reset` against the remote database.

## Schema after 0005

### Tracks

`public.track_key` enum: the learning tracks `se`, `ai`, `data`, `math`, `stats`. System areas are not stored. Display names live in the app (`src/shared/tracks.ts`).

### `public.topics`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `track` | track_key | Required |
| `title` | text | 1 to 100 characters, trimmed by trigger |
| `slug` | text | Generated from the title, unique per track, used in URLs |
| `sort_order` | integer | Default 0 |
| `created_at` | timestamptz | |

### `public.sections`

Same shape as topics, with `topic_id` (references `topics`, `on delete cascade`) instead of `track`; slug unique per topic.

### `public.items`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `section_id` | uuid | References `sections`, `on delete cascade` |
| `title` | text | 1 to 300 characters, trimmed |
| `note` | text | Optional, up to 2,000 characters |
| `done` | boolean | Default false; the only column the app may change |
| `done_at` | timestamptz | Set and cleared by the `items_fields` trigger |
| `sort_order` | integer | Default 0 |
| `created_at`, `updated_at` | timestamptz | `updated_at` set by trigger |

### `public.login_attempts`

Unchanged from 0001.

### Security

RLS is on for all tables with no public policies. 0005 revokes every privilege on `topics`, `sections`, and `items` from `public`, `anon`, `authenticated`, and `service_role`, then grants `service_role` only `select` on all three and `update (done)` on `items`. The app therefore cannot create, rename, or delete content even by mistake. Content is managed as the database owner in the SQL Editor or Table Editor.

## Managing content

System areas have no content in the database; their maps live in `src/system-maps/`.

```sql
-- add a topic
insert into public.topics (track, title, sort_order) values ('se', 'Python', 2);

-- add sections to it
insert into public.sections (topic_id, title, sort_order)
select t.id, v.title, v.sort_order
from public.topics t,
  (values ('Basic', 1), ('Intermediate', 2), ('Advanced', 3)) as v(title, sort_order)
where t.track = 'se' and t.slug = 'python';

-- add an item
insert into public.items (section_id, title, sort_order)
select s.id, 'Virtual environments', 1
from public.sections s join public.topics t on t.id = s.topic_id
where t.track = 'se' and t.slug = 'python' and s.slug = 'basic';

-- delete a topic with everything below it
delete from public.topics where track = 'se' and slug = 'python';
```

## Progress

Counts are computed in the backend (`src/server/services/progress-calc.ts`) from one embedded select of the whole tree (`src/server/repositories/tree-repository.ts`), so every count shares a snapshot. Section = ticked items over items; topic, track, and overall sum done and total upward; percent is rounded at the end only.

## Verification

### Earlier models (2 November 2026)

- After 0001 to 0003: 33 checks passed, including atomic rate limiting (8 concurrent reservations, exactly 5 allowed).
- After 0004: 28 checks passed for tasks and steps.

### After 0005

Checked on 2 November 2026:

- `tasks` no longer exists (`PGRST205`); `topics`, `sections`, and `items` exist and are empty.
- An insert into `topics` as `service_role` fails with `42501 permission denied for table topics`, as intended.
- `GET /api/tree` returns the five tracks; the Dashboard and track pages render from it. System pages do not use it.

Still to check once the seed is applied:

1. `GET /api/tree` lists Software Engineering, Java, three sections, 18 items, all 0%.
2. Ticking JDK and JRE installation sets `done_at` and moves Basic to 1/6 (17%).
3. A PATCH with any field besides `done` returns 400.
4. As `service_role`, an insert into `topics` fails with a permission error.
5. Deleting the Java topic in the SQL Editor removes its sections and items.

## Maintenance

```sql
delete from public.login_attempts
where created_at < now() - interval '24 hours';
```

Schedule and owner: not decided yet.

## Recovery

- Rolling back the app does not undo migrations.
- 0005 drops `tasks` and `task_items` permanently; both were empty when it was written.
- Check Database > Backups before running a destructive migration in production.
