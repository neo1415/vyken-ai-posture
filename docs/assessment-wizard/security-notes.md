# Assessment Wizard — Security Notes

## No scoring in this module

Answers are stored only. No `assessment_scores`, `assessment_risk_signals`, findings, or recommendations are created.

## Server-side validation

All answers are validated with Zod and question schema rules. Unknown question IDs and option values are rejected.

## Conditional logic rechecked server-side

Agentic section requirement is computed on the server from tool context and submitted answers. Client visibility is not trusted.

## No arbitrary freeform input

Only controlled single-select and multi-select values are accepted. No text fields or document uploads.

## No DB IDs in client

The wizard receives `sessionToken` (public token) and safe `SelectedToolContext` only.

## No sensitive document collection

Questions ask about categories of data exposure, not actual file contents, prompts, or secrets.

## Session prerequisites

Server verifies session exists, company profile exists, and tool selections exist before rendering or saving.

## No public RLS policies

Writes use server-only Postgres access via repository layer.
