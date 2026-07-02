# Scoring (Module 8)

Module 8 computes framework-informed risk signals and risk scores from:

- Company profile context
- Selected AI tools (including unknown and not-sure selection state)
- Tool profile metadata and confidence levels
- Structured assessment wizard answers

## What this module does

- Generates structured risk signals (`assessment_risk_signals`)
- Computes category scores and overall risk score (`assessment_scores.score_breakdown`)
- Persists results server-side with deterministic logic
- Supports safe recomputation (replace previous score/signals)

## What this module does not do

- Recommendations (Module 9)
- Findings (Module 9/10)
- Final results page UI (Module 10)
- Reports/PDF/email/leads/admin/auth/analytics
- External AI calls or external APIs

## Categories

- `visibility_and_inventory`
- `data_exposure`
- `governance_controls`
- `vendor_and_tool_risk`
- `agentic_and_coding_risk`
- `decision_impact_risk`

## Persistence

- `assessment_scores`:
  - Stores risk levels in existing columns
  - Stores the full scoring snapshot in `score_breakdown` (JSONB), including:
    - `overallScore` (0–100)
    - `overallRiskLevel`
    - `confidenceLevel`
    - `categoryScores`
    - `signals`
    - `scoringSummary`
    - `scoringModelVersion`

- `assessment_risk_signals`:
  - One row per signal with `signal_key`, `severity`, and `source_answer_ids`

## Results placeholder behavior

`/ai-risk-assessment/results?session=<public_token>` computes a limited scoring preview server-side and displays:

- Overall score
- Overall risk level
- Confidence level
- Signal count

It does not show recommendations or final report language.
