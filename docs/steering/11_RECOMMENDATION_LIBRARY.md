# 11 — Recommendation Library

## Purpose

Define recommendation block structure, CTA types, and canonical examples mapped to risk signals.

## What it controls

- `recommendationService` selection logic
- `assessment_recommendations` persistence
- PDF recommendation sections
- Vyken sales bridge copy

## Recommendation block format

```typescript
{
  recommendation_id: string;
  title: string;
  trigger_signals: string[];       // any match or all match — document per block
  severity: 'low' | 'medium' | 'high' | 'critical';
  plain_english_finding: string;
  why_it_matters: string;
  recommended_actions: string[];   // 3–6 actionable steps
  framework_mapping: string[];       // e.g., "NIST Govern", "OWASP LLM: sensitive disclosure"
  control_ids?: string[];          // from 06_CONTROL_LIBRARY.md
  vyken_bridge: string;
  cta_label: string;
  cta_destination_type: CtaDestinationType;
}
```

## CTA destination types

| Type | Use |
|------|-----|
| `book_call` | Schedule consultation |
| `vyken_guard` | Vyken Guard product page |
| `vyken_registration` | Guard waitlist/registration |
| `ai_risk_index` | Content series link |
| `request_review` | Unknown tool or vendor review request |

## Selection rules

1. Match recommendations where `trigger_signals` intersect session signals.
2. Sort by severity, then relevance to `main_ai_concern` if provided.
3. Cap public result page at **3–5** top recommendations; full set in PDF.
4. Do not show duplicate overlapping recommendations — merge by highest severity.

## Example recommendations

### REC-001: Personal AI accounts

| Field | Value |
|-------|-------|
| trigger_signals | `personal_ai_accounts`, `mixed_account_usage` |
| severity | high |
| plain_english_finding | Employees may be using personal AI accounts for work without enterprise controls. |
| why_it_matters | Personal accounts reduce control over retention, deletion, training use, and auditability. |
| recommended_actions | Restrict sensitive work on personal accounts; require company-managed seats; update acceptable use policy; communicate approved account types |
| framework_mapping | NIST Govern; Privacy data minimization |
| control_ids | AI-ACC-001 |
| vyken_bridge | Vyken Guard may help detect unmanaged AI usage and support enforcement depending on deployment. |
| cta_label | Review AI visibility options |
| cta_destination_type | vyken_guard |

### REC-002: Sensitive data in prompts/uploads

| Field | Value |
|-------|-------|
| trigger_signals | `sensitive_customer_data`, `claims_kyc_identity_data`, `health_data`, `secrets_exposure` |
| severity | critical |
| plain_english_finding | Sensitive or regulated data may be entering AI tools through prompts or uploads. |
| why_it_matters | Increases disclosure, retention, and compliance risk; hard to evidence controls after the fact. |
| recommended_actions | Classify data allowed in AI tools; block secrets and regulated data in unmanaged tools; add redaction where possible; train employees on prompt hygiene |
| framework_mapping | OWASP LLM sensitive disclosure; Privacy minimization |
| control_ids | AI-DATA-001, AI-DATA-002 |
| vyken_bridge | Vyken Guard may support redaction, blocking, and logging for sensitive data patterns. |
| cta_label | Explore data exposure controls |
| cta_destination_type | vyken_guard |

### REC-003: No AI policy

| Field | Value |
|-------|-------|
| trigger_signals | `no_ai_policy` |
| severity | medium |
| plain_english_finding | No approved AI usage policy was indicated. |
| why_it_matters | Without clear rules, teams may use AI inconsistently and expose data unknowingly. |
| recommended_actions | Assign AI owner; draft acceptable use policy; define approved tools and account types; communicate policy to staff |
| framework_mapping | NIST Govern; ISO 42001-style policy |
| control_ids | AI-GOV-001 |
| vyken_bridge | Assessment provides starter checklist; full custom policy available through consultation. |
| cta_label | Book a governance consultation |
| cta_destination_type | book_call |

### REC-004: No approved tool list

| Field | Value |
|-------|-------|
| trigger_signals | `no_approved_tool_list`, `unapproved_tools` |
| severity | medium |
| plain_english_finding | AI tools may be in use without a maintained approved tool list. |
| recommended_actions | Inventory current AI tools; define approval criteria; publish approved list; review quarterly |
| control_ids | AI-GOV-002 |
| vyken_bridge | Visibility tools may reveal shadow AI not on the approved list. |
| cta_label | Review tool governance |
| cta_destination_type | vyken_guard |

### REC-005: No auditability

