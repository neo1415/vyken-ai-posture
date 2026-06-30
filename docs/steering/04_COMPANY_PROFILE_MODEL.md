# 04 — Company Profile Model

## Purpose

Define company context fields collected at assessment start, their validation rules, and how they influence risk scoring and report tone.

## What it controls

- Assessment company profile form fields
- Required vs optional inputs
- Industry/size/region modifiers
- UX copy and data minimization rules

## UX copy (required on form)

> **Help us tailor the report. Do not enter confidential information.**

## Field definitions

| Field | Required | Type | Why it matters |
|-------|----------|------|----------------|
| `company_name` | Yes | text (short) | Report personalization; admin lead context |
| `country_region` | Yes | single_select | Report language/locale (English MVP); regulatory context tone |
| `industry` | Yes | single_select or card_select | Industry risk modifier |
| `company_size` | Yes | single_select | Maturity expectation modifier |
| `role` | Yes | single_select | Lead qualification; report audience tone |
| `department_function` | Optional | single_select | Use-case context |
| `handles_sensitive_regulated_data` | Yes | boolean or single_select | Escalates data exposure weight |
| `main_ai_concern` | Optional | single_select | Prioritizes recommendation ordering; lead intel |

### Company size options

- 1–10 employees
- 11–50
- 51–200
- 201–1,000
- 1,001–5,000
- 5,000+

### Role options (examples)

CISO, GRC/Compliance, IT Director, Security Architect, DPO/Privacy, Risk Manager, Engineering Lead, Legal, Executive, Other

### Industry options (examples)

Banking, Fintech, Insurance, Healthcare, Legal/Professional Services, SaaS/Technology, Consulting, Education, Public Sector, Retail/E-commerce, Media/Marketing, Manufacturing, Other

## How company size affects maturity expectations

| Size | Expectation |
|------|-------------|
| Small (1–50) | Informal AI usage more common; lower baseline governance expectation |
| Mid (51–1,000) | Should have draft or approved policy; approved tool awareness |
| Large (1,001+) | Expected AI owner, policy, vendor review, some auditability; **low maturity escalates risk more** |

Signal: `large_company_low_maturity` when size ≥ 1,001 and governance signals weak.

## How industry affects risk

Industry applies a **risk modifier** to data exposure and governance scores, not a separate legal classification.

### Industry modifier examples

| Industry + context | Modifier |
|--------------------|----------|
| Insurance + claims/KYC/customer records | Higher data exposure weight |
| Healthcare + patient data | Critical escalation when health data signals present |
| SaaS + code/secrets/logs | High agentic/coding and secrets exposure weight |
| Legal + client contracts | High legal/contract data weight |
| Marketing + public content only | Lower baseline when only public-data signals |
| Fintech + financial/KYC | Critical combination with sensitive data |
| Banking + customer/financial data | Critical combination with weak controls |

## How region affects report language

- MVP: English reports for all regions.
- `country_region` stored for lead intelligence and future localization.
- EU/UK regions: slightly stronger privacy framing in recommendations (still no legal claims).
- US: emphasize governance ownership and audit evidence themes.

## Data minimization rules

Company profile must **not** become invasive.

**Do not collect:**
- Revenue, funding, or financial statements
- Employee names or emails beyond report recipient
- Customer names, claim numbers, patient IDs
- Document uploads
- Detailed tech stack beyond selected AI tools
- Internal project names

**Do collect only:**
- High-level organizational context needed to tailor risk framing.

## Do / Do not

**Do:**
- Validate all fields server-side.
- Use industry/size in scoring service, not in UI-only logic.
- Allow "Other" for industry with neutral modifier.

**Do not:**
- Require free-text company descriptions.
- Use company name in public URLs or guessable report links.
- Store unnecessary PII beyond work email (captured later).

## Acceptance criteria

- All required fields enforced before wizard continues.
- Industry and size modifiers documented in scoring service.
- Form displays required UX copy.
- No confidential-data upload prompts.

## Related documents

- [08_QUESTION_SCHEMA.md](./08_QUESTION_SCHEMA.md)
- [09_SIGNAL_MAPPING.md](./09_SIGNAL_MAPPING.md)
- [10_SCORING_MODEL.md](./10_SCORING_MODEL.md)
