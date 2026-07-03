# Security Review (Module 18B)

## Environment / Secrets

- `.env.example` contains variable names only — no secrets
- `SUPABASE_SERVICE_ROLE_KEY` only in `env.server.ts` and `server-client.ts` (both server-only)
- `RESEND_API_KEY` only in `env.server.ts` and `get-email-provider.ts` (server-only)
- `ADMIN_DASHBOARD_KEY` legacy — disabled by default (`ALLOW_LEGACY_ADMIN_KEY=false`)
- `NEXT_PUBLIC_*` exposes only Supabase URL and anon key (safe — designed for client)
- No secrets in docs, seeds, or defaults

## Admin Auth / RBAC

- Supabase Auth session required (HTTP-only cookies)
- `admin_users` lookup required (email match, `is_active`)
- RBAC: `viewer` read-only, `editor` writes, `superadmin` full
- Middleware redirects unauthenticated; server pages/actions re-validate
- Legacy key gate disabled unless explicit env flag
- Login rate-limited (5/15min per email)

## Public Token Handling

- Format: 32–64 chars base64url validated by `isValidPublicTokenFormat`
- Validated at every entry point (services, actions, event tracking)
- Not treated as authorization for PDF download or storage access
- No storage paths derived from client-provided tokens without validation

## Storage Security

- Bucket verified private via `assertPrivateReportBucket`
- No `getPublicUrl` or `createSignedUrl` used
- Storage path format-validated against traversal (`..` rejected)
- PDF download is server-side only — never returned to client URL
- Storage paths never rendered in UI, email body, or event metadata

## Email Security

- Provider keys server-only
- `DevEmailProvider` only in non-production
- Production fails closed without configured provider
- PDF attachment loaded server-side, never via public URL
- Consent required for lead email delivery
- Duplicate-send controlled (`already_sent` outcome)
- Internal notification does not expose raw answers or storage paths
- No tracking pixels or external images in templates

## Event Metadata Privacy

- 10 allowlisted metadata keys (no arbitrary keys accepted)
- 2KB max size enforced via `assertMetadataSize`
- Script tag patterns rejected
- No raw answers, report context, storage paths, or service keys in metadata
- `audit_logs` admin events include safe `adminEmail`/`adminRole` only
- Public milestone events use `anonymous_server_flow` actor type

## Database / RLS

- All app writes through server-side Drizzle DB
- No client-side Supabase DB access
- RLS enabled on tables; no broad `FOR ALL` or `USING (true)` policies
- Direct DB connection string is server-only
- Verify scripts use `createScriptDb` (separate from app DB)

## Server/Client Boundaries

- All repositories: `import "server-only"`
- All services: `import "server-only"`
- `env.server.ts`, `auth-server.ts`, `server-client.ts`: `import "server-only"`
- Client components never import DB, repositories, or server config
- `SUPABASE_SERVICE_ROLE_KEY` not importable from client bundles

## Error Handling

- No stack traces in UI (all caught → safe message)
- No secrets in error responses
- Tracking failures fail soft (public flow continues)
- Admin errors return generic "access denied" messages
- Email provider errors wrapped in service error class
- Security-related failures (invalid session, RBAC) fail closed
