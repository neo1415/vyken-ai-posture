# Admin Dashboard — Security Notes

## Temporary admin gate

Module 15 uses `ADMIN_DASHBOARD_KEY` with:

- Timing-safe key comparison on login
- HTTP-only cookie (`vyken_admin_session`) derived via HMAC — raw key is not stored in the cookie
- Cookie scoped to `/admin` path only
- Production fail-closed when key is missing

This is **not** final production authentication. Replace with proper admin auth (e.g. Supabase Auth + `admin_users`) in a future hardening pass.

## No hidden-route security

All admin pages call `requireAdminAccess()` or show `AdminAccessGate`. Unauthorized users see the gate, not lead data.

## Server-only data loading

- Repositories and services use `import "server-only"`
- Client components never import DB or repositories
- Server actions verify admin access before mutations

## Data exposure controls

**Excluded from UI:**

- Raw DB UUIDs (session, lead, report IDs)
- Supabase storage paths and bucket names
- Service role keys and secrets
- Raw assessment answer rows
- Full report context JSON blobs

**Included (minimum necessary for ops):**

- Assessment public token (internal reference; still requires admin gate)
- Lead email and summary fields
- Score, risk, findings/recommendations summaries
- Email event metadata

## No public routes

- No public PDF download route
- No signed URL generation
- PDF presence shown as boolean only

## RLS

No broad public RLS policies added. Admin reads use server-side Postgres connection (service path), not client-side Supabase anon access to private tables.

## Actions safety

- Lead status updates validate enum values
- Email send/resend validates public token format and consent
- Resend uses `force: true` only on explicit admin action
- No bulk email or resend loops

## Future hardening

- Integrate `admin_users` table with real login
- Audit log for admin actions
- Rate-limit admin login attempts
- Remove temporary key gate
