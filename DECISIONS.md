# DECISIONS.md

Implementation decisions that `RULES.md` and `DESIGN-2.md` do not settle directly. Each row records the decision, the reason, and the impact.

## Product direction (latest instructions from Dzakur)

| Decision | Reason | Impact |
| --- | --- | --- |
| The app is named Stride (previously Undak). | Latest instruction. | Wordmark, metadata, cookies (`stride_session`, `stride_countdown`; `stride_menu` was retired with the accordion), and package name use Stride. Renaming invalidates any existing `undak_*` cookies. |
| All UI text, errors, comments, and documentation are in English. | Latest instruction; replaces the Indonesian UI rule. | Dates format with `en-GB`. `html lang="en"`. |
| The wordmark shows the stair glyph followed by STRIDE. | Replacing the S with stairs reads poorly; the glyph rule still holds. | Screen readers hear STRIDE. |
| The Dashboard shows countdowns to 31 December 2026 (red) and 31 January 2027 (orange), plus a collapsible Later group with 24 October 2027 and 24 October 2028. | Latest instruction. | Tokens `--color-deadline-red`, `--color-deadline-orange`, and their glass containers. |
| Each countdown ends at local midnight at the start of its date and shows days, hours, minutes, and seconds. | The request names a date without a time. | After the target the row shows Reached. Time comes from the viewer's clock and updates every second. |
| The Later group is open by default and its state is saved in the `stride_countdown` cookie (`v1:open` or `v1:closed`, one year). | Keeps the choice across reloads without flicker. | The Dashboard page reads the cookie on the server; it never affects access. |
| On the active menu link only the shape moves; the glyph stays still. | Latest instruction (third revision). | The shape turns slowly on the pastel pill. Disabled under `prefers-reduced-motion: reduce`. |
| DESIGN 2 is the active design: soft pastels, small plain cards, Material 3 Expressive shapes. DESIGN 1 is kept for reference only. | Latest instructions: the monochrome felt dominant; asked for soft pastel, smaller components, simpler cards that do not look like a template. | Tokens in `src/styles/tokens.css` follow DESIGN-2.md section 5. |
| Cards share one `.glass` class, now plain: a light frosted fill, a hairline border, and a barely visible shadow, over a few pastel background shapes. | One implementation keeps every surface consistent and makes the fallback easy. | Falls back to a near-opaque fill without blur when `backdrop-filter` is unsupported or reduced transparency is requested. |
| Each area has a pastel pair and a gentle shape: Software Engineering sky `cookie6`, Artificial Intelligence rose `clover4`, Data Science mint `cookie4`, Mathematics butter `pentagon`, Statistics peach `cookie9`. | Pastel color plus shape makes areas easy to tell apart without heavy color. Spiky shapes looked rough at small sizes. | Set through `data-tone` and `TRACK_SHAPES`. |
| Shapes are generated in code (`src/shapes/shapes.ts`) as polar curves, not copied SVG assets. | Material shape files are not part of any package we use; generating them keeps one source and any size. | Shapes approximate the Material 3 Expressive set; they are not official assets. |
| Deadline red and orange keep their own pairs next to the area pastels. | Explicit earlier request. | Tokens `--color-deadline-*`. |
| Google Sans Flex is loaded through `next/font/google`. | The expressive look depends on type; `next/font` self-hosts the files at build time, so the browser never calls Google. | Build needs network access to fetch the font once. Turbopack warns that it has no fallback metric overrides; harmless. |
| The sidebar is a floating glass panel inset 12 px from the window edge. | The request asked for a visible boundary between the sidebar and the page. | The main area scrolls independently next to it. |
| Sign-out opens a confirmation dialog first. | Latest instruction. | Uses the shared `ConfirmDialog` with the logout glyph; Cancel keeps initial focus. |
| The password field has a show or hide icon button inside its edge. | Latest instruction. | The button uses `aria-pressed` and switches its label; the password is hidden again after a failed sign-in. |
| Countdowns tick every second through `useSyncExternalStore` aligned to whole seconds. | Latest instruction to add seconds. | Only the countdown cards re-render each second. |
| `RULES.md`, `DESIGN-1.md`, `DESIGN-2.md`, and `docs/GIT-SSH.md` are gitignored. | They are internal planning or personal notes. | They stay on the laptop only. Delete the lines in `.gitignore` to publish them. |

## Tracks, plain icons, readable slugs, and the topic accordion (2 November 2026, sixth revision)

