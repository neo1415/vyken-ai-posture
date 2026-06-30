# 21 — Cursor Workflow

## Purpose

Define the human → Cursor → ChatGPT review workflow and required output formats for every module.

## What it controls

- Order of operations for all build modules
- Completion report structure
- External review handoff

## Workflow (10 steps)

| Step | Actor | Action |
|------|-------|--------|
| 1 | Human | Provides module PRD to Cursor |
| 2 | Cursor | Reads steering docs (`docs/steering/`, `docs/README.md`) |
| 3 | Cursor | Writes implementation plan (before code) |
| 4 | Cursor | Implements module in small batches |
| 5 | Cursor | Runs self-review (`19_CODE_REVIEW_CHECKLIST.md`) |
| 6 | Cursor | Returns detailed implementation breakdown |
| 7 | Human | Copies Cursor breakdown to ChatGPT |
| 8 | ChatGPT | Reviews against PRD and steering docs |
| 9 | ChatGPT | Approves next module OR lists fixes |
| 10 | Cursor | Applies fixes before proceeding |

**Do not start Module N+1 until Step 9 approves Module N.**

## Cursor prompt template (for humans)

```text
Read /docs/README.md and all steering docs listed in Module [N] PRD.
Read 18_AI_AGENT_RULES.md and 21_CURSOR_WORKFLOW.md.
Then implement Module [N] per the module PRD.
Do not build out-of-scope features.
Return the Module Completion Report when done.
```

## Required Cursor module completion report

```text
# Module Completion Report

## Module implemented
-

## Steering docs read
-

## Files created
-

## Files modified
-

## What was built
-

## Product requirements satisfied
-

## Security requirements satisfied
-

## Architecture/component rules followed
-

## Validation and error handling
-

## Tests/checks run
-

## Self-review findings
-

## Known limitations
-

## Questions or risks before next module
-

## Ready for external review?
Yes/No

## Safe to proceed to next module?
Yes / Yes with noted limitations / No
```

## Module 0 completion report (additional sections)

Module 0 also requires the extended report format from Module 0 PRD Section 10, including:

- Summary of each document
- Product boundaries captured
- Security rules captured
- Architecture rules captured
- AI-agent workflow captured

## Fix loop

When ChatGPT returns fixes:

1. Human pastes fix list to Cursor.
2. Cursor reads original module PRD + steering docs again if needed.
3. Cursor applies fixes only — no scope expansion.
4. Cursor returns updated completion report with "Issues found and fixed" section.
5. Human re-submits to ChatGPT until approved.

## Do / Do not

**Do:**
- Keep completion reports factual and file-specific.
- List steering docs actually read, not assumed.

**Do not:**
- Skip external review between modules.
- Combine multiple modules in one Cursor pass without human approval.

## Acceptance criteria

- Every module in project history has a stored completion report.
- Module 0 report approved before Module 1 begins.

## Related documents

- [18_AI_AGENT_RULES.md](./18_AI_AGENT_RULES.md)
- [19_CODE_REVIEW_CHECKLIST.md](./19_CODE_REVIEW_CHECKLIST.md)
- [20_MODULE_DONE_CRITERIA.md](./20_MODULE_DONE_CRITERIA.md)
- [/docs/README.md](../README.md)
