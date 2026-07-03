# Rate Limiting Notes

## Current Implementation

In-memory per-instance rate limiter (`src/lib/security/rate-limit.ts`).

Suitable for single-server deployments. For multi-instance production, replace with Redis/Upstash.

## Protected Actions

| Action | Limit | Window | Key |
|--------|-------|--------|-----|
| Admin login | 5 attempts | 15 minutes | email |
| Lead capture | 10 attempts | 1 minute | public token |
| CTA event tracking | 20 attempts | 1 minute | public token |
| Email send (public) | 3 attempts | 1 minute | public token |

## Existing Dedupe (from Module 17)

- CTA events: 30-second dedupe window per session + type + destination (DB-level)
- `report_requested` lead event: once per lead (DB-level)
- `result_viewed` / `lead_capture_viewed`: once per session (DB-level)
- Report email: `already_sent` outcome prevents duplicate delivery

## Deferred (production scaling)

- Redis/Upstash for distributed rate limiting
- IP-based rate limiting (requires trust proxy config)
- Sliding window algorithm
- Exponential backoff on admin login
- CAPTCHA for repeated failures
