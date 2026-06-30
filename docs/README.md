# Vyken AI Risk Assessment Hub — Documentation

## Purpose

This directory contains project documentation for the Vyken AI Risk Assessment Hub. The **steering documents** in `/docs/steering` are the authoritative rulebook for all implementation work.

**No product code should be built until Module 0 steering documents are complete and externally reviewed.**

## How coding agents must use steering documents

Every implementation prompt (Module 1 onward) must begin with:

1. **Read** the relevant steering documents listed in the module PRD.
2. **Read** `18_AI_AGENT_RULES.md` and `21_CURSOR_WORKFLOW.md` every time.
3. **Read** domain-specific docs for the module (e.g., scoring module → `10_SCORING_MODEL.md`, `09_SIGNAL_MAPPING.md`).

After implementation:

1. **Self-review** against `19_CODE_REVIEW_CHECKLIST.md`.
2. **Verify** against `20_MODULE_DONE_CRITERIA.md`.
3. **Return** the module completion report format from `21_CURSOR_WORKFLOW.md`.

## Steering document index

| File                           | Purpose                                       |
| ------------------------------ | --------------------------------------------- |
| `01_PROJECT_BRIEF.md`          | Product identity, users, journey, boundaries  |
| `02_PRODUCT_SCOPE.md`          | MVP must-have, should-have, not-MVP, roadmap  |
| `03_FRAMEWORK_MAPPING.md`      | Framework-informed language and mapping rules |
| `04_COMPANY_PROFILE_MODEL.md`  | Company context fields and modifiers          |
| `05_RISK_TAXONOMY.md`          | Risk categories, signals, CTA directions      |
| `06_CONTROL_LIBRARY.md`        | Reusable control definitions                  |
| `07_TOOL_PROFILE_SCHEMA.md`    | AI tool database schema and seed list         |
| `08_QUESTION_SCHEMA.md`        | Assessment question data model                |
| `09_SIGNAL_MAPPING.md`         | Answer → signal mapping rules                 |
| `10_SCORING_MODEL.md`          | Scoring components, labels, test scenarios    |
| `11_RECOMMENDATION_LIBRARY.md` | Recommendation block format and examples      |
| `12_REPORT_ENGINE.md`          | PDF report structure and generation rules     |
| `13_DATABASE_SCHEMA_PLAN.md`   | Planned tables, RLS, access patterns          |
| `14_ARCHITECTURE.md`           | Folder structure, server/client boundaries    |
| `15_SECURITY_STANDARD.md`      | Security requirements and pitfalls            |
| `16_DESIGN_SYSTEM.md`          | Visual direction and UI primitives            |
| `17_COMPONENT_RULES.md`        | Component quality standards                   |
| `18_AI_AGENT_RULES.md`         | Mandatory agent behavior                      |
| `19_CODE_REVIEW_CHECKLIST.md`  | Review categories and self-review format      |
| `20_MODULE_DONE_CRITERIA.md`   | Universal module completion rules             |
| `21_CURSOR_WORKFLOW.md`        | Human → Cursor → ChatGPT review workflow      |

## Related documents

- Master PRD: `/master-prd-for-vyken.md` (product requirements source)
- Steering docs: `/docs/steering/` (implementation rules)

## Do / Do not

**Do:**

- Treat steering docs as binding constraints during implementation.
- Update steering docs only when the human approves a deliberate product or architecture change.
- Cross-reference related steering files when making decisions.

**Do not:**

- Invent product features not in scope documents.
- Skip reading steering docs before coding.
- Claim compliance, certification, or vendor facts not supported by reviewed tool profiles.
