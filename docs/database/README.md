# Database

PostgreSQL database layer for the Vyken AI Risk Assessment Hub.

## Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Database   | Supabase Postgres (or any Postgres 14+) |
| ORM        | Drizzle ORM                             |
| Driver     | `postgres` (server-only)                |
| Migrations | Drizzle Kit → `drizzle/`                |
| RLS        | SQL in `drizzle/rls/` via `pnpm db:rls` |

Supabase JS client packages are **deferred** to the admin auth module. This module uses direct Postgres via `DATABASE_URL`.

## Layout

```text
src/lib/db/
  client.ts          # Server-only getDb()
  index.ts           # Public server exports
  schema/            # Drizzle table definitions (source of truth)
  scripts/           # apply-rls.ts
  seeds/             # Category seed (Module 3)
  migrations/        # README pointer to drizzle/
drizzle/             # Generated SQL migrations
drizzle/rls/         # RLS enable SQL (applied via pnpm db:rls)
docs/database/       # Schema and RLS documentation
```

## Environment

| Variable       | Scope       | Required for                      |
| -------------- | ----------- | --------------------------------- |
| `DATABASE_URL` | Server-only | Migrations, RLS, seeds, `getDb()` |

Never create `NEXT_PUBLIC_DATABASE_URL`. Never import `getDb()` in Client Components.

Copy `.env.example` to `.env.local` and set `DATABASE_URL` before database commands.

## Local setup order

Run in this order after schema changes or on a fresh database:

```bash
pnpm db:migrate
pnpm db:rls
pnpm db:seed
```

Or run all three in sequence:

```bash
pnpm db:setup
```

`pnpm db:rls` applies `drizzle/rls/001_enable_rls.sql` (enables RLS on all app tables). Do not skip this step after migrate.

**psql equivalent** (if you prefer the CLI and have `psql` on PATH):

```bash
psql "$DATABASE_URL" -f drizzle/rls/001_enable_rls.sql
```

## Commands

```bash
pnpm db:generate   # Generate migration from schema (needs DATABASE_URL)
pnpm db:migrate    # Apply Drizzle SQL migrations
pnpm db:rls        # Apply RLS baseline (drizzle/rls/001_enable_rls.sql)
pnpm db:seed       # Seed tool categories only
pnpm db:setup      # migrate → rls → seed
pnpm db:check      # Validate schema vs migrations
pnpm db:studio     # Drizzle Studio (dev only)
```

## Security warnings

- `DATABASE_URL` bypasses RLS when using direct Postgres — application code must enforce authorization in repositories/services.
- When using Supabase anon key later, RLS policies must be narrow; never use `USING (true)` on sensitive tables.
- `SUPABASE_SERVICE_ROLE_KEY` must never reach the browser.
- Store `ip_hash` not raw IPs; no confidential document storage.

## Related docs

- [schema-overview.md](./schema-overview.md)
- [rls-policy-plan.md](./rls-policy-plan.md)
- Steering: `docs/steering/13_DATABASE_SCHEMA_PLAN.md`
