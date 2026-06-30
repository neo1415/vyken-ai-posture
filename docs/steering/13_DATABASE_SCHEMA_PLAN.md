# 13 — Database Schema Plan

## Purpose

Planning guidance for database tables, access patterns, RLS expectations, and indexes. **Final schema is implemented in the database module — not Module 0.**

## What it controls

- Drizzle schema design in future modules
- Supabase RLS policies
- Data sensitivity classification
- Snapshot storage strategy

## Implementation rule

> The final database schema will be implemented in the database module (Module 3), not this module. This document is planning guidance only.

## Tables

### admin_users

| Aspect | Detail |
|--------|--------|
| Purpose | Vyken admin authentication identities |
| Sensitive fields | email, password hash (if applicable) |
| RLS | Admin-only read/write own record; superadmin manages |
| Access | Server + authenticated admin client |
| Indexes | email unique |

### admin_roles

| Aspect | Detail |
|--------|--------|
| Purpose | Role definitions (viewer, editor, superadmin) |
| RLS | Admin read; superadmin write |
| Access | Server-side authorization checks |

### ai_tool_categories

| Aspect | Detail |
|--------|--------|
| Purpose | Tool category taxonomy |
| RLS | Public read published; admin write |
| Access | Public read for selector; admin CRUD |

### ai_tools

| Aspect | Detail |
|--------|--------|
| Purpose | Current published tool metadata (pointer to latest version) |
| RLS | Public read published tools; admin write |
| Indexes | slug unique, category_id, published_status |

### ai_tool_profile_versions

| Aspect | Detail |
|--------|--------|
| Purpose | Immutable versioned tool profile snapshots |
| Sensitive fields | reviewed_by (internal) |
| RLS | Public read published versions; admin write |
| Indexes | tool_id + profile_version unique |
| Snapshots | Referenced by reports at generation time |

### assessment_sessions

| Aspect | Detail |
|--------|--------|
| Purpose | Top-level assessment attempt |
| Sensitive fields | IP hash, user agent (optional, minimized) |
| RLS | **Public insert only** via server; no public read |
| Access | Server-only read/write; admin read |
| Indexes | created_at, status, lead_id |

### assessment_company_profiles

| Aspect | Detail |
|--------|--------|
| Purpose | Company context per session |
| Sensitive fields | company_name (low sensitivity) |
| RLS | Server-only; admin read |
| Snapshots | Copied into report context |

### assessment_selected_tools

| Aspect | Detail |
|--------|--------|
| Purpose | Tools chosen per session (incl. unknown/other flags) |
| RLS | Server-only; admin read |
| Indexes | session_id, tool_id |

### assessment_answers

| Aspect | Detail |
|--------|--------|
| Purpose | Normalized question answers |
| RLS | Server-only; admin read |
| Indexes | session_id, question_id |

### assessment_scores

| Aspect | Detail |
|--------|--------|
| Purpose | Computed scores and ratings |
| RLS | Server-only; admin read |
| Snapshots | Full score object in report context |

### assessment_risk_signals

| Aspect | Detail |
|--------|--------|
| Purpose | Derived signals per session |
| RLS | Server-only; admin read |
| Indexes | session_id, signal_id |

### assessment_findings

| Aspect | Detail |
|--------|--------|
| Purpose | Human-readable findings for report |
| RLS | Server-only; admin read |

### assessment_recommendations

| Aspect | Detail |
|--------|--------|
| Purpose | Selected recommendation blocks per session |
| RLS | Server-only; admin read |

### reports

| Aspect | Detail |
|--------|--------|
| Purpose | Generated report metadata and access tokens |
| Sensitive fields | access_token (hashed), recipient_email |
| RLS | **No public table access** — token validated server-side |
| Access | Server-only; admin read |
| Indexes | session_id, access_token_hash, created_at |
| Snapshots | **Store full `report_context` JSON** |

### leads

| Aspect | Detail |
|--------|--------|
| Purpose | Sales lead record linked to session |
| Sensitive fields | work_email, qualification score |
| RLS | Admin-only |
| Indexes | email, created_at, qualification_score |

### lead_events

| Aspect | Detail |
|--------|--------|
| Purpose | Timeline: completed, email sent, CTA clicked, note added |
| RLS | Admin-only |
| Indexes | lead_id, event_type, created_at |

### admin_notes

| Aspect | Detail |
|--------|--------|
| Purpose | Internal sales notes on leads |
| RLS | Admin-only |
| Indexes | lead_id |

### unknown_tool_requests

| Aspect | Detail |
|--------|--------|
| Purpose | User-submitted tools not in database |
| RLS | Public insert via server; admin read/update |
| Indexes | status, created_at |

### cta_events

| Aspect | Detail |
|--------|--------|
| Purpose | Track CTA clicks from result page and PDF links |
| RLS | Public insert via server (validated); admin read |
| Indexes | lead_id, cta_type, created_at |

### email_events

| Aspect | Detail |
|--------|--------|
| Purpose | Delivery status for report emails |
| RLS | Server/admin only |
| Indexes | report_id, status |

### audit_logs

| Aspect | Detail |
|--------|--------|
| Purpose | Admin action audit trail |
| RLS | Admin read; server insert |
| Indexes | admin_user_id, action, created_at |

## Access pattern summary

| Pattern | Tables |
|---------|--------|
| Public insert only (via server action) | assessment_sessions, unknown_tool_requests, cta_events |
| Public read (published data) | ai_tools, ai_tool_categories, ai_tool_profile_versions |
| Server-only | assessment_*, scoring, signals, report token validation |
| Admin-only | leads, lead_events, admin_notes, audit_logs |

## RLS expectations

- Enable RLS on **all** tables.
- Default deny; explicit policies per role.
- Never use service role key in browser — server actions/route handlers only.
- Anon key may only access explicitly public-read policies.

## Indexes (priority)

- Foreign keys: session_id, lead_id, tool_id
- Admin dashboard: leads.created_at DESC, leads.qualification_score
- Report lookup: reports.access_token_hash
- Tool search: ai_tools.name trigram or ilike (implementation choice)

## Snapshot rule

These records must store generation-time snapshots:

- `reports.report_context` (full object)
- `reports.tool_profile_versions`
- `assessment_scores` at report time (or embedded in report_context)

## Do / Do not

**Do:**
- Use Drizzle schema as source of truth with migrations.
- Document sensitive fields in module 3 implementation.
- Hash report access tokens at rest.

**Do not:**
- Store confidential documents or uploaded files.
- Expose lead PII via public APIs.
- Drift schema without migration files.

## Acceptance criteria

- Module 3 schema implements all tables above or documents intentional deferrals.
- RLS policies tested for anon vs admin vs server paths.
- Report snapshot reproducibility verified.

## Related documents

- [07_TOOL_PROFILE_SCHEMA.md](./07_TOOL_PROFILE_SCHEMA.md)
- [14_ARCHITECTURE.md](./14_ARCHITECTURE.md)
- [15_SECURITY_STANDARD.md](./15_SECURITY_STANDARD.md)
