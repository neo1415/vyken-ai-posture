# Security Headers and CSP

## Active Headers

Applied via `next.config.ts` (all routes) and `src/middleware.ts` (runtime responses):

| Header | Value |
|--------|-------|
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| X-Frame-Options | DENY |
| Permissions-Policy | camera=(), microphone=(), geolocation=(), browsing-topics=() |
| X-DNS-Prefetch-Control | on |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload |
| Content-Security-Policy | See below |

## CSP Directives

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self' https://*.supabase.co;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
```

## Compromises

| Directive | Reason |
|-----------|--------|
| `script-src 'unsafe-inline'` | Required by Next.js inline bootstrap scripts (no nonce infra yet) |
| `script-src 'unsafe-eval'` | Required by Next.js development mode; can be removed in production with nonce support |
| `style-src 'unsafe-inline'` | Required by Tailwind CSS runtime style injection |
| `connect-src https://*.supabase.co` | Required for Supabase Auth API calls |

## No third-party domains

No analytics, tracking, CDN, or external font domains are included in CSP.