| Decision | Reason | Impact |
| --- | --- | --- |
| Artificial Intelligence is now Intelligence System; Development and Operations (`devops`) and Data Engineering (`dataeng`) are new practice tracks. | Latest instruction. "Data Engineer" is named Data Engineering to match the other field names. | Migration `0006_more_tracks.sql` adds the two enum values; it is only needed before adding topics to them. |
| Mathematics and Statistics sit in their own Theory group, divided from Tracks and System. | Theory is studied differently from the practice tracks. | `PRACTICE_TRACKS` and `THEORY_TRACKS`; the Dashboard has a Theory card as well. |
| Icons have no shape or box behind them. | The shapes behind icons looked generated. | `ShapeBadge` and the spinning active shape are removed; `ToneGlyph` draws the glyph in the area tone. Shapes stay only around the countdown days and the overall percent. |
| URLs use readable slugs: `/software-engineering`, `/intelligence-system`, `/development-and-operations`, and so on. | `/se` was unclear. | `AREA_SLUGS` maps keys to slugs; the database keeps the short keys. The proxy redirects old paths such as `/se/java` with 308. The route folder is now `[area]`. |
| Topics in the panel open and close like an accordion: one at a time, all closed on the track page. | Latest instruction. | The open topic follows the page; a topic picked by hand stays open until the page changes. |
| The closed panel is a line in the track tone along the sidebar edge instead of a separate rail. | The rail looked like an empty box sticking out. | The whole strip is the open button. |
| Topic icons cover Java, Terminal, Git, PostgreSQL, Python, Maven, Spring, Docker, Go, TypeScript, Django, Express, C#, .NET, and SQL, in brand colors. | Latest instruction. | Brand marks from Simple Icons (CC0); Terminal, SQL, and C# are drawn in the same style. Matching uses the full title, then its first word. |

## System maps, closable panel, and topic icons (2 November 2026, fifth revision)

| Decision | Reason | Impact |
| --- | --- | --- |
| System areas are read-only system maps built from `FINANCE-MAP-RULES.md` and `LOGISTICS-MAP-RULES.md`, not topic trees. | Latest instruction: System is not a to-do list, it only displays. | Tracks keep the database tree; System has no progress anywhere. `TRACKS` now holds only the five tracks, and `SYSTEM_AREAS` the five maps. |
| The maps live inside Stride at `/finance` and `/logistics` instead of as one standalone HTML file. | The instruction was to put them in System; the rules otherwise ask for a self-contained offline file. | The map data and layout are plain modules (`src/system-maps/`), so a standalone export can be added later without rework. |
| Source of truth: `00_Master_Finance.md` (edition 4.3) with documents 24, 25, and 34; `00_Master_Logistics.md` (edition 1.0) with the 40 internal contracts in document 27. | The rules require the source's boundaries and terms. The documents are in Indonesian; labels are translated to standard English terms. | Every connector names its source, or is marked conceptual and drawn dashed. |
| Logistics has seven views exactly as in its rules table; Finance has six: Overview, Architecture, Domain links, Money movement, Payroll journey, Merchant journey. | Dense detail goes into focused views instead of smaller text. | Linked boxes show where a domain continues in another view. No logistics journey views: the master does not specify them. |
| Layout is a grid with connectors routed through the gaps between boxes; tests check that no connector crosses a box, no label covers a box, and all 26 domains and 40 contracts appear. | Readable, stable layouts without a layout library. | `src/system-maps/layout.ts` and `tests/system-maps.test.ts`. |
| System shows only the overview of each map. The view tabs, the detail views, the note line under the menu, and the source line in the header are removed. | Latest instruction: overview only, and those texts were unclear. | Each map holds one `overview` (`SystemMap.overview`). Logistics overview boxes list their domain numbers, so all 26 domains stay named. Where a link comes from (for example INT-35) still shows when a box is selected. This supersedes the six Finance and seven Logistics views above. |
| Migration `0006_system_areas.sql` is deleted. | It was never applied and is no longer needed. | The next migration may use the number 0006. |
| The topic panel can be closed to a slim rail; the main sidebar cannot. | Latest instruction. | State in the `stride_panel` cookie, read on the server so the panel does not jump. |
| Topics named Java, Python, SQL, Git, TypeScript, Go, C#, or Docker show an icon, matched by title. | Latest instruction. | Brand marks come from Simple Icons (CC0) and are copied into `src/glyphs/topic-icons.ts`, with no new dependency. C# is not in Simple Icons and SQL has no official mark, so both are drawn in the same style. |

## Brand kit, side panel, and System areas (2 November 2026, fourth revision)

