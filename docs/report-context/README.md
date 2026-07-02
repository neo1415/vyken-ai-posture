# Report Context (Module 12)

Module 12 builds a structured, validated report context snapshot for completed assessments.

## What it does

1. Loads completed assessment data (company, tools, scores, findings, recommendations, optional lead).
2. Builds a deterministic `ReportContext` object via a pure builder.
3. Validates wording, structure, and data minimization rules.
4. Persists the snapshot to `reports.report_context` (status `pending`).
5. Upserts by assessment session — no duplicate report rows.

## Inputs

- Public session token
- Existing Module 8 scoring result
- Existing Module 9 recommendation result
- Company profile and tool selections (repository)
- Optional lead (Module 11)

## Outputs

- `ReportContext` JSON (`report-context-v1`)
- Section map for Module 13 PDF rendering
- `reports` row with `status: pending`, no PDF path

## What is intentionally not included

- PDF generation (Module 13)
- Email delivery (Module 14)
- Admin UI (Module 15)
- Public download links
- Raw answer rows or DB UUIDs

## Handoff

- **Module 13** — PDF generation from `ReportContext` + section map
