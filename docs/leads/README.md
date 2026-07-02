# Lead Capture (Module 11)

Module 11 adds ethical lead capture to the result page at `/ai-risk-assessment/results?session=<public_token>`.

## What lead capture does

- Shows an optional follow-up form below the visible assessment result
- Collects minimal contact details (work email required; name/company/role optional)
- Requires explicit consent before saving
- Persists a lead row linked to the assessment session
- Deduplicates by assessment session + email (updates existing row on re-submit)
- Shows a success state while keeping the full result visible

## Fields collected

| Field                 | DB column              | Required |
| --------------------- | ---------------------- | -------- |
| Work email            | `email`                | Yes      |
| Full name             | `name`                 | No       |
| Company name          | `company_name`         | No       |
| Role / title          | `role`                 | No       |
| Follow-up interest    | `main_ai_concern`      | No       |
| Consent               | `consent_to_follow_up` | Yes      |
| Result score snapshot | `lead_score`           | Auto     |

Consent text is versioned in `LEAD_CONSENT_TEXT` (`src/features/leads/constants.ts`).

## How lead ties to assessment

1. User submits form with `publicToken` (URL session token only — no raw DB UUID exposed)
2. Server action validates input
3. `lead-capture.service.ts` verifies session + completed result exist
4. `leads.repository.ts` upserts by `(assessment_session_id, email)`

## What is intentionally not included

- PDF generation or report records (Module 12)
- Report context builder (Module 12)
- Email delivery or `email_events` (Module 14)
- `lead_events` timeline writes
- `cta_events` tracking (Module 17)
- Admin dashboard (Module 15)
- Calendly, Book Demo, sales CTAs, CRM, analytics, CAPTCHA
- External APIs

## Handoff

- **Module 12** — Report context builder
- **Module 14** — Email delivery after report generation
- **Module 15** — Admin lead dashboard
