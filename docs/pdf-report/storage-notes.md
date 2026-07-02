# PDF Report Storage Notes

## Why local storage was replaced

Module 13 initially wrote PDFs to `storage/reports/` on the server filesystem. That works for local verification but is not safe on ephemeral hosts such as Vercel serverless functions.

Module 13B stores generated PDFs in **private Supabase Storage** using the server-only service role key.

## Bucket

- **Default bucket name:** `assessment-reports`
- **Override:** set `REPORT_STORAGE_BUCKET` in server environment
- **Visibility:** private (must not be public)

### Manual bucket setup

If the bucket does not exist, create it in the Supabase Dashboard:

1. Open **Storage** → **New bucket**
2. Name: `assessment-reports` (or your `REPORT_STORAGE_BUCKET` value)
3. **Public bucket:** off
4. Save

Verification (`pnpm verify:module13b`) checks that the bucket exists and is private.

## Storage key format

```text
reports/{assessmentSessionId}/ai-governance-risk-report.pdf
```

Rules:

- `assessmentSessionId` is server-derived UUID only
- No user-provided filenames
- Path traversal is rejected
- `reports.storage_path` stores this key, not a public URL

## Upload behavior

- Content type: `application/pdf`
- Upsert enabled for safe regeneration
- Upload runs server-side only via `saveReportPdf()` → `saveReportPdfToSupabase()`
- Returns storage key + provider metadata; no signed URL in this module

## Development fallback

When Supabase credentials are missing or upload fails in `NODE_ENV=development`, the app may fall back to local filesystem storage under `storage/reports/`. Production/non-development environments require Supabase Storage.

## Module 14 handoff

Module 14 (email delivery) should:

1. Read `reports.storage_path` for the assessment
2. Download the PDF server-side with the service role client, **or**
3. Create a short-lived signed URL only inside the email pipeline if attachment strategy requires it

Do not expose storage paths or signed URLs on public result pages.

## Environment variables

Server-only (names only):

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REPORT_STORAGE_BUCKET` (optional; defaults to `assessment-reports`)

## Verification

```bash
pnpm verify:module13b
```

Confirms upload, private bucket, storage key format, DB updates, regeneration, and boundary checks (no email/events/public download route).
