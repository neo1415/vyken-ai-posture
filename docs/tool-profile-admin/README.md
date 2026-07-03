# Tool Profile Admin (Module 16)

Internal admin interface for managing AI tool profiles used by tool selection, scoring, reports, and the admin dashboard.

## Routes

| Route                          | Purpose                                             |
| ------------------------------ | --------------------------------------------------- |
| `/admin/tools`                 | Tool list with search and filters                   |
| `/admin/tools/new`             | Create a new tool with initial draft profile        |
| `/admin/tools/[toolSlug]`      | Tool detail, version history, publish/unpublish     |
| `/admin/tools/[toolSlug]/edit` | Edit tool metadata and profile fields (saves draft) |

URLs use `toolSlug`, not internal database IDs.

## Access

Reuses the Module 15 admin gate (`ADMIN_DASHBOARD_KEY` + HTTP-only session cookie scoped to `/admin`). All routes and server actions call `requireAdminAccess()`.

See [security-notes.md](./security-notes.md).

## List behavior

- Columns: name, slug, category, tool status, published status, confidence, version, updated date
- Filters: search (name/slug), category, tool status, confidence
- Default sort: active tools first, then alphabetical
- Pagination: default 25, max 100

## Detail behavior

- Tool basics (name, slug, category, status, website, dates)
- Published profile fields used by scoring/reporting
- Draft profile with publish action when present
- Version history table
- Public impact notice

## Create / edit / publish

1. **Create** — inserts `ai_tools` row + draft profile version `1.0`
2. **Edit** — updates tool row; updates existing draft or creates a new draft from published (version bump)
3. **Publish** — archives current published version, sets draft to `published`
4. **Unpublish** — archives current published version (tool may have no published profile afterward)

Structured form fields only — no raw JSON editor.

## Versioning

See [versioning-notes.md](./versioning-notes.md).

## Audit logging

`audit_logs` records: `tool_created`, `profile_draft_created`, `profile_draft_updated`, `profile_published`, `profile_unpublished` with slug/version metadata only.

## Public assessment impact

Public `/ai-risk-assessment/tools` reads **published** profiles for **active** tools only. Draft and archived versions are excluded. Completed assessment snapshots are not rewritten.

## Not built yet

- CTA / event tracking (Module 17)
- Analytics dashboard
- Bulk import / CSV upload
- External AI or API enrichment
- Public tool profile editor
- Structured sources JSON editor (sources stored as `[]` on admin-created profiles)
- Rich text editors

## Verification

```bash
pnpm verify:module16
```

Requires database access and `ADMIN_DASHBOARD_KEY` in `.env.local` (dev fallback available).
