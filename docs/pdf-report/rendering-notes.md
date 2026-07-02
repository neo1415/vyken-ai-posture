# PDF Rendering Notes

## Library

Module 13 uses `@react-pdf/renderer` with `renderToBuffer` for deterministic server-side PDF generation.

Document components live in `src/features/pdf-report/pdf-report-document.tsx`. The renderer wrapper is `src/features/pdf-report/pdf-report-renderer.ts`.

## Page sections

1. Cover (branded)
2. Executive Summary
3. Company Context
4. AI Tool Context
5. Risk Score Summary
6. Category Risk Breakdown (six categories)
7. Key Findings
8. Recommended Next Steps
9. Methodology
10. Limitations and Caveats

Content pages include a fixed header/footer and page numbers.

## Layout choices

- A4 page size
- Helvetica (built-in) — no remote fonts
- Vyken brand colors from the design system
- Simple cards and bullet lists; no charts or remote images

## Known limitations

- Long recommendation step lists may span multiple pages; react-pdf wrap handles overflow but dense content may increase page count
- PNG page render verification uses `pdftoppm` when available; otherwise verification falls back to PDF text extraction
- Local filesystem fallback exists only for development when Supabase upload is unavailable

## Storage (Module 13B)

Production PDFs are stored in private Supabase Storage. See `docs/pdf-report/storage-notes.md`.

## Render verification process

`pnpm verify:module13`:

1. Builds or loads report context
2. Generates a PDF buffer
3. Confirms page count ≥ 2
4. Extracts text and checks expected headings
5. Confirms banned wording and UUIDs are absent
6. Updates the `reports` row (local dev fallback may write under `storage/reports/`)

`pnpm verify:module13b` confirms Supabase upload, private bucket, and approved storage key format.

## Regenerating safely

Call `generatePdfReportForAssessment(publicToken)` again to overwrite the stored PDF and update the same `reports` row. Report context rebuild (Module 12) resets `storage_path` and status to `pending`; PDF generation should be rerun after context rebuild.
