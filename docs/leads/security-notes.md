# Module 11 — Security Notes

## Data minimization

- Required: work email + consent only
- Optional: name, company, role, follow-up interest
- Not collected: phone, address, passwords, documents, budget, raw prompts, sensitive business data

## Server-side validation

- All inputs validated with Zod in `src/features/leads/validation.ts`
- Server action re-validates before service call
- HTML tags, URLs, and placeholder emails rejected
- Consent must be explicitly `true`

## Server-only persistence

- `leads.repository.ts` and `lead-capture.service.ts` use `import "server-only"`
- Client form receives only `publicToken` and `leadAlreadyCaptured`
- No DB imports in Client Components

## Consent capture

- Required checkbox with versioned `LEAD_CONSENT_TEXT`
- `consent_to_follow_up` stored as boolean on lead row
- Timestamp implied by `updated_at` on upsert

## No email delivery yet

No emails sent. No `email_events` rows created.

## No report generation yet

No `reports` rows created. No PDF files.

## No CTA/event tracking

No `cta_events` or `lead_events` writes.

## No external APIs

All logic is in-process against the local database.

## No raw DB IDs exposed

Only `publicToken` crosses the server/client boundary for this feature.

## No broad RLS policies

Uses existing Module 3 server-only database access. No new public policies.

## Verification

`verify-module11` confirms form presence, lead persistence, deduplication, validation rejects, and absence of reports/email/CTA events.
