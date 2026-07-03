# Email Delivery (Module 14)

Module 14 sends the generated PDF report to the captured lead and an internal notification to Vyken after report generation (Module 13–13B).

## What this module does

- Sends a user report email with the PDF attached (`ai-governance-risk-report.pdf`)
- Sends an internal lead notification email to Vyken
- Records delivery outcomes in `email_events`
- Blocks duplicate user report sends unless `force` is requested
- Requires lead consent before delivery

## Dependencies

- **Module 11** — Lead capture with consent
- **Module 12** — Report context
- **Module 13–13B** — PDF generation and Supabase Storage

## Server entry points

- `src/server/services/email-delivery.service.ts` — `sendAssessmentReportEmail()`, `getEmailDeliveryStatus()`
- `src/server/repositories/email-events.repository.ts` — `email_events` persistence
- `src/features/email-delivery/*` — templates, validation, constants (safe for scripts/tests)

## Email types

| Type                  | Constant                | Recipient                              |
| --------------------- | ----------------------- | -------------------------------------- |
| User report           | `user_report`           | Lead work email                        |
| Internal notification | `internal_notification` | `VYKEN_INTERNAL_LEAD_EMAIL` or default |

## What is intentionally not included

- Public PDF download routes or signed URLs on result pages
- CTA click tracking (`cta_events`) — Module 17
- Admin dashboard email resend UI — Module 15
- Retry queues or background workers

## Handoff

- **Module 15** — Admin dashboard may surface delivery status from `email_events`
- **Module 17** — CTA and booking click tracking

## Verification

```bash
pnpm verify:module14
```

See also `docs/email-delivery/security-notes.md` and `docs/email-delivery/provider-notes.md`.
