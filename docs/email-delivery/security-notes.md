# Module 14 — Security Notes

## Server-only delivery pipeline

- `email-delivery.service.ts`, `email-events.repository.ts`, and `get-email-provider.ts` use `import "server-only"`
- Client Components must not send email or import email repositories
- Verification scripts duplicate delivery logic inline and use `DevEmailProvider` only

## Consent gate

- `consent_to_follow_up` must be `true` on the lead row before send
- Validated in `validateConsentForDelivery()` before any provider call

## Lead required

- No email is sent without a captured lead linked to the assessment session
- Lead email validated with `validateLeadEmailForDelivery()`

## Duplicate send protection

- A successful `user_report` event with `status = sent` blocks repeat sends
- Use `{ force: true }` only for explicit admin/resend flows (Module 15+)

## Data minimization in user email

User report email must **not** include:

- Storage paths (`storage/reports`, bucket names, Supabase keys)
- Raw database UUIDs
- Public or signed download URLs
- Banned compliance/audit/certification claims

Validation runs in `src/features/email-delivery/validation.ts` before send.

## PDF attachment safety

- Attachment filename is fixed: `ai-governance-risk-report.pdf`
- Buffer validated as `%PDF-` before attach
- PDF downloaded server-side from private Supabase Storage — never from client paths

## No public download route

Module 14 delivers PDFs as email attachments only. No unauthenticated download endpoint is added.

## Token validation

- Public assessment token format validated before session lookup
- Invalid tokens reject delivery without leaking session existence details

## No CTA events

Email delivery does not write `cta_events`. CTA tracking is Module 17.

## Credentials

- Email provider API keys (`RESEND_API_KEY`, etc.) are server-only
- `SUPABASE_SERVICE_ROLE_KEY` used only for PDF download in the delivery pipeline
- Service role key must not appear in client bundle paths

## Verification

`pnpm verify:module14` confirms consent gates, duplicate blocking, content validation, email events, and absence of public download routes.
