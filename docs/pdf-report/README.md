# PDF Report Generation (Module 13)

Module 13 generates a branded PDF report from the validated `report-context-v1` object persisted by Module 12.

## What this module generates

- Server-side PDF buffer using `@react-pdf/renderer`
- Local development storage under `storage/reports/{assessmentSessionId}.pdf`
- Updates to the existing `reports` row: `storage_path`, `status = generated`, `generated_at`

## Where PDF content comes from

All visible PDF content is sourced from `ReportContext` built in Module 12:

- Cover, executive summary, company context, AI tool context
- Risk score summary and six category breakdowns
- Key findings and recommended next steps
- Methodology and limitations/caveats

No AI-generated text, no raw answer rows, and no raw database UUIDs are included.

## Storage behavior

- **Production:** private Supabase Storage bucket (default `assessment-reports`)
- **Storage key:** `reports/{assessmentSessionId}/ai-governance-risk-report.pdf`
- **Development fallback:** local `storage/reports/` when Supabase upload is unavailable

See `docs/pdf-report/storage-notes.md` for bucket setup and Module 14 handoff.

## What is not built yet

- Email delivery (Module 14)
- Public download routes or signed URLs for users
- Admin dashboard PDF management (Module 15)
- Analytics or CTA/event tracking
- External PDF APIs or browser automation

## Handoff to email delivery

Module 14 will call `generatePdfReportForAssessment(publicToken)` or read the stored PDF path from the `reports` table to attach the report to outbound email. Module 13 intentionally does not send email or create email events.

## Verification

Run:

```bash
pnpm verify:module13
```

See also `docs/pdf-report/rendering-notes.md` and `docs/pdf-report/security-notes.md`.
