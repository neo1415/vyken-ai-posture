# 15 — Security Standard

## Purpose

Define mandatory security requirements for the Vyken AI Risk Assessment Hub aligned with OWASP ASVS principles and project-specific threats.

## What it controls

- Input validation patterns
- Authentication and authorization
- Data protection
- Report/email safety
- AI agent pitfalls to avoid

## Core requirements

### Input and validation

- Validate **all** input server-side with Zod or equivalent.
- Reject unexpected fields on API payloads (allowlist schemas).
- Sanitize/escape user-provided text in PDFs, emails, and admin UI.
- Rate-limit public assessment submissions (per IP/session).
- Bot/spam protection on public forms (honeypot, Turnstile, or similar).

### Scoring and business logic

- **Do not trust client-submitted scores** or signals.
- Recompute signals and scores on server for every final submission.
- Never expose scoring algorithms via client bundles as authoritative.

### Authentication and authorization

- Admin authentication required for dashboard.
- **Server-side** admin authorization on every admin route and action.
- Role checks in service layer, not UI-only.
- Session tokens HTTP-only, secure, SameSite appropriate.

### Database and Supabase

- Enable **RLS** on all protected tables.
- **Never** expose service role key in browser or client bundles.
- Use server-only database client for writes and sensitive reads.
- Do not rely on UI hiding for authorization.

### Report and file access

- **No raw predictable report URLs** (e.g., `/reports/123`).
- Protect report access with cryptographically secure tokens (hashed at rest).
- Token expiration and single-purpose scope.
- Prevent **IDOR** on sessions, leads, reports — verify ownership server-side.

### Data minimization

- Avoid storing confidential user data.
- Do not ask users to upload confidential documents.
- Minimize PII: work email, company name, role — no unnecessary fields.
- No sensitive data in client logs, error reports, or analytics.

### Dependencies and configuration

- Review dependencies before adding packages (license, maintenance, attack surface).
- Environment variables for secrets; **no secrets in repo**.
- Separate dev/staging/prod credentials.
- `.env.example` documents required vars without values.

### Admin audit

- Log admin actions to `audit_logs` (view lead, export, edit tool, add note).
- Include actor, action, target, timestamp.

## OWASP ASVS alignment (selected)

| Area | Requirement |
|------|-------------|
| V5 Input validation | Server-side validation on all inputs |
| V4 Access control | Server-side authz; RLS; no IDOR |
| V7 Error handling | No stack traces to users; no secrets in errors |
| V8 Data protection | Minimize PII; encrypt in transit (HTTPS) |
| V10 Malicious code | Dependency review |
| V13 API | Rate limits; authenticated admin endpoints |

## AI-agent security pitfalls

Agents frequently make these mistakes — **forbidden**:

| Pitfall | Correct approach |
|---------|-------------------|
| Auth only in UI | Middleware + server action checks |
| Exposed service keys | Server-only env vars |
| Client-side score as truth | Server scoring service |
| Missing RLS | RLS on all tables from Module 3 |
| Unsafe admin routes | Protected layout + server verification |
| Unvalidated request payloads | Zod schemas on every action |
| Report ID guessing | Unguessable tokens |
| XSS in PDF/email | Escape HTML; sanitize user strings |
| Excessive dependencies | Justify each addition |
| Abandoned generated code | Remove unused files; no dead routes |

## Do / Do not

**Do:**
- Fail closed on auth errors.
- Use parameterized queries via Drizzle (no raw string SQL with user input).
- Hash tokens and secrets at rest.

**Do not:**
- Log full request bodies containing email in production.
- Disable RLS "temporarily" in production.
- Return different error messages that confirm resource existence to unauthenticated users (careful enumeration).

## Acceptance criteria

- Security checklist in `19_CODE_REVIEW_CHECKLIST.md` passes for each module.
- No service role key in client bundle (verify with build inspection).
- Public endpoints rate-limited before production.

## Related documents

- [13_DATABASE_SCHEMA_PLAN.md](./13_DATABASE_SCHEMA_PLAN.md)
- [14_ARCHITECTURE.md](./14_ARCHITECTURE.md)
- [18_AI_AGENT_RULES.md](./18_AI_AGENT_RULES.md)
- [19_CODE_REVIEW_CHECKLIST.md](./19_CODE_REVIEW_CHECKLIST.md)

## References

- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Next.js data security](https://nextjs.org/docs/app/guides/data-security)
