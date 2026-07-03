# Admin Authentication (Module 18A)

Supabase Auth is the admin authentication source. Authorization is enforced through the `admin_users` table and role-based permissions.

## Flow

1. Admin signs in at `/admin/login` with Supabase Auth email/password.
2. Server stores Supabase session tokens in HTTP-only cookies.
3. Each admin request resolves the Supabase user, then looks up `admin_users` by email.
4. Active admin users receive a role (`viewer`, `editor`, `superadmin`).
5. Routes, server actions, and services enforce permissions.

## Routes

| Route                          | Access                                         |
| ------------------------------ | ---------------------------------------------- |
| `/admin/login`                 | Public                                         |
| `/admin`                       | Redirects to `/admin/leads` when authenticated |
| `/admin/leads`                 | Authenticated admin                            |
| `/admin/tools`                 | Authenticated admin                            |
| `/admin/tools/new`, `.../edit` | `editor` or `superadmin`                       |
| Publish/unpublish tool profile | `editor` or `superadmin`                       |

## Legacy key gate

`ADMIN_DASHBOARD_KEY` and `?admin_key=` are **disabled by default**. They only work when `ALLOW_LEGACY_ADMIN_KEY=true` (development fallback only).

## Seeding the first admin

1. Create a Supabase Auth user (email/password) in the Supabase dashboard or Auth API.
2. Insert a matching row in `admin_users` with the same email and desired role.
3. Sign in at `/admin/login`.

Example SQL (adjust email/role):

```sql
INSERT INTO admin_users (email, full_name, role, is_active)
VALUES ('admin@yourcompany.com', 'Admin User', 'superadmin', true)
ON CONFLICT (email) DO NOTHING;
```

## Environment

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # storage only — not used for user auth
ALLOW_LEGACY_ADMIN_KEY=false
```

## Verification

```bash
pnpm verify:module18a
```

## Not built in Module 18A

- Module 18B security hardening (headers, rate limits, etc.)
- Module 19 UX pass
- Module 20 items
- OAuth providers, MFA, password reset UI
- Admin user management UI
