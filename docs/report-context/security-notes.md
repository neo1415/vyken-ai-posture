# Module 12 — Security Notes

## Server-only

- `report-context.service.ts` and `reports.repository.ts` use `import "server-only"`
- No client components or public UI in this module

## No PDF generation

- `storage_path` remains null
- `generated_at` not set for PDF
- Report status stays `pending` (not `generated`)

## No email delivery

- No emails sent
- No `email_events` rows created

## No external APIs

- All data from local DB and in-process engines

## Data minimization

- No raw answer rows in context
- No internal UUIDs in context
- No IP addresses, logs, prompts, or secrets
- Lead email only inside `lead` object

## Careful wording

- Validation blocks banned compliance/audit/certification claims
- Methodology uses "informed by" / "style" language
- Limitations and disclaimers required in appendix

## No broad RLS policies

Uses existing server-only database access pattern.

## Verification

`verify-module12` confirms context build, persistence, idempotency, and absence of PDF/email/CTA events.
