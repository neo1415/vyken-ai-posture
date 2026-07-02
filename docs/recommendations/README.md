# Recommendations (Module 9)

Module 9 converts scored risk signals into structured, prioritized, framework-informed findings and recommendations.

## What this module does

- Generates structured findings from scoring signals (`assessment_findings`)
- Generates deterministic recommendations from findings and signals (`assessment_recommendations`)
- Prioritizes recommendations (urgent → low) and assigns effort levels
- Persists findings and recommendations server-side with transactional replace on recompute
- Exposes a limited results placeholder with counts only

## What this module does not do

- Final results page UI (Module 10)
- Full recommendation display in the public UI
- PDF reports, email delivery, lead capture
- Admin dashboard, auth, analytics
- External AI-generated recommendations
- Sales CTA flow

## Finding categories

Aligned to scoring categories:

- `visibility_and_inventory`
- `data_exposure`
- `governance_controls`
- `vendor_and_tool_risk`
- `agentic_and_coding_risk`
- `decision_impact_risk`

## Recommendation categories

- `policy_and_governance`
- `tool_inventory_and_approval`
- `data_protection`
- `logging_and_auditability`
- `vendor_risk_review`
- `human_review_and_decision_controls`
- `developer_ai_controls`
- `agentic_ai_controls`
- `training_and_awareness`

## Priority model

`urgent` → `high` → `medium` → `low`

Priority considers signal severity, category scores, sensitive data presence, agentic/coding risk, decision impact, and scoring confidence (via caveats).

## Effort model

`low` | `medium` | `high` — separate from severity/priority.

## Persistence

- `assessment_findings`: `finding_key`, `title`, `summary`, `severity`, extended metadata in `framework_mapping` JSONB
- `assessment_recommendations`: `recommendation_key`, `title`, `severity` (priority mapped), `recommended_actions`, `sort_order`, extended metadata in `framework_mapping` JSONB

Recompute deletes prior rows and inserts fresh findings/recommendations in one transaction.

## Next module handoff

Module 10 will render the full public results page using persisted scores, findings, and recommendations. Module 9 stores up to 8 top recommendations sorted by priority.
