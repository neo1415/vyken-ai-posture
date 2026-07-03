import { containsBannedTerm } from "@/features/recommendations/validation";

import {
  EMAIL_ALLOWED_DISCLAIMER,
  EMAIL_BANNED_CLAIM_PATTERNS,
  PDF_ATTACHMENT_FILENAME,
  UUID_PATTERN,
} from "./constants";
import {
  collectInternalEmailVisibleText,
  collectUserEmailVisibleText,
  type InternalNotificationEmailContent,
  type UserReportEmailContent,
} from "./email-templates";

export class EmailDeliveryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailDeliveryValidationError";
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new EmailDeliveryValidationError(message);
  }
}

function scanBannedClaims(text: string): string | null {
  for (const pattern of EMAIL_BANNED_CLAIM_PATTERNS) {
    if (pattern.test(text)) {
      return pattern.source;
    }
  }
  const banned = containsBannedTerm(text);
  if (banned) return banned;
  return null;
}

export function validateUserReportEmailContent(
  content: UserReportEmailContent,
): void {
  const visible = collectUserEmailVisibleText(content);
  assert(visible.trim().length > 0, "User email body is empty.");
  assert(
    visible.toLowerCase().includes(EMAIL_ALLOWED_DISCLAIMER),
    "User email must include the approved disclaimer.",
  );

  const banned = scanBannedClaims(visible);
  assert(banned === null, `Banned claim "${banned}" found in user email.`);

  assert(!UUID_PATTERN.test(visible), "User email must not contain raw UUIDs.");
  assert(
    !visible.includes("storage/reports") &&
      !visible.includes("assessment-reports"),
    "User email must not include storage paths.",
  );
  assert(
    !visible.includes("http://") && !visible.includes("https://"),
    "User email must not include URLs.",
  );
}

export function validateInternalNotificationEmailContent(
  content: InternalNotificationEmailContent,
): void {
  const visible = collectInternalEmailVisibleText(content);
  assert(visible.trim().length > 0, "Internal email body is empty.");

  const banned = scanBannedClaims(visible);
  assert(banned === null, `Banned claim "${banned}" found in internal email.`);

  assert(
    !visible.includes("questionId") && !visible.includes("answerValue"),
    "Internal email must not include raw answer rows.",
  );
  assert(
    !visible.includes("storage/reports") &&
      !visible.includes("assessment-reports"),
    "Internal email must not include storage paths.",
  );
  assert(
    !visible.includes("SUPABASE_SERVICE_ROLE_KEY"),
    "Internal email must not include secrets.",
  );
}

export function validatePdfAttachment(input: {
  buffer: Buffer;
  filename: string;
}): void {
  assert(input.buffer.byteLength > 0, "PDF attachment buffer is empty.");
  assert(
    input.filename === PDF_ATTACHMENT_FILENAME,
    "PDF attachment filename is not safe.",
  );
  assert(
    input.buffer.subarray(0, 5).toString() === "%PDF-",
    "PDF attachment is not a valid PDF.",
  );
}

export function validateLeadEmailForDelivery(email: string): void {
  const normalized = email.trim().toLowerCase();
  assert(normalized.includes("@"), "Lead email is invalid.");
  assert(normalized.length <= 254, "Lead email is too long.");
}

export function validateConsentForDelivery(consentToFollowUp: boolean): void {
  assert(consentToFollowUp, "Lead consent is required for email delivery.");
}
