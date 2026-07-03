# Event Tracking — Security Notes

## No third-party analytics

No Google Analytics, Meta pixel, LinkedIn tag, heatmaps, or external SDKs.

## Server-only writes

All event inserts go through server repositories/services or server actions. No client DB access.

## Data minimization

Metadata is allowlisted and capped at 2 KB serialized. No raw answers, report JSON, PDF paths, or secrets.

## CTA validation

Client may only submit allowlisted destination types (`request_review`, `vyken_guard`). Event types are mapped server-side to schema enums.

## Public report access

No public PDF download routes or signed URLs. Email delivery requires captured lead + consent.

## Admin tracking

Admin audit events use internal session/entity IDs in the database only — not shown in admin UI view models.

## RLS

No new broad RLS policies. Existing server-only insert patterns unchanged.
