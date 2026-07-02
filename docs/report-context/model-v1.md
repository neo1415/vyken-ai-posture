# Report Context Model v1

## Version

`report-context-v1` (`REPORT_CONTEXT_VERSION`)

## Top-level shape

| Block | Purpose |
|-------|---------|
| `assessment` | Public token, status, completion timestamp |
| `company` | Human-readable company profile |
| `lead` | Optional lead capture context |
| `tools` | Known/unknown/not-sure tool summary |
| `riskSummary` | Overall score, level, headline |
| `categoryScores` | Six category dimensions |
| `findings` | Assessment findings |
| `recommendations` | Up to 8 recommendations |
| `appendix` | Methodology, frameworks, limitations, data sources |

## Section map (Module 13)

1. cover
2. executive_summary
3. company_context
4. ai_tool_context
5. risk_score_summary
6. category_risk_breakdown
7. key_findings
8. recommended_next_steps
9. methodology
10. limitations_and_caveats

## Persistence

Stored in `reports.report_context` JSONB. One row per `assessment_session_id` (unique index). Status `pending` until Module 13 generates PDF.

## Future versioning

When schema changes, bump `reportContextVersion` and add migration/transform logic in a future module.
