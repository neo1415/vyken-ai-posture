# Database layer (`src/lib/db`)

Server-only Postgres access via Drizzle ORM.

## Files

| Path                   | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `client.ts`            | `getDb()` — lazy singleton, requires `DATABASE_URL` |
| `index.ts`             | Server exports                                      |
| `schema/`              | Drizzle table definitions                           |
| `seeds/seed.ts`        | Categories, tools, and profile versions (Module 4)  |
| `migrations/README.md` | Migration workflow                                  |

## Usage

```typescript
import { getDb, schema } from "@/lib/db";

const db = getDb();
await db.insert(schema.assessmentSessions).values({ ... });
```

## Do not

- Import in Client Components or `components/ui/`
- Log `DATABASE_URL`
- Store confidential documents in JSONB columns
- Skip migrations for schema changes

## Commands

```bash
pnpm db:migrate   # Apply Drizzle migrations
pnpm db:rls       # Apply drizzle/rls/001_enable_rls.sql (required after migrate)
pnpm db:seed      # Seed categories, tools, and profiles
pnpm db:setup     # migrate → rls → seed
```

See `docs/database/README.md` for full setup order.
