# 14 — Architecture

## Purpose

Define application architecture, folder structure, server/client boundaries, and file size discipline.

## What it controls

- Project layout
- Where business logic lives
- Service/repository patterns
- Module implementation structure

## Architecture principles

| Principle | Rule |
|-----------|------|
| Next.js App Router | Primary framework; app directory routing |
| Server Components default | Fetch and render static content on server |
| Client Components for interactivity | Wizard UI, selectors, steppers only where needed |
| Pages orchestrate | Route files compose features; no business logic |
| Scoring server-side | `src/server/scoring/` — single source of truth |
| Report generation server-side | `src/server/reports/` |
| Admin protection server-side | Middleware + server session checks |
| Data access via services | `src/server/repositories/` or `src/lib/db/` |
| Data-driven questions | `src/features/assessment/questions/` |
| Data-driven recommendations | `src/features/recommendations/` |
| No duplicated scoring | One scoring service; tests lock behavior |
| No giant page files | Split into feature components |
| No magic strings | Constants and enums in shared modules |

## Suggested folder structure

```text
src/
  app/                    # Routes, layouts, route handlers
    (public)/             # Landing, assessment, results
    (admin)/              # Admin dashboard (protected)
    api/                  # Route handlers if needed
  components/
    ui/                   # Primitives: Button, Card, RiskChip, etc.
    layout/               # Header, footer, shells
  features/
    assessment/           # Wizard, question rendering
    tools/                # Tool selector, ToolCard
    results/              # Result summary
    admin/                # Lead table, tool admin
    reports/              # Report preview types (not generation logic)
  lib/
    constants/
    utils/
    validation/           # Zod schemas
  server/
    actions/              # Server Actions
    services/             # scoring, signals, recommendations, email
    repositories/         # Database access
    auth/                 # Admin auth
docs/
  steering/               # This directory
```

## Server vs client boundary

| Layer | Server | Client |
|-------|--------|--------|
| Scoring | ✓ | ✗ |
| Signal extraction | ✓ | ✗ |
| Report PDF generation | ✓ | ✗ |
| Database writes | ✓ | ✗ |
| Admin auth | ✓ | ✗ (session cookie only) |
| Wizard navigation UI | | ✓ |
| Tool search/filter UI | | ✓ |
| Form interactivity | | ✓ |

Client may hold **draft answers** in state or session storage for UX; **final submission** always validated and processed on server.

## Request flow (assessment completion)

```
Client wizard → Server Action (validate answers)
  → Repository persist answers
  → Signal service
  → Scoring service
  → Recommendation service
  → Findings builder
  → Return result summary to client
Email step → Server Action → Report service → Email service → Lead notification
```

## Maximum file size guidance

| File type | Target | Hard limit |
|-----------|--------|------------|
| Page (`page.tsx`) | < 250 lines | 300 lines requires justification in module report |
| Component | < 250 lines | 300 lines requires justification |
| Service | Split by domain | May exceed 250 if logically grouped; no 500+ monoliths |

Files over 300 lines require explicit reason in implementation summary.

## Do / Do not

**Do:**
- Colocate feature-specific components under `features/`.
- Export typed interfaces from `lib/` or feature `types.ts`.
- Use Server Actions for mutations with Zod validation.

**Do not:**
- Import server-only modules into Client Components.
- Put SQL in React components.
- Create `utils.ts` dumping grounds — split by domain.

## Acceptance criteria

- New modules follow folder structure.
- No page file exceeds 300 lines without documented exception.
- Scoring exists in exactly one service path.

## Related documents

- [15_SECURITY_STANDARD.md](./15_SECURITY_STANDARD.md)
- [17_COMPONENT_RULES.md](./17_COMPONENT_RULES.md)
- [18_AI_AGENT_RULES.md](./18_AI_AGENT_RULES.md)

## References

- [Next.js data security](https://nextjs.org/docs/app/guides/data-security)
- [Next.js authentication](https://nextjs.org/docs/app/guides/authentication)
- [Drizzle migrations](https://orm.drizzle.team/docs/migrations)
