# Tool Profiles

Curated, source-backed AI tool profiles for the Vyken AI Risk Assessment Hub.

## Purpose

The assessment evaluates organizational AI tool stack risk using **reviewed vendor facts**, not live scraping or invented claims. Tool profiles power:

- Tool selector UI (Module 6)
- Assessment context (Module 7)
- Scoring inputs (Module 8)
- Report tool sections (Module 12)

## Schema relationship

```text
ai_tool_categories 1──* ai_tools 1──* ai_tool_profile_versions
```

| Table                      | Role                                                |
| -------------------------- | --------------------------------------------------- |
| `ai_tool_categories`       | Taxonomy (general assistant, coding, meeting, etc.) |
| `ai_tools`                 | Stable tool identity (slug, name, website)          |
| `ai_tool_profile_versions` | Immutable versioned profile snapshot                |

Reports snapshot `profile_version` at generation time — never overwrite published versions in place.

## Confidence levels

| Level       | Meaning                                                           |
| ----------- | ----------------------------------------------------------------- |
| **high**    | Clear official documentation reviewed; suitable for sourced notes |
| **medium**  | Partial official coverage; some plan-dependent gaps               |
| **low**     | Limited or cautionary official information                        |
| **unknown** | Not reviewed; do not assert vendor facts                          |

Confidence is displayed in UI and report footnotes — it is **not** a safety rating.

## What must never be claimed

- The assessment does **not** certify or validate a tool.
- Profiles must **not** label tools "safe" or "unsafe."
- Do not invent SOC2, retention periods, or training-use rules.
- Consumer and enterprise plans must not be conflated.
- Unknown facts use: _Unknown / not confirmed from reviewed public documentation._

## Source tracking

Each profile version stores `sources` (JSONB array) with label, URL, source type, review date, and usage notes. Internal `review_notes` are for reviewers only and are not exposed via the public service layer.

## Updating profiles

1. Review official vendor documentation (see [profile-review-process.md](./profile-review-process.md)).
2. Create a **new** `profile_version` row (e.g., `1.1`) — do not mutate published snapshots.
3. Update [source-register.md](./source-register.md).
4. Re-run `pnpm db:seed` (idempotent) or insert via admin tooling (Module 16).
5. Run `pnpm tool-profiles:validate`.

## Server access

- **Repository:** `src/server/repositories/tool-profiles.repository.ts`
- **Service:** `src/server/services/tool-profiles.service.ts`

Client Components must not import database or repository code.

## MVP tools (15)

ChatGPT, Claude, Google Gemini, Microsoft Copilot, Perplexity, DeepSeek, GitHub Copilot, Cursor, Notion AI, Grammarly, Otter, Fireflies, Fathom, Canva AI, Zapier AI.

Seed data: `src/lib/db/seeds/tool-profiles.ts`
