# RLS policy plan

Row Level Security baseline for Supabase Postgres.

## Principles

1. **Enable RLS on every application table** — default deny for anon/authenticated roles.
2. **No broad anonymous SELECT** on leads, reports, answers, scores, signals, admin data.
3. **Public submissions** go through server routes using `DATABASE_URL` or service role — not direct anon INSERT with open policies.
4. **Service role bypasses RLS** — keep `SUPABASE_SERVICE_ROLE_KEY` server-only; never in client bundles.
5. **Direct Postgres (`DATABASE_URL`)** bypasses RLS — repositories must enforce authorization in application code until Supabase client paths are added.

## Implementation status (Module 3)

| Action | Status |
|--------|--------|
| RLS enabled on all tables | SQL in `drizzle/rls/001_enable_rls.sql` |
| Anonymous SELECT policies | **Deferred** |
| Anonymous INSERT policies | **Deferred** (server routes only) |
| Admin policies | **Deferred** (auth module) |
| Public read published tools | **Deferred** (Module 4/6) |

## Table-by-table posture

| Table | Anon | Authenticated user | Admin | Server (DATABASE_URL) |
|-------|------|-------------------|-------|------------------------|
| admin_users | deny | deny | read/write (future) | controlled |
| ai_tool_categories | defer public read | defer | write | read/write |
| ai_tools | defer public read active | defer | write | read/write |
| ai_tool_profile_versions | defer published read | defer | write | read/write |
| assessment_sessions | no select | no | read | insert/update via server |
| assessment_company_profiles | no | no | read | server only |
| assessment_selected_tools | no | no | read | server only |
| assessment_answers | no | no | read | server only |
| assessment_scores | no | no | read | server only |
| assessment_risk_signals | no | no | read | server only |
| assessment_findings | no | no | read | server only |
| assessment_recommendations | no | no | read | server only |
| reports | no | no | read | token-validated server |
| leads | no | no | read/write | insert via server |
| lead_events | no | no | read | server only |
| admin_notes | no | no | read/write | admin only |
| unknown_tool_requests | no | no | read/write | insert via server |
| cta_events | no | no | read | insert via server |
| email_events | no | no | read | server only |
| audit_logs | no | no | read | server insert |

## Future public read example (Module 4/6)

Narrow policy only when needed:

```sql
-- Example only — not applied in Module 3
CREATE POLICY "anon_read_active_tools"
ON ai_tools FOR SELECT TO anon
USING (is_active = true);
```

## Forbidden patterns

- `USING (true)` on sensitive tables for anon role
- Anonymous SELECT on `leads`, `reports`, `assessment_answers`, `assessment_scores`
- Client-side service role usage
- Relying on UI hiding without RLS for Supabase client paths

## Applying RLS

After schema migration, run:

```bash
pnpm db:rls
```

This applies `drizzle/rls/001_enable_rls.sql`. It is included in `pnpm db:setup` (migrate → rls → seed).

**psql equivalent:** `psql "$DATABASE_URL" -f drizzle/rls/001_enable_rls.sql`

Policies are added in future modules with explicit PRD review.
