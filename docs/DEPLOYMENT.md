# DEPLOYMENT.md

Current status:

| Step | Status |
| --- | --- |
| Application code | Written and checked locally (typecheck, lint, format, tests, build, smoke test) |
| `.env.local` | Created on the laptop; gitignored |
| Supabase key | Accepted by the project in a read-only check; it was shared in chat, so it is for local development only |
| Supabase migrations | 0001 to 0005 applied; content entered by the owner (Java, 104 items) |
| GitHub repo | `imdzakur/stride`, branch `main`, pushed over HTTPS on 2 November 2026 |
| Vercel project | Not created |
| Deployment | Not done |
| Rotation of keys shared in chat | Not done |

## Environments

| Environment | App | Database |
| --- | --- | --- |
| Development | `corepack pnpm dev` on the laptop, `APP_URL=http://localhost:3000` | Development project if one exists |
| Preview | Vercel Preview | A separate development database when available. Never give it production access silently |
| Production | Vercel Production | Project `cbpsuhsuvnirlnqmatsc`, region West EU (Ireland) |

## Environment variables

Names only, never values. `.env.example` explains how to obtain each one.

| Name | Development | Preview | Production |
| --- | --- | --- | --- |
| `APP_USERNAME` | yes | yes | yes |
| `APP_PASSWORD_HASH` | yes | yes | yes |
| `APP_URL` | `http://localhost:3000` | preview URL | production URL |
| `SESSION_SECRET` | yes, own value | yes, own value | yes, own value |
| `RATE_LIMIT_SECRET` | yes, own value | yes, own value | yes, own value |
| `SUPABASE_URL` | yes | yes | yes |
| `SUPABASE_SECRET_KEY` | yes | yes | yes, a key never shared in chat |

There are no `NEXT_PUBLIC_` variables. Vercel env changes apply to new deployments, so redeploy after editing them.

Preview `APP_URL`: Vercel preview URLs change per deployment. Use a stable branch alias or set it per deployment. When the request Origin differs from `APP_URL`, every POST, PATCH, and DELETE is rejected with 403.

## Steps

1. Inspect the database (see `docs/DATABASE.md`, Before running).
2. Apply `0001` to `0005` in order, then `supabase/seed/java_example.sql` only on an empty database if wanted. Development first, verify, then production. Migrations are an explicit step before the app version that needs them, never part of the build.
3. On the laptop:

   ```bash
   corepack pnpm install
   corepack pnpm typecheck
   corepack pnpm lint
   corepack pnpm format:check
   corepack pnpm test
   corepack pnpm build
   corepack pnpm dev
   ```

   Sign in at `http://localhost:3000` and open Software Engineering, Java, Basic, tick items, and check progress, countdowns, the Finance and Logistics maps, and sign-out.
4. Set the repo Git identity, create the GitHub repo Dzakur chooses, commit, and push.
5. Import the repo into Vercel with the Next.js preset. Root directory: repo root. Install command: `pnpm install` (Vercel reads `packageManager`). Build command: `pnpm build`. Node: 24.x.
6. Pick a Vercel function region near the database (Western Europe, for example `dub1` Dublin) if the account allows it.
7. Create a new Supabase secret key directly for Vercel and set every env for Development, Preview, and Production separately.
8. Deploy, then test from the real URL:
   - sign in, refresh, close and reopen the browser: the session stays;
   - sixth sign-in attempt within 15 minutes: 429 with `Retry-After: 900`;
   - API without a cookie: 401; POST from another Origin: 403;
   - menu accordion and preference after reload; active glyph motion;
   - Dashboard countdowns and the later toggle, skeletons, the sidebar tree, ticking items, progress, System maps, sign-out;
   - open from a phone: redirected to `/blocked`, API 403;
   - confirm `x-forwarded-for` drives rate limiting as expected.
9. Revoke the Supabase key that was shared in chat once the new key works. Confirm the old key is rejected.
10. Schedule `login_attempts` cleanup (see `docs/DATABASE.md`).
11. Record below: URL, commit, deploy time, migrations applied, test results, recovery steps.

## Deployment log

No deployment yet.

| Item | Value |
| --- | --- |
| Production URL | none |
| Commit | none |
| Deploy time | none |
| Migrations applied | none |
| Real URL test results | none |

## Recovery

- App rollback: Vercel > Deployments > pick an earlier deployment > Promote. This does not undo migrations.
- Database changes are reversed with a new corrective migration after checking backups.
- If `SESSION_SECRET` leaks: change it and redeploy. Every old session becomes invalid.
