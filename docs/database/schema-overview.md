# Schema overview

MVP database schema for the Vyken AI Risk Assessment Hub (Module 3).

## Tables

| Table | Purpose | Sensitive fields | Used by modules |
|-------|---------|------------------|-----------------|
| `admin_users` | Admin identities | email | Admin auth, dashboard |
| `ai_tool_categories` | Tool taxonomy | — | Tool selector (4), wizard (7) |
| `ai_tools` | Tool identity | — | Tool selector (4) |
| `ai_tool_profile_versions` | Versioned vendor profiles | reviewed_by | Tools (4), reports (12) |
| `assessment_sessions` | Assessment attempt | ip_hash, user_agent | Wizard (7), scoring (8) |
| `assessment_company_profiles` | Company context | company_name | Company step (5) |
| `assessment_selected_tools` | Selected tools | — | Tool selector (6) |
| `assessment_answers` | Structured answers | answer_value (controlled) | Wizard (7) |
| `assessment_scores` | Server-calculated scores | — | Scoring (8), results (10) |
| `assessment_risk_signals` | Derived signals | — | Scoring (8) |
| `assessment_findings` | Report findings | — | Scoring (8), reports (12) |
| `assessment_recommendations` | Recommendation blocks | — | Recommendations (9) |
| `reports` | Report records + snapshot | report_token, report_context | Reports (12–13) |
| `leads` | Lead records | email, phone | Lead capture (11), admin (15) |
| `lead_events` | Lead timeline | event_metadata | Admin (15), email (14) |
| `admin_notes` | Internal notes | note | Admin (15) |
| `unknown_tool_requests` | User tool requests | requester_email | Tool selector (6), admin (16) |
| `cta_events` | CTA tracking | metadata | Results (10), admin |
| `email_events` | Email delivery log | — | Email (14) |
| `audit_logs` | Admin/system audit | metadata | Admin |

## Relationships (major)

```text
ai_tool_categories 1──* ai_tools 1──* ai_tool_profile_versions

assessment_sessions 1──1 assessment_company_profiles
assessment_sessions 1──* assessment_selected_tools ──* ai_tools
assessment_sessions 1──* assessment_answers
assessment_sessions 1──1 assessment_scores
assessment_sessions 1──* assessment_risk_signals
assessment_sessions 1──* assessment_findings
assessment_sessions 1──* assessment_recommendations
assessment_sessions 1──1 reports

leads *──1 assessment_sessions
leads 1──* lead_events
leads 1──* admin_notes

admin_users 1──* admin_notes
admin_users 1──* audit_logs
```

## JSONB usage

| Column | Intent |
|--------|--------|
| `answer_value` | Controlled option values from question schema |
| `score_breakdown` | Structured score components snapshot |
| `report_context` | Full report generation snapshot |
| `main_ai_concerns` | Selected concern option keys |
| `common_use_cases` | String array of use-case tags |
| `framework_mapping` | Framework lens labels |
| `event_metadata` / `metadata` | Small structured event payloads |

JSONB is **not** for raw confidential prompts, uploads, or unbounded free text.

## Tokens

| Column | Table | Purpose |
|--------|-------|---------|
| `public_token` | assessment_sessions | Unguessable session reference |
| `report_token` | reports | Unguessable report access |

Generation logic is implemented in server modules — not Module 3.

## Data minimization

Not stored: raw prompts, uploaded files, API keys, meeting transcripts, passwords, raw IPs.

## Schema source

TypeScript files in `src/lib/db/schema/`. Migrations in `drizzle/`.
