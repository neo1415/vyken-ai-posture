# Tool Selector — Security Notes

## No raw DB IDs in the client

The browser receives only slug-based `AssessmentToolOption` objects. Database IDs and profile version IDs are resolved server-side during persistence.

## Server-side slug verification

Submitted tool slugs are validated with Zod and verified against active published profiles in the database. Invalid or unpublished slugs are rejected.

## Session token handling

- URL uses `public_token` only.
- Token format is validated before DB lookup.
- Session must exist and have a completed company profile.

## No public RLS policies

Writes go through server action → service → repository using the server-only Postgres connection. No broad public read/write RLS policies were added.

## No external lookup

Search and category filters are client-side over preloaded data. Unknown tool names are not enriched via external APIs or scraping.

## Validation limits

- Max 15 known tools
- Max 3 unknown tools
- Unknown name max 80 characters
- Unknown URL max 240 characters, http/https only when provided
- At least one selection required (known, unknown, or not sure)

## No early scoring or lead capture

This module does not create scores, signals, recommendations, reports, leads, or assessment answers.

## Unknown tool requests

Unknown tools create `unknown_tool_requests` for internal review. `requester_email` remains null until lead capture in a later module.
