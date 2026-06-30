# 06 — Control Library

## Purpose

Define reusable controls that recommendations and reports reference. Controls bridge risk findings to actionable governance steps and Vyken Guard relevance.

## What it controls

- Control IDs and descriptions in recommendations
- Framework mapping in report action plans
- Vyken Guard bridge language (careful, non-overclaiming)

## Control format

Each control includes:

- **Control ID** — stable identifier
- **Control name** — plain English
- **Risk addressed** — from `05_RISK_TAXONOMY.md`
- **Description** — what the organization should do
- **Evidence examples** — what "done" looks like
- **Framework mapping** — NIST/ISO/OWASP/privacy lens
- **Vyken Guard relevance** — optional support statement

## Vyken Guard wording rule

> Vyken Guard may support this control through visibility, policy enforcement, redaction, logging, and audit evidence depending on deployment scope.

Do not state Guard implements every control unconditionally.

---

## Controls

### AI-GOV-001: Assign AI Governance Owner

| Field | Value |
|-------|-------|
| Risk addressed | Governance ownership gap |
| Description | Designate a role accountable for AI policy, tool approvals, incidents, and reporting. |
| Evidence examples | Named owner in policy; RACI for AI decisions; escalation contact |
| Framework mapping | NIST Govern; ISO 42001-style leadership and accountability |
| Vyken relevance | Guard may provide usage visibility to support owner reporting |

### AI-GOV-002: Maintain Approved AI Tool List

| Field | Value |
|-------|-------|
| Risk addressed | Approved tool list gap, shadow AI |
| Description | Maintain a reviewed list of AI tools permitted by use case and department. |
| Evidence examples | Published tool register; approval workflow; periodic review date |
| Framework mapping | NIST Map/Govern; ISO 42001-style resource management |
| Vyken relevance | Visibility may reveal tools not on approved list |

### AI-DATA-001: Restrict Sensitive Data in AI Prompts

| Field | Value |
|-------|-------|
| Risk addressed | Sensitive data exposure, prompt/upload exposure |
| Description | Define data classes that must not enter AI tools without controls. |
| Evidence examples | Data handling matrix; training materials; DLP/redaction rules |
| Framework mapping | Privacy minimization; OWASP sensitive disclosure |
| Vyken relevance | Redaction/blocking may reduce sensitive prompt exposure |

### AI-DATA-002: File Upload Restrictions

| Field | Value |
|-------|-------|
| Risk addressed | File upload risk |
| Description | Restrict or govern document uploads to AI tools by sensitivity. |
| Evidence examples | Upload policy; blocked file types; approved tools for uploads |
| Framework mapping | NIST Manage; privacy purpose limitation |
| Vyken relevance | Enforcement may block uploads to unapproved tools |

### AI-DATA-003: Meeting Transcript Handling Rules

| Field | Value |
|-------|-------|
| Risk addressed | Meeting transcript risk |
| Description | Rules for which meetings may use AI transcription and retention limits. |
| Evidence examples | Meeting-type policy; consent notices; deletion schedules |
| Framework mapping | Privacy transparency; EU-style limited-risk lens |
| Vyken relevance | Visibility into meeting AI tool usage |

### AI-ACC-001: Restrict Personal AI Accounts for Work Use

| Field | Value |
|-------|-------|
| Risk addressed | Personal account risk |
| Description | Require company-managed accounts for business AI use; restrict personal accounts. |
| Evidence examples | Account policy; SSO enforcement; procurement of enterprise seats |
| Framework mapping | NIST Govern/Manage |
| Vyken relevance | Visibility may detect personal account usage patterns |

### AI-AUD-001: AI Usage Logging

| Field | Value |
|-------|-------|
| Risk addressed | Auditability gap |
| Description | Log AI tool usage sufficient for governance review and investigations. |
| Evidence examples | Centralized logs; retention period; review cadence |
| Framework mapping | NIST Measure/Manage; ISO monitoring |
| Vyken relevance | Guard may provide usage logging and audit trails |