| Decision | Reason | Impact |
| --- | --- | --- |
| The text wordmark is replaced by `public/stride-brand-kit/stride-logo-primary.svg`; favicon and app icons use the brand kit app icon. | Latest instruction: use the brand kit from `public`. | The old stair icons and `scripts/generate-icons.mjs` are removed. The proxy skips `/stride-brand-kit/` so the logo loads before sign-in. |
| Topics and sections open in a side panel next to the sidebar instead of a nested tree. | Latest instruction: submenus to the side, tidier and easier to read. | The panel appears on any area page; the sidebar keeps only top-level links. |
| Menu rows are 40 px with 4 px gaps; group dividers separate Tracks and System. | The previous rows felt cramped; text size was right. | Tokens `--menu-row-min-height` and `--menu-row-gap`. |
| (Superseded by the fifth revision) System is a group of exactly five fixed areas: Finance, Logistics, Retail and Commerce, Health, Travel and Hospitality. They share the topic tree with the tracks. | Latest instruction. | Migration `0006_system_areas.sql` extends `track_key`. The earlier System page with SQL examples is removed; the SQL lives in `docs/DATABASE.md`. |
| The enum keeps the name `track_key` and the code keeps `Track` for any area. | Renaming an enum used by every table adds risk for no user benefit. | `LEARNING_TRACKS`, `SYSTEM_AREAS`, and `areaGroup` tell the two groups apart. |

## Topic tree (2 November 2026, third revision)

| Decision | Reason | Impact |
| --- | --- | --- |
| Content is a tree: track, topic, section, item. Tasks, steps, and derived status are removed. | Latest instruction: Software Engineering, then Java, then Basic, Intermediate, Advanced, each with items such as JDK to tick. | Migration `0005_topics.sql` (drops `tasks` and `task_items`, both empty) and seed `supabase/seed/java_example.sql`. |
| Content is created, edited, and deleted only in the database. | Latest instruction: CRUD in the database, not in the client. | The app has no forms; `service_role` holds only `select` and `update (done)`, enforced by grants. |
| Topic and section URLs use slugs generated by the database from titles. | Readable URLs such as `/se/java/basic` without asking the user to type slugs. | Renaming a title changes its URL. Slugs are unique per track or topic. |
| The whole tree loads in one `GET /api/tree` and counts are computed in the backend. | A personal study tree is small; one embedded select gives one snapshot for every count. | `get_progress()` and the per-track queries are gone. |
| Ticking is optimistic and rolls back with a message on failure. | Ticking should feel instant. | The sidebar, bars, and percentages update together. |
| Track names are full words in normal case; "Data Science" is used for the `data` track. | Latest instruction asked for full names like Software Engineering, not all caps; "Data" alone read as vague. | Change `TRACK_LABELS` in `src/shared/tracks.ts` to rename. |
| The sidebar is a tree with chevron buttons; the branch of the current page opens on its own. | Sections must be reachable from the menu without making links double as toggles. | Expand and collapse choices last for the visit; no preference cookie. |
| (Superseded) A System page explained content management with SQL examples. | An earlier instruction. | Replaced by the five System areas; the SQL moved to `docs/DATABASE.md`. |
| The `search` glyph is removed. | Latest instruction. | No search feature exists. |

## Checklists (2 November 2026, superseded)

| Decision | Reason | Impact |
| --- | --- | --- |
| Categories are removed and replaced by per-task checklists (steps) in `task_items`. | Latest instruction: SE, then Java Basic, then steps to tick; delete categories from the database. | Migration `0004_checklists.sql`; category data is dropped permanently. The No category view, System menu, and accordion are gone. |
| A task with steps derives its status in the database (none, some, all ticked). | One source of truth; the client cannot leave a task out of sync with its steps. | A status sent for such a task is overridden; the status button is hidden for it. |
| Progress counts steps; a task without steps counts as one step. | Ticking one step of Java Basic should move the bar, while plain tasks still count. | `get_progress()` returns `step_total` and `step_done`; the sidebar shows percentages. |
| New tasks may carry up to 50 initial steps, created by `create_task_with_items` in one transaction. | The composer accepts steps one per line; partial creation would leave a task without its steps. | One RPC per new task. |
| Removing a step deletes it; archiving a task freezes its steps. | Steps are small checklist lines without history value; tasks keep the archive rule. | `DELETE /api/items/:id` is permanent; changes on archived tasks return 404. |
| Steps tick optimistically in the checklist and roll back on failure. | Ticking should feel instant. | The list and progress reload after every change. |
| The sidebar shows tracks as direct links. | With categories gone, a submenu would only hold All tasks. | `stride_menu` is no longer read or written. |

## Design

