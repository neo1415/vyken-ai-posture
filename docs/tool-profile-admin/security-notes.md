# Tool Profile Admin — Security Notes

## Admin gate reuse

Module 16 does **not** introduce a second auth system. All `/admin/tools` pages and `tool-admin` server actions use `requireAdminAccess()` from Module 15.

- Admin key is never logged
- Service role keys are never exposed in UI or view models
- Cookie is HTTP-only, scoped to `/admin`, 8-hour session

## No public profile editing

Tool profile create/edit/publish routes exist only under `/admin/tools`. The public assessment flow is read-only for tool profiles.

## No raw IDs in UI

View models expose `slug` and `versionLabel` only. Internal UUIDs stay in repositories.

## Validation

- Zod schemas for slugs, enums, text length, URLs, and script-tag rejection
- Structured profile fields — not arbitrary JSON from the client
- Category must match existing `ai_tool_categories.slug`

## No broad RLS

Admin access is enforced in server code, not via new permissive RLS policies on tool tables.

## No external enrichment

No web scraping, vendor APIs, or AI-generated profile content in admin forms.

## Publishing impact

Publishing changes what **future** assessments read. Historical `assessment_selected_tools.tool_profile_version_id` references are preserved; old reports are not regenerated automatically.

## Deferred hardening

- Production-grade auth (SSO, roles) replaces the temporary key gate in a future module
- Structured `sources` JSONB editor with URL validation
