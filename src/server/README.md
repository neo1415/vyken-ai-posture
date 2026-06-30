# Server Layer

Server-only code: services, repositories, actions, and auth.

## Belongs here

- `services/` — scoring, signals, recommendations, reports, email
- `repositories/` — database access via Drizzle (Module 3+)
- `actions/` — validated Server Actions
- `auth/` — admin authentication (future)

## Does not belong here

- React components
- Client-side state
- Imports from Client Components

Import `server-only` or keep modules behind server boundaries per `docs/steering/14_ARCHITECTURE.md`.
