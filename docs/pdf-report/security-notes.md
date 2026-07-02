# PDF Report Security Notes

## Server-side generation only

PDF generation runs exclusively on the server via `pdf-report.service.ts` and `@react-pdf/renderer`. Client Components must not generate PDFs or import database/repository modules.

## Server-side Supabase upload only

Report PDFs are uploaded with the **service role key** on the server only via `src/server/storage/supabase-report-storage.ts`. Client Components must not upload PDFs or import Supabase service credentials.

## Private bucket

PDFs are stored in a private Supabase Storage bucket (default: `assessment-reports`). Buckets must not be made public. Verification rejects public buckets.

## No public download route

No public unauthenticated download endpoint exists. PDF storage keys are persisted in `reports.storage_path` and are not exposed as public URLs in this module.

## No signed URLs in this module

Module 13B returns storage keys only. Signed URLs are deferred to Module 14 if the email delivery strategy requires them.

## No email sending

This module does not send email, create email events, or set delivery status. Email attachment delivery is Module 14.

## External APIs

PDF rendering is deterministic and local. Supabase Storage is the only external service used for persistence in Module 13B.

## Data minimization

The PDF excludes:

- Raw answer rows
- Internal UUIDs
- Lead email in the PDF body (lead metadata remains in DB/context for delivery/admin use)
- IP addresses, logs, prompts, uploaded files, secrets, admin notes
- Email/CTA/lead event data

## Wording safety

PDF validation scans visible text for banned positive compliance/audit/certification claims before rendering.

## Storage path safety

- Storage keys are derived from validated assessment session UUIDs only
- Format: `reports/{assessmentSessionId}/ai-governance-risk-report.pdf`
- Path traversal (`..`) is rejected
- User-controlled file paths are not accepted
- Storage keys must not appear in public UI

## Credentials

- `SUPABASE_SERVICE_ROLE_KEY` must never appear in client bundles (`src/app`, `src/features`, `src/components`)
- Import service credentials only from `src/lib/config/env.server.ts` or server-only storage helpers

## RLS

No broad public storage or RLS policies were added for PDF access in this module. Report loading continues through existing server-side repositories and service-role storage access.
