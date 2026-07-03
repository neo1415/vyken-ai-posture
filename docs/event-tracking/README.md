# Event Tracking (Module 17)

Internal event tracking for assessment milestones, CTA clicks, lead follow-up, and admin actions.

## What is recorded

| Table                                  | Purpose                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| `audit_logs` (`anonymous_server_flow`) | Public assessment milestones (started, profile, tools, usage, result viewed) |
| `cta_events`                           | Result-page CTA clicks (schema enum values)                                  |
| `lead_events`                          | Lead capture `report_requested`, admin `status_changed`                      |
| `email_events`                         | Email delivery (Module 14 — not duplicated)                                  |
| `audit_logs` (`admin`)                 | Admin lead view, status update, email send/resend                            |

## CTA placement

Results page follow-up block (after caveats, before lead capture):

- **Request follow-up** — records `request_review_clicked`, scrolls to lead form
- **Email my report** — after lead + consent; uses Module 14 email service
- **Talk to Vyken about AI governance controls** — records `vyken_guard_clicked`

## Failure behavior

Public tracking fails soft — assessment, lead capture, and results still work if an insert fails.

Admin actions complete even if audit logging fails.

## What is not tracked

- Third-party analytics, pixels, fingerprinting
- Raw assessment answers or report context JSON
- Storage paths, service keys, admin keys
- Marketing automation / CRM sync

## Verification

```bash
pnpm verify:module17
```

See [event-taxonomy.md](./event-taxonomy.md) and [security-notes.md](./security-notes.md).
