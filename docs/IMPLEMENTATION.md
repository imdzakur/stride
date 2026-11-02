# IMPLEMENTATION.md

Implementation notes for Stride V1. Status: **written and checked locally** (typecheck, lint, format, tests, build) on 2 November 2026 for the topic tree model. `0005_topics.sql` is applied; the empty tree loads and backend writes other than `done` are refused. Ticking is not tested yet because the Java seed is not loaded. Not deployed.

## Request flow

```text
Browser
  -> src/proxy.ts            phone block, first session check, 404 for unknown paths
  -> app/(app)/layout.tsx    session check again, no data queries
  -> DeviceGate (client)     data only loads after width and pointer checks pass
  -> fetch /api/tree         one read of the whole study tree
  -> PATCH /api/items/:id    the only write: tick or untick
  -> Supabase                server only; the backend role can select and update items.done
```

## Content model

```text
track (fixed: se, ai, data, math, stats)
  topic      e.g. Java                 public.topics
    section  e.g. Basic                public.sections
      item   e.g. JDK and JRE install  public.items (done can be ticked)
```

Content is created, edited, and deleted in the database. The app has no forms for it.

## Files

### Server

| File | Purpose |
| --- | --- |
| `server/repositories/rows.ts` | zod schemas for topic, section, item rows; the embedded tree select |
| `server/repositories/tree-repository.ts` | Reads topics with sections and items, ordered at every level |
| `server/repositories/items-repository.ts` | Sets `done` on one item |
| `server/services/progress-calc.ts` | Builds counts (done, total, percent) for sections, topics, tracks, overall |
| `server/services/tree-service.ts` | `getTree`, `tickItem` |
| `server/route-id.ts` | UUID check for route params |
| `server/auth/*`, `guard.ts`, `http.ts`, `env.ts` | Sessions, Origin checks, responses, env validation |

### Shared and client

| File | Purpose |
| --- | --- |
| `shared/tracks.ts` | Track keys and full names |
| `shared/types.ts` | `StudyTree`, `TrackNode`, `Topic`, `Section`, `Item`, `Counts` |
| `shared/schemas.ts` | `itemUpdateSchema` (`done` only), slug check, sign-in schema |
| `client/app-data.tsx` | Loads the tree once; `toggleItem` updates counts at once and rolls back on failure |

### Components

| Folder | Purpose |
| --- | --- |
| `sidebar/` | Sidebar with the brand logo, Dashboard, Tracks, System areas, Sign out; `area-panel.tsx` shows topics and sections beside it and closes to a rail |
| `system-map/` | System page: the overview on a zoomable canvas, legend, and selection details |
| `glyph/topic-icon.tsx` | Topic icons matched by title, from `src/glyphs/topic-icons.ts` |
| `study/` | Track, topic, and section views; checklist; loading and not found states |
| `dashboard/` | Countdowns, overall progress shape, track rows |
| `shape/` | Shape generator component, centered `ShapeBadge`, area shapes, background shapes |

### Routes

| Route | File |
| --- | --- |
| `/dashboard` | `(app)/dashboard/page.tsx` |
| `/<track>` and `/<system area>` | `(app)/[track]/page.tsx`; System areas render their overview map |
| `/<track>/<topic>` | `(app)/[track]/[topic]/page.tsx` |
| `/<track>/<topic>/<section>` | `(app)/[track]/[topic]/[section]/page.tsx` |
| `GET /api/tree` | `api/tree/route.ts` |
| `PATCH /api/items/:id` | `api/items/[id]/route.ts` |

Removed: task and step APIs, the composer, edit and archive, the `search` glyph, the System info page, the generated stair icons.

## Visual system

- Soft pastels on warm paper; each area has a pastel pair set through `data-tone`.
- Small plain cards (16 px radius, compact padding, hairline border).
- Area names in full: five tracks plus five System areas (Finance, Logistics, Retail and Commerce, Health, Travel and Hospitality).
- System areas are read-only maps. Data in `src/system-maps/finance.ts` and `logistics.ts`, grid layout and connector routing in `layout.ts`. Retail and Commerce, Health, and Travel and Hospitality show No map yet.
- The brand kit logo replaces the text wordmark; favicon and app icons come from the kit.
- Menu rows are 40 px with 4 px gaps; hairlines divide Dashboard, Tracks, and System.
- Glyphs sit on their own layer, exactly centered on the shape. Only gentle shapes are used at badge size.
- On the active top-level menu link the shape turns slowly; the glyph stays still.

## Test results

Run on 2 November 2026, Windows 11, Node 24.22.0.

| Command | Result |
| --- | --- |
| `corepack pnpm typecheck` | Passed |
| `corepack pnpm lint` | Passed |
| `corepack pnpm format:check` | Passed |
| `corepack pnpm test` | 5 files, 23 tests passed |
| `corepack pnpm build` | Passed; Turbopack notes that Google Sans Flex has no fallback metric overrides |

| Suite | Behavior |
| --- | --- |
| `tests/progress.test.ts` | Counts roll up from sections to topics, tracks, overall; raw sums (1/2 + 9/10 = 83%); empty tracks at 0; topics stay in their track and order |
| `tests/schemas.test.ts` | Item updates accept only `done`; slug rules; track keys |
| `tests/session.test.ts`, `tests/password.test.ts` | Sessions and password hashing |
| `tests/countdowns.test.ts` | Countdown math with seconds; later group preference |

## Not tested yet

- Ticking against the database once the seed is loaded (see `docs/DATABASE.md`, Verification, After 0005).
- Visual check of the new pastel design and the sidebar tree in a browser.
- Keyboard walkthrough; widths 1024 and 1280 px.
