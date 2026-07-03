export const EMAIL_DELIVERY_MODULE_VERSION = "email-delivery-v1" as const;

export const USER_REPORT_EMAIL_TYPE = "user_report" as const;
export const INTERNAL_NOTIFICATION_EMAIL_TYPE =
  "internal_notification" as const;

export type EmailDeliveryOutcome =
  "sent" | "already_sent" | "partial_failure" | "failed";

export type EmailDeliveryResult = {
  outcome: EmailDeliveryOutcome;
  userEmailSent: boolean;
  internalEmailSent: boolean;
  userEmailStatus: "sent" | "skipped" | "failed" | "already_sent";
  internalEmailStatus: "sent" | "skipped" | "failed";
  provider: string;
};

export type EmailDeliveryStatus = {
  hasSuccessfulUserReportEmail: boolean;
  userReportEmailSentAt: string | null;
  internalNotificationSent: boolean;
  reportStatus: string;
  leadEmail: string | null;
};

export class EmailDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}
