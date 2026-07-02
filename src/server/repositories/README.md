# Repositories

Data access layer between services and the database.

## Boundary

Read `database-boundary.ts` before implementing repositories.

## Rules

- Repositories import `getDb()` from `@/lib/db` only.
- No repository imports in UI components.
- Validate input in services before repository calls.
- Hash tokens at rest in report/session modules.
- Normalize email to lowercase in lead repository (Module 11).

## Planned repositories (future modules)

| Repository                     | Module |
| ------------------------------ | ------ |
| `assessmentSessionsRepository` | 5      |
| `companyProfilesRepository`    | 5      |
| `assessmentRepository`         | 7      |
| `toolProfilesRepository`       | 4      |
| `toolSelectionRepository`      | 6      |
| `assessmentAnswersRepository`  | 7      |
| `leadRepository`               | 11     |
| `reportRepository`             | 12     |
| `adminRepository`              | 15     |

Implementation begins when the corresponding feature module is built.
