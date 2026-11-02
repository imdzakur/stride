# Stride

A study tracker: five learning tracks (Software Engineering, Artificial Intelligence, Data Science, Mathematics, Statistics) holding topics, sections, and items to tick, plus five System areas (Finance, Logistics, Retail and Commerce, Health, Travel and Hospitality) that show read-only system maps. Track content is managed in the database. Single user, laptop or desktop only.

Implementation decisions are in `DECISIONS.md`. Detailed notes live in `docs/`.

## Stack

- Next.js 16 (App Router), React 19, strict TypeScript
- CSS Modules with CSS variables from `src/styles/tokens.css`
- Supabase PostgreSQL, accessed from the server only
- zod for body, query, and env validation
- Deployment target: Vercel

## Prerequisites

- Node 24 (see `.nvmrc`)
- pnpm 10.34.9, run through the Corepack bundled with Node: `corepack pnpm <command>`
- A Supabase project with the migrations in `supabase/migrations/` applied (see `docs/DATABASE.md`)

## Local setup

Run every command from the repo root, in Git Bash or PowerShell.

1. Install dependencies:

   ```bash
   corepack pnpm install
   ```

2. Copy the example env and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   PowerShell: `Copy-Item .env.example .env.local`

3. Create the password hash interactively. The password is not echoed and never appears in terminal arguments:

   ```bash
   corepack pnpm hash-password
   ```

   Copy the `APP_PASSWORD_HASH=...` line into `.env.local`.

4. Create two separate secrets for `SESSION_SECRET` and `RATE_LIMIT_SECRET`:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
   ```

5. Set `SUPABASE_SECRET_KEY` to a secret key from Supabase Settings > API Keys.

6. Run:

   ```bash
   corepack pnpm dev
   ```

   Open `http://localhost:3000` in a desktop browser with a window at least 1024 px wide.

## Check commands

| Command | Purpose |
| --- | --- |
| `corepack pnpm typecheck` | TypeScript check |
| `corepack pnpm lint` | ESLint |
| `corepack pnpm format:check` | Prettier check |
| `corepack pnpm format` | Apply Prettier |
| `corepack pnpm test` | Vitest |
| `corepack pnpm build` | Production build |
| `corepack pnpm start` | Run the production build |

## Documentation

| File | Contents |
| --- | --- |
| `docs/IMPLEMENTATION.md` | Files, features, API, menu and skeleton behavior, test results |
| `docs/DATABASE.md` | Migrations, schema, progress formula, verification |
| `docs/DEPLOYMENT.md` | Supabase to Vercel steps and status |
