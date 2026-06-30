# Company Profile — Security Notes

## Data minimization

The company profile step collects only high-level organizational context. It explicitly instructs users not to enter confidential information.

No free-text areas beyond optional company name (max 120 characters).

## Validation

All input is validated server-side with Zod:

- Controlled enum values only (no arbitrary strings except optional company name)
- Main AI concerns: min 1, max 5, no duplicates
- String trimming and empty optional fields normalized to `null`
- Oversized input rejected

Client-side HTML validation is supplementary; server validation is authoritative.

## Session token

- Generated with `crypto.randomBytes(32).toString("base64url")`
- Unique constraint on `assessment_sessions.public_token`
- Collision retry (up to 5 attempts) before failure
- Token format validated on the tools placeholder route

## What is not stored

- Raw IP addresses (`ip_hash` deferred)
- User agent (deferred unless implemented safely)
- Lead records (Module 11)
- Scores, reports, answers, or selected tools

## RLS posture

RLS is enabled on all tables. The app uses server-only Drizzle via `DATABASE_URL`, which bypasses RLS. All writes go through:

`Server Action → Service → Repository → getDb()`

No broad public RLS policies were added in Module 5.

## Rate limiting / bot protection

Full rate limiting and bot protection are deferred to lead capture and security hardening modules.

Current abuse mitigations:

- Strict field validation
- No sensitive freeform fields
- Max length on text inputs
- Generic error messages (no stack traces or SQL errors)

In-memory rate limiters are **not** used (unreliable on serverless).

## Future hardening

- Session token validation on all subsequent wizard steps
- Durable rate limiting at edge or API layer
- Optional CAPTCHA on high-abuse paths (lead capture)
