# Tool Profile Review Process

How Vyken reviewers maintain accurate, source-backed AI tool profiles.

## When to review

- Initial seed (Module 4)
- Vendor publishes material policy changes
- User or admin flags outdated information
- Before bumping `profile_version`

## Source priority

1. Official vendor trust / security / privacy pages
2. Official vendor help center
3. Official vendor legal / privacy terms
4. Official vendor trust portal
5. Reputable security reporting — **risk context only**, not sole basis for vendor claims
6. Avoid random SEO blogs; mark confidence lower if used

## Review steps

1. **Identify product scope** — consumer vs business/enterprise/API; do not generalize.
2. **Collect sources** — record URL, label, source type, review date, and what each source supports.
3. **Draft notes** — concise summaries only; no long policy excerpts.
4. **Mark unknowns** — use explicit unknown/plan-dependent wording.
5. **Set confidence** — high only when official docs clearly support claims; use medium/low when gaps exist.
6. **Set flags** — file uploads, meeting transcripts, coding relevance, agentic/connected relevance.
7. **Create new version** — increment `profile_version`; set previous to `archived` if superseded.
8. **Update source register** — `docs/tool-profiles/source-register.md`.
9. **Validate** — `pnpm tool-profiles:validate` after seed/DB update.

## Handling uncertain facts

| Situation | Wording |
|-----------|---------|
| Not in official docs | *Unknown / not confirmed from reviewed public documentation.* |
| Plan-specific | *Plan-dependent; requires organization-specific review.* |
| Retention unclear | *Retention details were not confirmed from reviewed public documentation.* |
| Sensitive data caution | *Use with sensitive, regulated, or confidential data should be reviewed before approval.* |

## Avoiding hallucinated claims

- Every training, retention, deletion, audit, or compliance note must trace to a source.
- Do not assert certification (SOC2, ISO) unless the vendor's current trust page documents it.
- Do not copy full policy text into the database.
- If two sources conflict, lower confidence and note the conflict in `source_confidence_notes`.

## Versioning rules

- Published profiles are **immutable snapshots**.
- Material changes → new row with bumped `profile_version`.
- Update `last_reviewed_at` and `reviewed_by` on each review.
- Reports reference the version active at generation time.

## Confidence guidelines

| Level | Use when |
|-------|----------|
| high | Multiple official sources; clear enterprise/consumer distinction documented |
| medium | Official sources exist but gaps remain (e.g., consumer tier unclear) |
| low | Limited trust docs or cautionary policy language (e.g., broad processing purposes) |
| unknown | Review not completed — avoid asserting vendor facts |

## Category-specific checks

**Meeting assistants:** participant consent, transparency, transcript sharing, retention/deletion.

**Coding assistants:** source code exposure, secrets, repo permissions, human review, generated code security.

**Automation/agents:** connected app permissions, least privilege, approval flows, audit logs.

**Workplace copilots:** permissions hygiene, oversharing, agent/extension terms.
