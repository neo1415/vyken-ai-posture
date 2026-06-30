# 19 — Code Review Checklist

## Purpose

Standard pass/fail review categories for human and AI self-review before marking any module complete.

## What it controls

- Self-review output format after every implementation
- External ChatGPT review input quality
- Merge readiness criteria

## Review categories

### 1. Product correctness

- [ ] Implements module PRD requirements
- [ ] Respects MVP scope (`02_PRODUCT_SCOPE.md`)
- [ ] No certification or legal overclaims in copy
- [ ] User journey works end-to-end for module scope

### 2. Architecture

- [ ] Follows `14_ARCHITECTURE.md` folder structure
- [ ] Pages orchestrate; business logic in services
- [ ] No duplicated scoring/signal logic
- [ ] File sizes within limits

### 3. Security

- [ ] Server-side validation on all inputs
- [ ] No service role key in client
- [ ] Admin routes protected server-side
- [ ] RLS planned or implemented per module
- [ ] No IDOR on reports/leads/sessions
- [ ] User text escaped in PDF/email

### 4. Database

- [ ] Schema matches `13_DATABASE_SCHEMA_PLAN.md` intent
- [ ] Migrations used (when applicable)
- [ ] Indexes on foreign keys and lookup fields
- [ ] Snapshots stored where required

### 5. Validation

- [ ] Zod schemas for server actions
- [ ] Required fields enforced
- [ ] Reject unknown payload fields

### 6. Server/client boundary

- [ ] Server Components default
- [ ] `"use client"` only where needed
- [ ] No server imports in client components
- [ ] Scoring/report generation server-only

### 7. Components

- [ ] Typed props
- [ ] Reusable primitives used
- [ ] No business logic in UI components
- [ ] Accessibility basics met

### 8. Performance

- [ ] No N+1 queries in hot paths
- [ ] Reasonable bundle size for client components
- [ ] Images optimized (tool logos)

### 9. Accessibility

- [ ] Keyboard navigation
- [ ] Focus visible
- [ ] Semantic headings
- [ ] Risk not conveyed by color alone

### 10. Testing

- [ ] Scoring scenario tests (when scoring touched)
- [ ] Signal mapping tests (when signals touched)
- [ ] Lint/typecheck pass
- [ ] Critical paths manually verified

### 11. Dependencies

- [ ] New packages justified
- [ ] No known vulnerable versions (best effort)
- [ ] License compatible

### 12. Report/email safety

- [ ] Template-based generation
- [ ] Disclaimer present
- [ ] Tokens unguessable
- [ ] No secrets in email templates

### 13. Admin authorization

- [ ] Auth required on all admin pages/actions
- [ ] Role checks in service layer
- [ ] Admin actions logged

### 14. Maintainability

- [ ] Clear naming
- [ ] No dead code
- [ ] Changed files documented in module report
- [ ] Known limitations listed

## Pass/fail rule

Module passes only when **all applicable categories pass**. N/A categories must be stated with reason.

## Required self-review output format

After every implementation, include:

```text
## Self-Review Result

### Product correctness
- Pass/Fail:
- Notes:

### Architecture
- Pass/Fail:
- Notes:

### Security
- Pass/Fail:
- Notes:

### Component quality
- Pass/Fail:
- Notes:

### Performance
- Pass/Fail:
- Notes:

### Testing/checks
- Pass/Fail:
- Notes:

### Issues found and fixed
-

### Issues remaining
-

### Files changed
-
```

## Do / Do not

**Do:**
- Run self-review honestly — Fail is acceptable with documented fixes planned.
- Fix Fail items before claiming module complete.

**Do not:**
- Mark Pass without reading changed files.
- Skip security category for "small" changes.

## Acceptance criteria

- Every module completion report includes self-review block.
- External reviewer can audit against this checklist.

## Related documents

- [18_AI_AGENT_RULES.md](./18_AI_AGENT_RULES.md)
- [20_MODULE_DONE_CRITERIA.md](./20_MODULE_DONE_CRITERIA.md)
- [21_CURSOR_WORKFLOW.md](./21_CURSOR_WORKFLOW.md)