### AI-AUD-002: Audit Evidence Retention

| Field | Value |
|-------|-------|
| Risk addressed | Auditability gap |
| Description | Retain evidence of policy, approvals, reviews, and incidents for audit cycles. |
| Evidence examples | Evidence repository; retention schedule; audit sample reports |
| Framework mapping | ISO 42001-style documented information |
| Vyken relevance | Logs and policy events may feed evidence packs |

### AI-VEND-001: AI Vendor Review

| Field | Value |
|-------|-------|
| Risk addressed | Vendor/privacy risk, retention/training uncertainty |
| Description | Review vendor privacy, security, retention, training use, and subprocessors before approval. |
| Evidence examples | Vendor assessment checklist; signed DPAs; security doc review |
| Framework mapping | NIST Map/Measure; supply chain (OWASP) |
| Vyken relevance | Complements Guard; full vendor review is call-only depth |

### AI-HUM-001: Human Review for Sensitive Decisions

| Field | Value |
|-------|-------|
| Risk addressed | Human review gap, regulated decision risk |
| Description | Require human review before AI outputs affect people, customers, or regulated outcomes. |
| Evidence examples | Review workflow; sign-off records; prohibited fully automated decisions |
| Framework mapping | EU-style high-impact lens; NIST Manage |
| Vyken relevance | Workflow integration is deployment-specific |

### AI-DEV-001: Review AI Coding Assistant Use

| Field | Value |
|-------|-------|
| Risk addressed | Source code/secrets risk, agentic/coding risk |
| Description | Define which repos, branches, and data may use coding assistants; require review gates. |
| Evidence examples | Dev AI policy; secrets scanning; excluded repos list |
| Framework mapping | OWASP supply chain; NIST Map |
| Vyken relevance | Coding usage visibility where deployed |

### AI-AGT-001: Review Connected AI Tool Permissions

| Field | Value |
|-------|-------|
| Risk addressed | Agentic/MCP risk, connected tool access |
| Description | Inventory and restrict AI connections to files, APIs, repos, and business systems. |
| Evidence examples | Integration register; least-privilege reviews; MCP allowlists |
| Framework mapping | OWASP excessive agency |
| Vyken relevance | Full agentic review is call-only; Guard may log connected usage |

### AI-INC-001: AI Incident Response Process

| Field | Value |
|-------|-------|
| Risk addressed | Incident response gap |
| Description | Define escalation for AI data leaks, policy violations, and harmful outputs. |
| Evidence examples | Runbook; contact tree; post-incident review template |
| Framework mapping | NIST Govern/Manage |
| Vyken relevance | Detection may feed incident workflows |

### AI-ENF-001: Redact/Block/Alert/Log Risky AI Activity

| Field | Value |
|-------|-------|
| Risk addressed | Enforcement gap |
| Description | Move beyond policy to technical controls that intervene on risky usage. |
| Evidence examples | Block rules; redaction policies; alert thresholds |
| Framework mapping | NIST Manage |
| Vyken relevance | Core Guard value proposition — visibility, enforcement, audit evidence |

## Do / Do not

**Do:**
- Reference control IDs in recommendations and NIST action plan.
- Pair controls with plain-English actions users can take this quarter.

**Do not:**
- Promise Guard delivers every control out of the box.
- Present controls as certified ISO 42001 implementation.

## Acceptance criteria

- Each high-severity recommendation maps to at least one control ID.
- Starter policy checklist in report draws from this library.
- Control IDs are stable for future CMS/admin editing.

## Related documents

- [03_FRAMEWORK_MAPPING.md](./03_FRAMEWORK_MAPPING.md)
- [11_RECOMMENDATION_LIBRARY.md](./11_RECOMMENDATION_LIBRARY.md)
- [12_REPORT_ENGINE.md](./12_REPORT_ENGINE.md)
