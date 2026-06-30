# 07 — Tool Profile Schema

## Purpose

Define the curated AI tool database schema, confidence rules, versioning, and MVP seed list.

## What it controls

- `ai_tools` and `ai_tool_profile_versions` table shape (see `13_DATABASE_SCHEMA_PLAN.md`)
- Admin tool profile editing fields
- Report tool section content
- Confidence display in UI and PDF

## Schema fields

| Field | Type | Description |
|-------|------|-------------|
| `tool_id` | UUID/string | Stable primary identifier |
| `name` | string | Display name (e.g., "ChatGPT") |
| `slug` | string | URL-safe unique slug |
| `category` | enum/FK | Reference to `ai_tool_categories` |
| `logo_url` or `icon_key` | string | Asset reference for UI cards |
| `website_url` | string | Official product URL |
| `public_privacy_url` | string? | Link to privacy policy |
| `public_security_url` | string? | Security/trust center URL |
| `public_trust_url` | string? | Enterprise trust/compliance page |
| `common_use_cases` | string[] | Workplace use case tags |
| `supports_file_uploads` | boolean | Known upload capability |
| `supports_meeting_transcripts` | boolean | Meeting/audio transcription relevance |
| `coding_assistant_relevance` | enum | none / low / medium / high |
| `agentic_or_connected_tool_relevance` | enum | none / low / medium / high |
| `training_use_notes` | text | Curated notes on training/data use (sourced, not invented) |
| `data_retention_notes` | text | Retention behavior summary |
| `deletion_control_notes` | text | User/org deletion controls |
| `enterprise_admin_controls_notes` | text | Admin, SSO, DLP notes |
| `audit_logging_notes` | text | Vendor logging capabilities |
| `compliance_security_docs_notes` | text | SOC2, ISO certs mention if publicly documented |
| `subprocessor_notes` | text | Known subprocessors summary |
| `sensitive_data_concerns` | text | Curated risk notes for assessors |
| `recommended_usage_boundaries` | text | Suggested organizational boundaries |
| `public_info_confidence_level` | enum | high / medium / low / unknown |
| `last_reviewed_at` | timestamp | Human review date |
| `reviewed_by` | string | Reviewer identifier |
| `profile_version` | semver/string | e.g., 1.0.0 — increments on material change |
| `published_status` | enum | draft / published / archived |

## Confidence levels

| Level | Criteria |
|-------|----------|
| **high** | Clear public documentation; reviewed within 6 months |
| **medium** | Some public docs; partial gaps |
| **low** | Limited or conflicting public information |
| **unknown** | Not yet reviewed; do not assert vendor claims |

## Versioning rules

1. Published profiles are immutable snapshots — edits create new `profile_version` row.
2. Reports store `tool_profile_versions` used at generation time.
3. Material policy changes require version bump and `last_reviewed_at` update.
4. Never overwrite historical versions referenced by past reports.

## Critical rule

**The system must not invent vendor claims.** If information is not reviewed, mark `unknown` or `low` confidence and recommend internal vendor review in the report.

## Tool categories (MVP)

1. General AI assistants
2. AI search/research
3. Workplace copilots
4. Coding assistants
5. Meeting assistants
6. Writing/productivity
7. Design/media
8. Automation/agents

## MVP seeded tools (15 minimum)

| Tool | Category |
|------|----------|
| ChatGPT | General AI assistants |
| Claude | General AI assistants |
| Google Gemini | General AI assistants |
| Microsoft Copilot | Workplace copilots |
| Perplexity | AI search/research |
| DeepSeek | General AI assistants |
| GitHub Copilot | Coding assistants |
| Cursor | Coding assistants |
| Notion AI | Writing/productivity |
| Grammarly | Writing/productivity |
| Otter | Meeting assistants |
| Fireflies | Meeting assistants |
| Fathom | Meeting assistants |
| Canva AI | Design/media |
| Zapier AI | Automation/agents |

Seed profiles may start with `unknown` or `medium` confidence where public review is pending — **never fabricate SOC2, retention, or training-use claims**.

## Example profile stub (structure only)

```json
{
  "tool_id": "chatgpt",
  "name": "ChatGPT",
  "slug": "chatgpt",
  "category": "general_ai_assistants",
  "supports_file_uploads": true,
  "supports_meeting_transcripts": false,
  "coding_assistant_relevance": "low",
  "agentic_or_connected_tool_relevance": "medium",
  "public_info_confidence_level": "medium",
  "profile_version": "1.0.0",
  "published_status": "published",
  "training_use_notes": "Review OpenAI enterprise and consumer terms before asserting training use rules for your deployment.",
  "recommended_usage_boundaries": "Avoid entering regulated or confidential data without enterprise controls and contractual review."
}
```

## Do / Do not

**Do:**
- Link to official public URLs only.
- Display confidence level in tool cards and report footnotes.
- Allow unknown tool requests to queue admin review.

**Do not:**
- Scrape or auto-generate vendor policy text in MVP.
- Present low-confidence notes as verified facts.
- Use tool profiles to label tools "safe" or "unsafe."

## Acceptance criteria

- All 15 MVP tools exist as published or draft-with-unknown-confidence records.
- Version field increments on profile updates.
- Reports snapshot versions at generation.

## Related documents

- [13_DATABASE_SCHEMA_PLAN.md](./13_DATABASE_SCHEMA_PLAN.md)
- [12_REPORT_ENGINE.md](./12_REPORT_ENGINE.md)
- [15_SECURITY_STANDARD.md](./15_SECURITY_STANDARD.md) — no invented facts
