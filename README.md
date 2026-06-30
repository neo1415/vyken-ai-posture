# Vyken AI Risk Assessment Hub

Framework-informed AI governance and security assessment for workplace AI tools. This repository contains the MVP for a public lead-generating assessment that produces instant risk summaries and branded PDF reports.

**Status:** Module 1 foundation — placeholder routes only. Product features are built module-by-module.

## Steering documents

Before implementing any module, read:

- [`docs/README.md`](./docs/README.md) — how to use steering docs
- [`docs/steering/`](./docs/steering/) — architecture, security, scoring, and workflow rules

Every implementation must follow the plan → implement → self-review → external review workflow in `docs/steering/21_CURSOR_WORKFLOW.md`.

**Do not build features outside the current module PRD.**

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) (preferred; no other lockfile in this repo)

## Setup

1. Clone the repository.
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Copy environment template:

   ```bash
   cp .env.example .env.local
   ```

4. Set required variables in `.env.local`:

   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script              | Description                     |
| ------------------- | ------------------------------- |
| `pnpm dev`          | Start Next.js dev server        |
| `pnpm build`        | Production build                |
| `pnpm start`        | Start production server         |
| `pnpm lint`         | Run ESLint                      |
| `pnpm typecheck`    | Run TypeScript without emit     |
| `pnpm format`       | Format with Prettier            |
| `pnpm format:check` | Check formatting                |
| `pnpm check`        | typecheck + lint + format:check |

## Environment variables

### Required

| Variable              | Scope  | Description                                      |
| --------------------- | ------ | ------------------------------------------------ |
| `NODE_ENV`            | System | Set automatically by Next.js                     |
| `NEXT_PUBLIC_APP_URL` | Public | Canonical app URL (e.g. `http://localhost:3000`) |

### Optional (future modules)

See [`.env.example`](./.env.example) for Supabase, database, email, report storage, and CTA URLs. These are **not required** for local development in Module 1.

### Security rules

- Never commit `.env.local` or secrets.
- `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, and email API keys are **server-only** — import via `src/lib/config/env.server.ts` only.
- Do not import server env or secrets in Client Components.

## Routes (Module 1 placeholders)

| Path                  | Purpose                               |
| --------------------- | ------------------------------------- |
| `/`                   | Public home shell                     |
| `/ai-risk-assessment` | Assessment placeholder                |
| `/admin`              | Admin placeholder (not authenticated) |
| `/api/health`         | Minimal health check                  |

## Project structure

```text
src/
  app/           # Next.js App Router routes
  components/    # Shared UI and layout components
  features/      # Feature modules (future)
  lib/           # Config, constants, utilities
  server/        # Server services and repositories (future)
docs/
  steering/      # Implementation rulebook
```

## Security notes

- Admin routes are **not protected** until the admin auth module.
- Health endpoint returns only `ok`, `service`, and `environment` — no secrets.
- OWASP ASVS-informed practices are documented in `docs/steering/15_SECURITY_STANDARD.md`.

## License

Private — Vyken Security assessment project.
