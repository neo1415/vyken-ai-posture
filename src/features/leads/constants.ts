import type { FollowUpInterest } from "./types";

export const LEAD_CAPTURE_MODULE_VERSION = "lead-capture-v1" as const;

export const WORK_EMAIL_MAX_LENGTH = 254 as const;
export const FULL_NAME_MAX_LENGTH = 120 as const;
export const COMPANY_NAME_MAX_LENGTH = 160 as const;
export const ROLE_TITLE_MAX_LENGTH = 120 as const;

export const LEAD_CONSENT_TEXT =
  "I agree to be contacted about this assessment and related AI governance follow-up.";

export const PLACEHOLDER_EMAIL_PATTERNS = [
  /^test@test\.com$/i,
  /^example@example\.com$/i,
  /^no-reply@/i,
] as const;

export const FOLLOW_UP_INTEREST_OPTIONS: ReadonlyArray<{
  value: FollowUpInterest;
  label: string;
}> = [
  {
    value: "send_report_when_ready",
    label: "Send the report when ready",
  },
  {
    value: "discuss_ai_governance",
    label: "Discuss AI governance next steps",
  },
  {
    value: "evaluate_vyken_guard",
    label: "Learn more about Vyken Guard",
  },
  {
    value: "not_sure_yet",
    label: "Not sure yet",
  },
];

export const LEAD_CAPTURE_COPY = {
  title: "Want a shareable report version?",
  body: "Your result stays visible here. Leave your work email if you want the report delivery step and follow-up context prepared.",
  workEmailLabel: "Work email",
  fullNameLabel: "Full name",
  companyNameLabel: "Company name",
  roleTitleLabel: "Role / title",
  followUpInterestLabel: "Follow-up interest",
  followUpInterestPlaceholder: "Choose an option (optional)",
  submitLabel: "Request report follow-up",
  submittingLabel: "Saving request…",
  successMessage:
    "Thanks. Your result remains available here, and your report follow-up request has been saved.",
  errorMessage:
    "We could not save your request. Please check the details and try again.",
  invalidSessionMessage:
    "This assessment session could not be verified. Please restart the assessment.",
  privacyNote:
    "We'll use these details only to follow up about this assessment and related AI governance/report delivery context. Do not enter confidential business data in this form.",
  resultVisibleNote:
    "Your assessment result remains visible on this page before and after you submit this form.",
} as const;

export const LEAD_CAPTURE_BANNED_COPY_PATTERNS = [
  /unlock your result/i,
  /hidden until you submit/i,
  /claim your free audit/i,
  /get certified/i,
  /guaranteed compliance/i,
] as const;