| Field | Value |
|-------|-------|
| trigger_signals | `no_audit_logs` |
| severity | high |
| plain_english_finding | Limited ability to review evidence of AI tool usage. |
| recommended_actions | Enable enterprise logging where available; centralize AI usage records; define retention for audit evidence |
| framework_mapping | NIST Measure/Manage |
| control_ids | AI-AUD-001, AI-AUD-002 |
| vyken_bridge | Vyken Guard may provide usage logging and audit evidence capabilities. |
| cta_label | Discuss audit evidence options |
| cta_destination_type | vyken_guard |

### REC-006: No enforcement

| Field | Value |
|-------|-------|
| trigger_signals | `no_enforcement` |
| severity | high |
| plain_english_finding | Policy guidance exists or is planned, but technical enforcement appears limited. |
| recommended_actions | Define enforceable rules; implement warn/block/redact for high-risk patterns; align enforcement with policy |
| control_ids | AI-ENF-001 |
| vyken_bridge | Vyken Guard focuses on moving from policy-only to practical enforcement. |
| cta_label | See enforcement capabilities |
| cta_destination_type | vyken_guard |

### REC-007: Weak vendor review

| Field | Value |
|-------|-------|
| trigger_signals | `no_vendor_review` |
| severity | medium |
| plain_english_finding | AI vendor privacy and security practices may not be systematically reviewed. |
| recommended_actions | Create vendor review checklist; review training use and retention; document subprocessors; require enterprise agreements for sensitive use |
| control_ids | AI-VEND-001 |
| vyken_bridge | Full vendor review is available as a consulting engagement. |
| cta_label | Request vendor review |
| cta_destination_type | request_review |

### REC-008: Meeting transcript exposure

| Field | Value |
|-------|-------|
| trigger_signals | `meeting_transcript_exposure` |
| severity | medium–high |
| plain_english_finding | Meeting recordings or transcripts may be processed by AI tools. |
| recommended_actions | Define which meetings may use AI transcription; inform participants; restrict confidential meetings; set deletion schedules |
| control_ids | AI-DATA-003 |
| cta_label | Review meeting AI usage |
| cta_destination_type | book_call |

### REC-009: Source code/secrets exposure

| Field | Value |
|-------|-------|
| trigger_signals | `source_code_exposure`, `secrets_exposure` |
| severity | high |
| plain_english_finding | Source code, logs, or secrets may enter AI coding tools. |
| recommended_actions | Exclude sensitive repos; scan for secrets; require human review for AI-generated code; restrict command execution |
| control_ids | AI-DEV-001 |
| vyken_bridge | Deep agentic/code review available on consultation. |
| cta_label | Review coding assistant governance |
| cta_destination_type | book_call |

### REC-010: Agentic/coding/MCP risk

| Field | Value |
|-------|-------|
| trigger_signals | `mcp_usage`, `agent_command_execution`, `agent_file_access`, `coding_assistant_usage` |
| severity | high |
| plain_english_finding | AI agents or coding assistants may have elevated access to files, repos, or systems. |
| recommended_actions | Inventory connected integrations; apply least privilege; require code review gates; limit autonomous command execution |
| framework_mapping | OWASP excessive agency |
| control_ids | AI-AGT-001, AI-DEV-001 |
| vyken_bridge | Full MCP/agentic security review is a call-only engagement; Guard may log usage where deployed. |
| cta_label | Discuss agentic AI risk |
| cta_destination_type | book_call |

### REC-011: Unknown tool risk

| Field | Value |
|-------|-------|
| trigger_signals | `unknown_tool_selected`, `unknown_ai_usage` |
| severity | medium |
| plain_english_finding | Some AI tools in use are unknown or not on the curated profile list. |
| recommended_actions | Identify tools in use; submit unknown tools for review; apply cautious data rules until reviewed |
| vyken_bridge | Request addition to tool database or vendor review consultation. |
| cta_label | Request tool review |
| cta_destination_type | request_review |

## Value boundary

Recommendations must be **specific enough to help** but must **not** replace full consulting deliverables listed in `12_REPORT_ENGINE.md`.

## Do / Do not

**Do:**
- Store recommendations as data files editable without UI changes.
- Include `vyken_bridge` on every high/critical recommendation.

**Do not:**
- Generate recommendations via unconstrained LLM at runtime in MVP.
- Promise legal outcomes in recommendation text.

## Acceptance criteria

- Every signal in high-severity taxonomy has at least one recommendation mapping.
- CTA types tracked in `cta_events` table.
- PDF includes full matched recommendation set.

## Related documents

- [06_CONTROL_LIBRARY.md](./06_CONTROL_LIBRARY.md)
- [10_SCORING_MODEL.md](./10_SCORING_MODEL.md)
- [12_REPORT_ENGINE.md](./12_REPORT_ENGINE.md)
