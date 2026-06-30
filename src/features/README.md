# Features

Feature modules contain domain-specific UI and types. Pages in `src/app/` orchestrate features — they do not hold business logic.

## Belongs here

- Assessment wizard UI
- Tool selector
- Results summary
- Admin lead views
- Report preview types

## Does not belong here

- Database access (use `src/server/repositories/`)
- Scoring or signal logic (use `src/server/services/`)
- Global layout shells (use `src/components/layout/`)
