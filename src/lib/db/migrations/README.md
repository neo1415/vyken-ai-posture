# Drizzle migrations

Generated SQL migrations live in the parent `drizzle/` directory (sibling to this folder).

## Commands

```bash
# Generate migration from schema changes (requires DATABASE_URL in .env.local)
pnpm db:generate

# Fresh database setup (run in order)
pnpm db:migrate
pnpm db:rls
pnpm db:seed

# Or: pnpm db:setup
```

`pnpm db:rls` applies `drizzle/rls/001_enable_rls.sql`. Do not skip after migrate.

## Rules

- Schema source of truth: `src/lib/db/schema/`
- Do not edit applied migration files — create new migrations for changes.
- Do not use `drizzle-kit push` as the production migration strategy.
- Review generated SQL before applying to production.

## RLS

Row Level Security SQL is maintained separately in `drizzle/rls/` and documented in `docs/database/rls-policy-plan.md`.
