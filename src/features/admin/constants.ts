export const ADMIN_DASHBOARD_MODULE_VERSION = "admin-dashboard-v1" as const;

export const ADMIN_DEFAULT_PAGE = 1 as const;
export const ADMIN_DEFAULT_LIMIT = 25 as const;
export const ADMIN_MAX_LIMIT = 100 as const;
export const ADMIN_MAX_SEARCH_LENGTH = 120 as const;

export const ADMIN_LEAD_STATUS_OPTIONS = [
  "new",
  "contacted",
  "qualified",
  "booked",
  "not_ready",
  "closed",
  "ignore_spam",
] as const;

export type AdminLeadStatus = (typeof ADMIN_LEAD_STATUS_OPTIONS)[number];

export const ADMIN_RISK_FILTER_OPTIONS = [
  "low",
  "moderate",
  "high",
  "critical",
] as const;

export const ADMIN_EMAIL_STATUS_FILTER_OPTIONS = [
  "sent",
  "failed",
  "not_sent",
  "partial",
] as const;

export const ADMIN_EMAIL_DELIVERY_LABELS: Record<string, string> = {
  sent: "Sent",
  failed: "Failed",
  not_sent: "Not sent",
  partial: "Partial",
  pending: "Pending",
};

export const ADMIN_REPORT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  generated: "Generated",
  failed: "Failed",
  expired: "Expired",
};

export const ADMIN_LEAD_STATUS_LABELS: Record<AdminLeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  booked: "Booked",
  not_ready: "Not ready",
  closed: "Closed",
  ignore_spam: "Ignore / spam",
};

export const ADMIN_INTERNAL_RECIPIENT_LABEL = "Vyken internal team";
