# Scoring Model v1 — Framework-informed

Model version: `v1.0-framework-informed`

## Philosophy

- Framework-informed, deterministic, and conservative.
- Not a legal opinion, compliance certification, audit, or live scan.
- Based on self-reported answers and curated tool profile metadata (with confidence levels).

## Categories and weights

Weights sum to 1:

- `visibility_and_inventory`: 0.18
- `data_exposure`: 0.22
- `governance_controls`: 0.20
- `vendor_and_tool_risk`: 0.14
- `agentic_and_coding_risk`: 0.16
- `decision_impact_risk`: 0.10

## Score bands

For category scores and overall score:

- 0–24: low
- 25–49: moderate
- 50–74: high
- 75–100: critical

## Signal taxonomy

Signals are generated from:

- Tool selection state (known/unknown/not sure)
- Tool profile confidence and capability flags
- Assessment wizard answers
- Company profile context (industry lens)

Signals are unique by `signalId` and merged deterministically when multiple triggers fire.

## Non-averaging escalation rules (conservative floors)

The overall risk level may be elevated above a simple weighted average when combinations suggest higher risk:

- Sensitive data + personal accounts + weak visibility/logging → at least high (critical in regulated industries)
- Agentic/high-agency signals combined with sensitive exposure → critical
- Regulated industry lens combined with weak controls → at least high

These rules are intended to avoid “averaging away” critical drivers.

## Confidence model

Confidence is separate from risk.

Start at high, downgrade when:

- Tool selection includes “not sure”
- Unknown tools exist
- Tool profile confidence is low/unknown
- Many `not_sure` answers, especially on key visibility/exposure questions

## Future versions

Future scoring versions must:

- Introduce a new `scoringModelVersion`
- Remain deterministic and explainable
- Maintain backward compatibility for stored snapshots (do not reinterpret historical results silently)