| Decision | Reason | Impact |
| --- | --- | --- |
| (Superseded) DESIGN 1 was the first active design. | RULES section 0 originally made DESIGN 1 active. | Replaced by DESIGN 2 with Liquid Glass on 2 November 2026. |
| The task status changes through one glyph button cycling to do, in progress, done, then back to to do. | Three states do not fit a checkbox; DESIGN 2 section 8 also rules out the mixed state. | The accessible name states the current and next status. |
| The delete action is labelled Archive. | RULES 6.1 defines delete as archive; the label matches the real behavior. | The confirm dialog uses Cancel and Archive. |
| Empty status groups are hidden. When the whole list is empty, the page says No tasks yet. | Avoids headings with no content. | Group order stays In progress, To do, Done. |
| The Dashboard shows per-track numbers in a table with thin horizontal lines. | RULES 5.3 asks for a table or row list without stat cards. | Track names show immediately; numbers use skeletons until data arrives. |
| The chevron rotates without a transition. | DESIGN 1 section 11 avoids size and position transitions. | The open state is also announced through `aria-expanded`. |
| The white-on-black icon is `public/icon-512-inverse.png`. | RULES section 1 asks for both color versions; the repo layout lists one PNG. | `icon-512.png` (black on white) stays the main icon. |

## Architecture

| Decision | Reason | Impact |
| --- | --- | --- |
| The project lives in this working folder, not in a separate `stride/` subfolder. | This folder becomes the repo root. | The layout inside the root matches RULES section 9. |
| Progress aggregation uses the SQL function `public.get_progress()`, now from `0004_checklists.sql`. | One SQL statement gives all tracks from one consistent snapshot; separate Supabase calls do not. | Only `service_role` may execute it. The backend fills empty tracks and computes percentages. |
| `sort_order` travels through the API as a decimal string. PostgREST casts `sort_order::text`. | bigint can exceed `Number.MAX_SAFE_INTEGER`; RULES 10.1 allows a string form. | `sort_order` input is a string too, validated against the bigint range. |
| The proxy answers 404 for unknown pages. | `(app)/loading.tsx` streams pages with status 200 before `notFound()` in a page runs. | Correct status codes while keeping the shell skeleton. New page routes must be added to `src/proxy.ts`. |
| Status changes, edits, and archives wait for the server before updating the view. | Nothing local needs restoring when a save fails. | The related control is disabled while the request runs. |
| Extra folders: `src/client/`, `src/components/ui/`, `src/components/shell/`, `src/components/auth/`. | Separates client logic and base components from feature components. | The main layout from RULES section 9 still applies. |

## Security and sessions

| Decision | Reason | Impact |
| --- | --- | --- |
| Password hash format `scrypt:N:r:p:salt:key` with colon separators. | Next.js expands `$VAR` inside `.env` files, which breaks a `$` format. | `corepack pnpm hash-password` prints this format with N=32768, r=8, p=1, a 16 byte salt, and a 32 byte key. |
| The cookie `secure` flag follows the `APP_URL` protocol. | Vercel production is always HTTPS, while `next start` on the laptop is HTTP. | Production and Preview get secure cookies; the laptop can still sign in. |
| The session token identity is the fixed value `owner`. | RULES 7 limits the token to a fixed identity, issue time, and expiry. | Rotating `SESSION_SECRET` invalidates every session. There is no per-token revocation. |
| The rate-limit IP comes from `x-forwarded-for` only when `VERCEL=1`. Elsewhere every attempt shares the `local` bucket. | Vercel overwrites that header; other environments let clients forge it. | Must be checked on a real deployment, as RULES 7 requires. |
| Sign-out sends `Clear-Site-Data: "cache"` and fully reloads to `/login`. | Clears the HTTP cache and React state that held task data. | Layout preference cookies stay. |
| Basic security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) in `next.config.ts`. | Prevents framing and referrer leaks. | No feature change. |
| The Supabase secret key shared in chat is used in `.env.local` for local development only. | Dzakur provided it explicitly. RULES 12 forbids keys that passed through chat for deployments. | Create a fresh key directly in Vercel before deploying, then revoke this one. |

## Dependencies

| Package | Reason |
| --- | --- |
| `next`, `react`, `react-dom` | Required stack, RULES section 9. |
| `@supabase/supabase-js` | Official Supabase client used from the server. |
| `zod` | Validation at every boundary (body, query, env). |
| `server-only` | Keeps database modules out of the browser bundle. |
| `typescript` 5.9.3 | Version 7 is the new native compiler; 5.9 is the most proven with Next.js 16. |
| `eslint` 9, `eslint-config-next` | Linting per RULES section 13. npm marks 9.39.5 deprecated; moving to ESLint 10 needs a separate test. |
| `prettier` | Formatting per RULES section 13. |
| `vitest` 4 | Behavior tests (progress, session, hash, menu preference, schemas, countdowns) without a browser. |

## Runtime versions

| Item | Value | Reason |
| --- | --- | --- |
| Node | 24 (`.nvmrc`, `engines`) | LTS supported by Next.js 16 and Vercel, same as the laptop. |
| pnpm | 10.34.9 (`packageManager`) | Run through `corepack pnpm` without a global install. |
| Next.js | 16.4.3 | Latest stable at implementation time; uses `src/proxy.ts`. |
