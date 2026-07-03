# Tool Profile Admin — Security Notes

## Admin authentication (Module 18A)

Module 16/18A use the shared admin auth system. All `/admin/tools` pages and `tool-admin` server actions require:

1. Valid Supabase Auth session
2. Active `admin_users` row
3. Role permission for write actions (`editor` or `superadmin`)

Read-only `viewer` role can list and view tools but cannot create, edit, or publish.

See `docs/admin-auth/security-notes.md`.

## No public profile editing

Tool profile create/edit/publish routes exist only under `/admin/tools`. The public assessment flow is read-only for tool profiles.

## No raw IDs in UI

View models expose `slug` and `versionLabel` only. Internal UUIDs stay in repositories.

## Validation

- Slug format validated server-side
- URLs sanitized for tool profile fields
- Publish/unpublish require explicit server action + permission check

## Service role

Supabase service role is used only for private PDF storage (Module 13B), not for admin login.
