# Admin Dashboard — Security Notes

## Admin authentication (Module 18A)

Module 18A replaced the temporary `ADMIN_DASHBOARD_KEY` gate with **Supabase Auth** + **`admin_users`** authorization.

- Login: `/admin/login` (email/password via Supabase Auth)
- Session: HTTP-only Supabase token cookies — not the legacy `vyken_admin_session` key cookie
- RBAC: `viewer` (read-only), `editor`, `superadmin` — see `docs/admin-auth/rbac-matrix.md`
- Legacy key gate: disabled unless `ALLOW_LEGACY_ADMIN_KEY=true` (not for production)

## Server-only data loading

- Repositories and services use `import "server-only"`
- Client components never import DB or repositories
- Server actions verify authenticated admin + permissions before mutations

## Data exposure controls

**Excluded from UI:**

- Raw DB UUIDs (session, lead, report IDs)
- Supabase storage paths and bucket names
- Service role keys and secrets
- Supabase auth tokens and session cookies
- Raw assessment answers

**Included safely:**

- Public assessment tokens (designed for sharing)
- Lead email, company name, status enums
- Report/email delivery status labels

## Audit

Admin actions write to `audit_logs` with `actor_admin_user_id` and safe metadata (`adminEmail`, `adminRole`).

## Production checklist

- Set Supabase Auth env vars
- Keep `ALLOW_LEGACY_ADMIN_KEY=false`
- Seed `admin_users` for each Supabase Auth admin account
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the client
