# 20 — Module Done Criteria

## Purpose

Universal definition of "done" for every implementation module in the Vyken AI Risk Assessment Hub.

## What it controls

- Module completion gates
- Proceed-to-next-module decisions
- Quality bar for external review

## A module is not done until

| Criterion | Verification |
|-----------|--------------|
| Satisfies module PRD | Every requirement traced in completion report |
| Follows steering docs | Listed docs read and adhered to |
| Clear file organization | Matches `14_ARCHITECTURE.md` |
| No obvious security flaws | `15_SECURITY_STANDARD.md` checklist |
| No giant unnecessary files | Pages/components < 300 lines or justified |
| No duplicated core logic | Single scoring/signal/recommendation paths |
| Validates input | Zod on server actions |
| Handles errors | User-friendly errors; no secret leakage |
| Mobile-conscious (if UI) | Tested at 375px width |
| Documents changed files | Listed in completion report |
| Passes or prepares checks | Lint, typecheck, tests run or explained |
| Provides self-review | `19_CODE_REVIEW_CHECKLIST.md` format |

## Module completion report requirement

Every module must end with the report format in `21_CURSOR_WORKFLOW.md`.

## Proceed-to-next-module rule

> Future module reports must state whether the module is **safe to proceed to the next module**.

Allowed values:

- **Yes** — All criteria met; ready for external review.
- **Yes with noted limitations** — Minor gaps documented; human approved.
- **No** — Blockers listed; do not start next module.

Module 0 specifically: **No product code** until external review approves steering docs.

## Module-specific additions (reference)

| Module | Extra done criteria |
|--------|---------------------|
| Database | All tables + RLS policies applied |
| Tool profiles | 15 tools seeded with confidence levels |
| Scoring | 10 test scenarios pass |
| Reports | 18 PDF sections render; snapshot stored |
| Admin | Auth + authz on all routes |
| Email | Delivery events logged |

## Do / Do not

**Do:**
- Block merge if security category fails self-review.
- List "Issues remaining" honestly.

**Do not:**
- Mark done with failing tests in scoring/report modules.
- Skip self-review for documentation-only modules (still review completeness).

## Acceptance criteria

- Completion report includes proceed yes/no statement.
- External reviewer can reject incomplete modules using this doc.

## Related documents

- [02_PRODUCT_SCOPE.md](./02_PRODUCT_SCOPE.md)
- [19_CODE_REVIEW_CHECKLIST.md](./19_CODE_REVIEW_CHECKLIST.md)
- [21_CURSOR_WORKFLOW.md](./21_CURSOR_WORKFLOW.md)
