# Recommendation Model v1.0

Model version: `v1.0-framework-informed`

## Template library

~27 deterministic recommendation templates in `recommendation-library.ts`, each with:

- Trigger signal IDs and optional category score thresholds
- Default priority and effort
- Implementation steps, why-it-matters text, caveats
- Vyken Guard relevance mapping (for future Module 10/17 use — no sales CTA in Module 9)

## Trigger logic

Templates fire when:

1. Any `triggerSignalIds` match session signals, OR
2. Related category score meets `minCategoryRiskLevel`

Duplicate triggers merge by `recommendationId`, keeping highest priority.

## Priority rules

- `urgent`: secrets/health/KYC signals, critical combinations (agentic + internal systems)
- `high`: high-severity signals, high/critical category scores
- `medium`: default for governance and hygiene improvements
- `low`: fallback `periodically_review_ai_usage_and_governance` for genuinely low-risk sessions

Low scoring confidence adds a caveat but does not automatically downgrade priority.

## Finding generation

Signals are grouped into up to 7 findings by category/theme to reduce noise. Each finding preserves `sourceSignalIds` and evidence.

## Recommendation cap

Top **8** recommendations stored after priority sort.

## Caveats

- Framework-informed, not legal advice
- Low-confidence scoring adds visibility caveat
- Controls depend on vendor capabilities

## Vyken Guard relevance

Mapped per template as `none` | `low` | `medium` | `high` for future product bridging. Not displayed as sales copy in Module 9.

## Future versioning

Bump `RECOMMENDATION_MODEL_VERSION` when templates, triggers, or priority rules change materially.
