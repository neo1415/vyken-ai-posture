# Event Taxonomy

## Public assessment (`audit_logs`, `actorType: anonymous_server_flow`)

| Action | When |
| ------ | ---- |
| `assessment_started` | Company profile session created |
| `company_profile_completed` | Profile saved |
| `tools_selected` | Tool selection saved |
| `usage_assessment_completed` | Assessment answers saved |
| `result_viewed` | Results page loaded (once per session) |
| `lead_capture_viewed` | Results page shown before lead captured (once per session) |

Metadata keys: `sourcePage`, `riskLevel`, `toolCount`, `unknownToolCount`, `hasNotSure`.

## CTA (`cta_events`)

Schema enums (no migration):

| Client destination | `event_type` | `destination_type` |
| ------------------ | ------------ | ------------------ |
| `request_review` | `request_review_clicked` | `request_review` |
| `vyken_guard` | `vyken_guard_clicked` | `vyken_guard` |

Deduped within 30 seconds per session + type + destination.

Metadata: `sourcePage`, `ctaDestination`.

## Lead (`lead_events`)

| `event_type` | When |
| ------------ | ---- |
| `report_requested` | First lead capture for session/email (deduped) |
| `status_changed` | Admin updates lead status |

## Admin (`audit_logs`, `actorType: admin`)

| Action | When |
| ------ | ---- |
| `admin_lead_viewed` | Admin opens lead detail (once per session entity) |
| `admin_lead_status_updated` | Status form saved |
| `admin_email_send_clicked` | First report email send from admin |
| `admin_email_resend_clicked` | Force resend from admin |

## Not duplicated

- `email_events` — report email delivery (Module 14)
- Tool profile audit from Module 16 (`tool_created`, `profile_published`, etc.)

## Schema limitation

PRD lifecycle names like `lead_captured` map to `lead_events.report_requested` on first capture because `lead_event_type` enum has no `lead_captured` value. No migration added per module scope.
