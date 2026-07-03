# Admin Auth Security Notes

## Authentication

- Supabase Auth handles login/session via HTTP-only cookies (`sb-access-token`, `sb-refresh-token`).
- Service role key is server-only and used for storage operations — never for user login.
- Middleware redirects unauthenticated `/admin/*` requests to `/admin/login` when auth cookies are absent.
- Server pages and server actions still perform full auth + RBAC checks (middleware is not sufficient alone).

## Authorization

- `admin_users.email` must match the Supabase Auth user email (case-normalized).
- Inactive admins (`is_active = false`) are denied even with a valid Supabase session.
- Authenticated Supabase users without an `admin_users` row are denied with a generic login error.

## RBAC

See [rbac-matrix.md](./rbac-matrix.md). Write actions are blocked at:

- Server actions (`requireManageLeadsAdmin`, etc.)
- Services (`assertPermission` + role helpers)
- UI (buttons hidden for `viewer` role)

## Audit identity

Admin audit events store:

- `audit_logs.actor_admin_user_id` (internal FK — not shown in UI)
- Metadata: `adminEmail`, `adminRole` (safe enums)

Never stored: access tokens, refresh tokens, service role key, admin key, session cookies.

## Legacy key gate

Removed from normal operation. `ALLOW_LEGACY_ADMIN_KEY` defaults to `false`.

## Production requirements

- Configure Supabase Auth env vars.
- Disable legacy key gate.
- Seed `admin_users` for each Supabase Auth admin account.
- Use strong passwords and Supabase Auth policies in the Supabase project.
