# Scoring — Security Notes (Module 8)

## Deterministic scoring only

Scoring is deterministic and computed server-side. No external AI model is called to generate signals or narrative.

## No compliance/audit claims

User-facing copy must avoid:

- Compliance certification language
- Legal conclusions
- Audit completion claims
- Live monitoring or live scanning claims

The scoring output is a framework-informed estimate based on provided answers and curated tool profile information.

## Server-side prerequisite validation

The scoring service verifies:

- Session exists
- Company profile exists
- Tool selections exist
- Assessment answers exist

If prerequisites are missing, scoring fails closed and the results placeholder shows a safe error.

## No raw DB IDs in UI

The results placeholder uses the session public token in the URL and displays only aggregates (score, levels, counts). No internal UUIDs are exposed to the client.

## No recommendations yet

This module does not create `assessment_findings` or `assessment_recommendations`.

## No reports/leads

This module does not create `reports` or `leads` rows.

## No external API calls

Scoring does not call external APIs. It only reads/writes the database server-side.

