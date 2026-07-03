export const EVENT_TRACKING_MODULE_VERSION = "event-tracking-v1" as const;

export const CTA_LABEL_MAX_LENGTH = 120 as const;
export const SOURCE_PAGE_MAX_LENGTH = 100 as const;
export const EVENT_METADATA_MAX_BYTES = 2048 as const;

export const CTA_DEDUPE_WINDOW_MS = 30_000 as const;

export const CLIENT_CTA_DESTINATIONS = [
  "request_review",
  "vyken_guard",
] as const;

export type ClientCtaDestination = (typeof CLIENT_CTA_DESTINATIONS)[number];

export const CTA_DESTINATION_TO_EVENT = {
  request_review: {
    eventType: "request_review_clicked",
    destinationType: "request_review",
  },
  vyken_guard: {
    eventType: "vyken_guard_clicked",
    destinationType: "vyken_guard",
  },
} as const satisfies Record<
  ClientCtaDestination,
  { eventType: string; destinationType: string }
>;

export const SOURCE_PAGE_ALLOWLIST = [
  "results",
  "results_follow_up",
  "lead_capture",
] as const;

export type SourcePage = (typeof SOURCE_PAGE_ALLOWLIST)[number];

export const PUBLIC_ASSESSMENT_EVENT_ACTIONS = [
  "assessment_started",
  "company_profile_completed",
  "tools_selected",
  "usage_assessment_completed",
  "result_viewed",
  "lead_capture_viewed",
] as const;

export type PublicAssessmentEventAction =
  (typeof PUBLIC_ASSESSMENT_EVENT_ACTIONS)[number];

export const LEAD_EVENT_TYPES = [
  "report_requested",
  "report_sent",
  "cta_clicked",
  "booked_call_clicked",
  "status_changed",
  "note_added",
] as const;

export type LeadEventType = (typeof LEAD_EVENT_TYPES)[number];

export const ADMIN_AUDIT_ACTIONS = [
  "admin_lead_viewed",
  "admin_email_send_clicked",
  "admin_email_resend_clicked",
  "admin_lead_status_updated",
] as const;

export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];

export const ALLOWED_EVENT_METADATA_KEYS = [
  "sourcePage",
  "riskLevel",
  "reportStatus",
  "followUpInterest",
  "ctaDestination",
  "leadStatus",
  "toolCount",
  "unknownToolCount",
  "hasNotSure",
  "forceResend",
] as const;

export const RESULT_FOLLOW_UP_COPY = {
  title: "Want help reviewing these findings?",
  body: "Vyken can help your team turn this assessment into a practical AI governance plan.",
  requestFollowUpLabel: "Request follow-up",
  emailReportLabel: "Email my report",
  governanceLabel: "Talk to Vyken about AI governance controls",
  emailReportSuccess:
    "If eligible, your report email has been queued for delivery.",
  emailReportAlreadySent:
    "Your report email was already sent to the address you provided.",
  emailReportNeedsLead:
    "Complete the lead form with consent before requesting your report by email.",
} as const;
