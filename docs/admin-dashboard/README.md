# Admin Dashboard (Module 15)

Internal dashboard for reviewing assessment leads, scores, reports, and email delivery status.

## Routes

| Route                        | Purpose                                                     |
| ---------------------------- | ----------------------------------------------------------- |
| `/admin`                     | Access gate; redirects to `/admin/leads` when authenticated |
| `/admin/leads`               | Lead list with search and filters                           |
| `/admin/leads/[publicToken]` | Lead detail using assessment public token (not DB UUID)     |

## Access

Temporary gate via `ADMIN_DASHBOARD_KEY`:

1. Visit `/admin` and submit the key (sets HTTP-only cookie scoped to `/admin`).
2. Cookie session lasts 8 hours.
3. Production fails closed if `ADMIN_DASHBOARD_KEY` is unset.

See [security-notes.md](./security-notes.md) for limitations and future auth hardening.

## Data shown

- Lead contact summary, consent, status, follow-up interest
- Assessment company profile, score, risk, confidence, category scores
- Selected tools (names only)
- Top findings and recommendations (summaries)
- Report generation status and PDF stored flag (no storage path)
- Email event history (type, recipient, status, provider, timestamps, safe errors)

## Admin actions

- Update lead status (`new`, `contacted`, `qualified`, etc.)
- Send report email (first send via Module 14 service)
- Resend report email (`force: true`)

## Email integration

Uses `sendAssessmentReportEmail()` from Module 14. Delivery state is read from `email_events`; `reports.status` remains generation-focused.

## Limitations

- Temporary key-based gate — not production-grade auth
- No bulk actions, CRM, analytics, or tool profile editing (Module 16)
- No CTA tracking (Module 17)
- No public PDF download or signed URLs
- No admin notes UI (schema exists; deferred)

## Verification

```bash
pnpm verify:module15
```

Requires `ADMIN_DASHBOARD_KEY` in `.env.local` for access checks.
