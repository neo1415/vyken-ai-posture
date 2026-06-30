# 01 — Project Brief

## Purpose

Define what the Vyken AI Risk Assessment Hub is, who it serves, and what success looks like. This document is the north star for all implementation decisions.

## What it controls

- Product identity and positioning
- User groups and business goals
- MVP boundaries
- Key user journey and outputs
- Sales bridge to Vyken Guard

## Product name

**Vyken AI Risk Assessment Hub**

## Purpose

A public, lead-generating AI governance and security assessment tool. Organizations provide company context, select AI tools, answer guided questions, and receive an instant risk summary plus a branded PDF report by email.

## Primary user groups

| Group | Role examples |
|-------|---------------|
| Security & GRC | CISO, GRC lead, security architect, risk manager |
| Compliance & privacy | Compliance officer, DPO, privacy lead |
| IT & operations | IT director, internal audit lead |
| Leadership | CTO, AI governance lead, department heads in regulated industries |

Secondary: engineering managers, legal counsel, procurement/vendor risk, founders.

## Primary business goal

Generate **qualified Vyken Guard leads** — prospects who understand their AI risk gaps and are motivated to explore visibility, enforcement, and audit evidence with Vyken.

## MVP summary

A multi-step public assessment that:

1. Captures company profile and selected AI tools.
2. Asks framework-informed questions about usage, data exposure, governance, auditability, and agentic/coding risk.
3. Calculates server-side risk scores and signals.
4. Shows an instant result summary.
5. Captures work email and delivers a branded PDF report.
6. Notifies Vyken internally and stores lead intelligence for admin follow-up.

## What the product is

- Lead-generation assessment tool
- Multi-tool AI stack risk wizard
- Company-context-aware, framework-informed governance assessment
- Branded PDF report generator
- Lead intelligence capture engine
- Sales bridge to Vyken Guard
- Foundation for future deeper AI governance modules

## What the product is not

| Not this | Clarification |
|----------|---------------|
| Legal advice | Assessment is informational; users need their own legal/privacy review |
| Certification | No ISO, NIST, EU AI Act, or compliance certification claims |
| Real-time monitoring | No live AI usage tracking in MVP |
| Vulnerability scan | No code, MCP, or GitHub scanning in MVP |
| Full Vyken Guard | Assessment complements Guard; does not replace it |
| Legal compliance validation | Framework-informed, not legally binding |
| AI vendor scanner | Curated profiles with confidence levels, not live policy scraping |

## Key user journey

1. Land on public homepage → understand value proposition.
2. Start assessment → enter company profile (minimal, non-invasive).
3. Select AI tools (multi-select, search, categories).
4. Answer usage, data exposure, governance, visibility, and agentic/coding questions.
5. View instant risk summary (overall rating, top drivers, maturity stage).
6. Enter work email → receive branded PDF report.
7. Vyken receives lead notification with risk profile for follow-up.

## Key outputs

| Output | Description |
|--------|-------------|
| Instant result page | Overall risk rating, score breakdown, top drivers, recommendation preview |
| Branded PDF report | 18-section framework-informed report with action plan and starter checklist |
| Admin lead intelligence | Stored session, scores, signals, company context, CTA events |

## Core sales bridge

> The assessment shows where risk may exist. Vyken Guard helps organizations move from written AI policy to practical visibility, enforcement, and audit evidence.

Assessment value: identify gaps, prioritize controls, starter policy checklist, NIST-style action plan.

Call-only value: full custom policy, implementation roadmap, vendor review, ISO readiness, legal analysis, agentic/MCP security review, Guard deployment plan.

## Required disclaimers (product-wide)

- This is **not legal advice**.
- This is **not a certification** or official compliance report.
- This is **not real-time monitoring** of AI usage.
- This is **not a vulnerability scan** of code, repos, or MCP servers.
- Results are based on self-reported answers and curated tool profiles, not live vendor audits.

## Do / Do not

**Do:**
- Use careful language: "may indicate," "suggests," "should be reviewed," "based on your answers."
- Position Vyken as a serious AI governance partner.
- Make reports useful enough to forward internally.

**Do not:**
- Say "this tool is secure/unsafe," "proves compliance," or "certifies AI usage."
- Pretend to be Vyken Guard.
- Ask users to upload confidential documents.

## Acceptance criteria

- Any new feature can be traced to this brief's MVP scope or explicit roadmap.
- All user-facing copy respects disclaimer boundaries.
- Lead generation path to Vyken Guard is visible but not pushy.

## Related documents

- [02_PRODUCT_SCOPE.md](./02_PRODUCT_SCOPE.md)
- [03_FRAMEWORK_MAPPING.md](./03_FRAMEWORK_MAPPING.md)
- [12_REPORT_ENGINE.md](./12_REPORT_ENGINE.md)
- Master PRD: `/master-prd-for-vyken.md`
