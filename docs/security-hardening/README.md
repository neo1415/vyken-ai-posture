# Security Hardening (Module 18B)

## Summary

Module 18B hardens the application after Module 18A replaced the temporary admin key gate with Supabase Auth + RBAC.

## What was hardened

- **Security headers** — X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy, HSTS, CSP
- **CSP** — default-src 'self', frame-ancestors 'none', object-src 'none', base-uri 'self', form-action 'self'
- **Admin auth/RBAC** — reviewed and confirmed enforced at middleware, layout, actions, services
- **Rate limiting** — admin login (5/15min), CTA events (20/min), email send (3/min), lead capture (10/min)
- **Server/client boundaries** — all server modules have `import "server-only"`, no service role key in client bundles
- **Storage** — private bucket assertion, path traversal rejection, no signed/public URLs exposed
- **Email** — provider fails closed in production, consent required, duplicate-send controlled
- **Event metadata** — allowlisted keys, 2KB max, no storage paths/secrets/raw answers
- **Public tokens** — format validation enforced throughout
- **Error handling** — no stack traces, no secrets in user-facing errors
- **RLS** — no broad policies; server-only DB access

## Checks

```bash
pnpm verify:module18b
```

## Deferred

- Redis/Upstash rate limiting (current: in-memory per-instance)
- WAF/DDoS protection (infrastructure level)
- CSP nonce-based script-src (requires Next.js middleware nonce injection)
- Module 19 UX pass
- Module 20 final QA
