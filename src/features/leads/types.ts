export const FOLLOW_UP_INTEREST_VALUES = [
  "send_report_when_ready",
  "discuss_ai_governance",
  "evaluate_vyken_guard",
  "not_sure_yet",
] as const;

export type FollowUpInterest = (typeof FOLLOW_UP_INTEREST_VALUES)[number];

export type LeadCaptureRawFormInput = {
  publicToken: string;
  workEmail: string;
  fullName: string;
  companyName: string;
  roleTitle: string;
  followUpInterest: string;
  consent: boolean;
};

export type LeadCaptureInput = {
  publicToken: string;
  workEmail: string;
  fullName: string | null;
  companyName: string | null;
  roleTitle: string | null;
  followUpInterest: FollowUpInterest | null;
  consent: true;
};

export type LeadCaptureFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof LeadCaptureRawFormInput, string[]>>;
  values?: LeadCaptureRawFormInput;
};

export const INITIAL_LEAD_CAPTURE_FORM_STATE: LeadCaptureFormState = {
  status: "idle",
};

export type LeadCaptureActionResult = LeadCaptureFormState;

export type LeadCaptureServiceResult = {
  success: true;
};
