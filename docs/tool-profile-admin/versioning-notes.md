# Tool Profile Admin — Versioning Notes

## Schema

`ai_tool_profile_versions` stores multiple rows per tool with:

- `profile_version` — label such as `1.0`, `1.1`
- `published_status` — `draft` | `published` | `archived`

## Draft vs published

| Status | Public tool selection | Admin detail |
| ------ | --------------------- | ------------ |
| `draft` | Hidden | Shown as draft with publish action |
| `published` | Used when tool is active | Shown as published profile |
| `archived` | Hidden | Listed in version history |

## Edit flow

1. If a **draft** exists → update draft in place (same version label).
2. If only a **published** profile exists → create a **new draft** with bumped version (e.g. `1.0` → `1.1`).
3. Published profile remains unchanged until the new draft is published.

## Publish flow

In a transaction:

1. Archive any current `published` row for the tool.
2. Set the target draft to `published`.

## Unpublish flow

Archives the current `published` row. The tool may temporarily have no published profile.

## Assessment snapshots

When a user completes an assessment, `assessment_selected_tools` stores the `tool_profile_version_id` at selection time. Admin publish/unpublish does **not** update completed sessions or regenerate PDFs.

## Seed data

Seeded tools ship with published profiles. Admin edits follow the same versioning rules without mutating archived historical rows in place.
