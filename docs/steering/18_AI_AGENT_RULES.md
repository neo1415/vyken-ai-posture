# 18 — AI Agent Rules

## Purpose

Mandatory behavior for Cursor and other AI coding agents working on this repository.

## What it controls

- Pre-implementation reading requirements
- Implementation discipline
- Security and product boundaries
- Post-implementation self-review

## Mandatory agent workflow

Every task must follow:

1. **Read** relevant steering docs (minimum: this file, `21_CURSOR_WORKFLOW.md`, module-specific docs).
2. **Produce implementation plan** before writing code.
3. **Work in small batches** — one logical unit per pass.
4. **Avoid unrelated changes** — no drive-by refactors.
5. **Keep code modular** per `14_ARCHITECTURE.md`.
6. **Run self-review** after code per `19_CODE_REVIEW_CHECKLIST.md`.
7. **Run checks** (lint, typecheck, tests) or explain why not run.
8. **Summarize changed files** in module completion report.
9. **Identify security impact** explicitly.
10. **Identify performance impact** when relevant.
11. **Identify known limitations** honestly.
12. **Stop if scope unclear** — ask human instead of inventing major features.
13. **Never overclaim** compliance or security in user-facing strings.
14. **Never create fake vendor facts** — use unknown/low confidence.
15. **Never expose secrets** in code, logs, or commits.
16. **Never trust frontend scores** as source of truth.

## Pre-implementation reading

| Module type | Required reading |
|-------------|------------------|
| Any | `18_AI_AGENT_RULES.md`, `21_CURSOR_WORKFLOW.md`, `20_MODULE_DONE_CRITERIA.md` |
| UI | `16_DESIGN_SYSTEM.md`, `17_COMPONENT_RULES.md` |
| Assessment | `08_QUESTION_SCHEMA.md`, `09_SIGNAL_MAPPING.md` |
| Scoring | `10_SCORING_MODEL.md`, `09_SIGNAL_MAPPING.md` |
| Reports | `12_REPORT_ENGINE.md`, `11_RECOMMENDATION_LIBRARY.md` |
| Database | `13_DATABASE_SCHEMA_PLAN.md`, `15_SECURITY_STANDARD.md` |
| Admin | `15_SECURITY_STANDARD.md`, `02_PRODUCT_SCOPE.md` |

## Forbidden behavior

| Forbidden | Why |
|-----------|-----|
| "Build everything at once" | Unreviewable, error-prone |
| "Make a giant page" | Violates architecture limits |
| "Calculate score only in React state" | Security and correctness |
| "Skip validation" | ASVS violation |
| "Skip RLS" | Data exposure |
| "Use service key in client" | Critical secret leak |
| "Invent AI vendor policy details" | Product integrity |
| "Add dependencies without justification" | Attack surface |
| Build product features in Module 0 | Scope violation |
| Create placeholder steering docs | Module 0 failure |

## Implementation plan format (before code)

```text
## Implementation Plan
- Module:
- Steering docs read:
- Files to create/modify:
- Approach:
- Security considerations:
- Out of scope:
```

## Scope discipline

- If module PRD is silent on a feature, **do not invent it**.
- If steering docs conflict with module PRD, **stop and ask human**.
- Prefer extending existing patterns over new abstractions.

## Product language discipline

When writing copy or report templates:

- Use: "may indicate", "suggests", "framework-informed", "based on your answers"
- Avoid: "certified", "compliant", "proves", "full audit", "legal advice"

## Do / Do not

**Do:**
- Cite steering doc sections when making architectural choices.
- Leave Module 0 as docs-only unless repo bootstrap explicitly requested.

**Do not:**
- Proceed to next module without human/external review approval.
- Commit secrets or `.env` files.

## Acceptance criteria

- Every future module report lists steering docs read.
- Self-review included in every completion report.
- Zero forbidden behaviors in merged code.

## Related documents

- [21_CURSOR_WORKFLOW.md](./21_CURSOR_WORKFLOW.md)
- [19_CODE_REVIEW_CHECKLIST.md](./19_CODE_REVIEW_CHECKLIST.md)
- [20_MODULE_DONE_CRITERIA.md](./20_MODULE_DONE_CRITERIA.md)
