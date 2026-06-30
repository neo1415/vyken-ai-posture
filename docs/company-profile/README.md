# Company Profile Step

First real assessment step — collects basic organizational context to tailor risk interpretation and report language.

## Purpose

The company profile helps the assessment understand:

- Industry and regulatory context tone
- Company size and governance maturity expectations
- Respondent role for report audience
- Sensitive data handling posture
- Priority AI concerns for recommendation ordering (Module 9+)

It does **not** collect confidential documents, customer data, prompts, or credentials.

## Fields collected

| Field                      | Required  | Stored as                             |
| -------------------------- | --------- | ------------------------------------- |
| Company name               | No        | `company_name` (nullable text)        |
| Country / region           | Yes       | `country_region` slug                 |
| Industry                   | Yes       | `industry` slug                       |
| Company size               | Yes       | `company_size` slug                   |
| Respondent role            | Yes       | `respondent_role` slug                |
| Department / function      | No        | `department_function` slug or null    |
| Sensitive / regulated data | Yes       | `handles_sensitive_or_regulated_data` |
| Main AI concerns           | Yes (1–5) | `main_ai_concerns` JSON array         |

Option slugs are defined in `src/features/company-profile/constants.ts`.

## What is not collected

- Email (Module 11)
- Confidential documents or uploads
- Customer/patient/employee identifiers
- Source code, prompts, API keys
- Revenue or financial statements

## UI (Module 5B)

The company profile step uses a Vyken dark/grid assessment layout with 5 internal mini-steps, card-based options, and CSS-only motion. See `src/features/company-profile/components/CompanyProfileWizard.tsx`.

## Data flow

```text
/ai-risk-assessment (form)
  → submitCompanyProfile (server action)
  → company-profile.service
  → assessment-sessions + company-profiles repositories
  → redirect /ai-risk-assessment/tools?session=<public_token>
```

## Session handling

- `assessment_sessions.public_token` is a high-entropy base64url token (32 random bytes).
- Internal session UUID is never exposed in the URL.
- No lead, score, report, or selected tools are created in this step.

## Next module

**Module 6 — Multi-Tool Selector** will use the session token to continue the assessment at `/ai-risk-assessment/tools`.

## Related code

- `src/features/company-profile/`
- `src/server/services/company-profile.service.ts`
- `src/server/repositories/assessment-sessions.repository.ts`
- `src/server/repositories/company-profiles.repository.ts`
