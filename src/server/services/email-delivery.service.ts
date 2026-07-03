import "server-only";

import { PDF_ATTACHMENT_FILENAME } from "@/features/email-delivery/constants";
import {
  buildInternalNotificationEmail,
  buildUserReportEmail,
} from "@/features/email-delivery/email-templates";
import type {
  EmailDeliveryResult,
  EmailDeliveryStatus,
} from "@/features/email-delivery/types";
import { EmailDeliveryError } from "@/features/email-delivery/types";
import {
  validateConsentForDelivery,
  validateInternalNotificationEmailContent,
  validateLeadEmailForDelivery,
  validatePdfAttachment,
  validateUserReportEmailContent,
} from "@/features/email-delivery/validation";
import type { ReportContext } from "@/features/report-context/types";
import { isValidPublicTokenFormat } from "@/lib/security/public-token";
import {
  createEmailEvent,
  getEmailEventsForAssessment,
  hasSuccessfulReportEmailForAssessment,
  INTERNAL_NOTIFICATION_EMAIL_TYPE,
  USER_REPORT_EMAIL_TYPE,
} from "@/server/repositories/email-events.repository";
import { getLatestLeadForAssessment } from "@/server/repositories/leads.repository";
import { getReportByPublicToken } from "@/server/repositories/reports.repository";
import { getAssessmentSessionByPublicToken } from "@/server/repositories/assessment-sessions.repository";
import {
  getEmailProvider,
  resolveInternalRecipientEmail,
} from "@/server/email/get-email-provider";
import { generatePdfReportForAssessment } from "@/server/services/pdf-report.service";
import { downloadReportPdf } from "@/server/storage/report-storage";

export class EmailDeliveryServiceError extends EmailDeliveryError {}

export async function sendAssessmentReportEmail(
  publicToken: string,
  options?: { force?: boolean },
): Promise<EmailDeliveryResult> {
  const token = publicToken.trim();
  const force = options?.force ?? false;

  if (!isValidPublicTokenFormat(token)) {
    throw new EmailDeliveryServiceError(
      "This assessment session could not be verified.",
    );
  }

  const session = await getAssessmentSessionByPublicToken(token);
  if (!session) {
    throw new EmailDeliveryServiceError("Assessment session not found.");
  }

  const lead = await getLatestLeadForAssessment(session.id);
  if (!lead) {
    throw new EmailDeliveryServiceError(
      "A captured lead is required before sending the report email.",
    );
  }

  validateLeadEmailForDelivery(lead.email);
  validateConsentForDelivery(lead.consentToFollowUp);

  if (!force) {
    const alreadySent = await hasSuccessfulReportEmailForAssessment(session.id);
    if (alreadySent) {
      return {
        outcome: "already_sent",
        userEmailSent: false,
        internalEmailSent: false,
        userEmailStatus: "already_sent",
        internalEmailStatus: "skipped",
        provider: "none",
      };
    }
  }

  let report = await getReportByPublicToken(token);
  if (!report?.storagePath || report.status !== "generated") {
    await generatePdfReportForAssessment(token);
    report = await getReportByPublicToken(token);
  }

  if (!report?.storagePath) {
    throw new EmailDeliveryServiceError("Report PDF is unavailable.");
  }

  const reportContext = report.reportContext as ReportContext | null;
  if (!reportContext) {
    throw new EmailDeliveryServiceError("Report context is unavailable.");
  }

  const pdfBuffer = await downloadReportPdf(report.storagePath);
  validatePdfAttachment({
    buffer: pdfBuffer,
    filename: PDF_ATTACHMENT_FILENAME,
  });

  const userEmail = buildUserReportEmail({ leadName: lead.name });
  validateUserReportEmailContent(userEmail);

  const internalEmail = buildInternalNotificationEmail({
    leadEmail: lead.email,
    leadName: lead.name,
    companyName: lead.companyName,
    role: lead.role,
    followUpInterest: lead.mainAiConcern,
    reportContext,
    reportStatus: report.status,
    publicToken: token,
  });
  validateInternalNotificationEmailContent(internalEmail);

  const provider = getEmailProvider();
  let userEmailSent = false;
  let internalEmailSent = false;
  let userEmailStatus: EmailDeliveryResult["userEmailStatus"] = "failed";
  let internalEmailStatus: EmailDeliveryResult["internalEmailStatus"] =
    "failed";

  try {
    const userResult = await provider.sendEmail({
      to: lead.email,
      subject: userEmail.subject,
      html: userEmail.html,
      text: userEmail.text,
      attachments: [
        {
          filename: PDF_ATTACHMENT_FILENAME,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    userEmailSent = userResult.accepted;
    userEmailStatus = userEmailSent ? "sent" : "failed";

    await createEmailEvent({
      assessmentSessionId: session.id,
      leadId: lead.id,
      reportId: report.id,
      emailType: USER_REPORT_EMAIL_TYPE,
      status: userEmailSent ? "sent" : "failed",
      provider: userResult.provider,
      providerMessageId: userResult.providerMessageId,
      errorMessage: userEmailSent
        ? null
        : "User report email was not accepted.",
      sentAt: userEmailSent ? new Date() : null,
    });
  } catch (error) {
    await createEmailEvent({
      assessmentSessionId: session.id,
      leadId: lead.id,
      reportId: report.id,
      emailType: USER_REPORT_EMAIL_TYPE,
      status: "failed",
      provider: provider.name,
      providerMessageId: null,
      errorMessage:
        error instanceof Error ? error.message : "User report email failed.",
      sentAt: null,
    });
    throw new EmailDeliveryServiceError(
      error instanceof Error
        ? error.message
        : "User report email delivery failed.",
    );
  }

  try {
    const internalResult = await provider.sendEmail({
      to: resolveInternalRecipientEmail(),
      subject: internalEmail.subject,
      html: internalEmail.html,
      text: internalEmail.text,
    });

    internalEmailSent = internalResult.accepted;
    internalEmailStatus = internalEmailSent ? "sent" : "failed";

    await createEmailEvent({
      assessmentSessionId: session.id,
      leadId: lead.id,
      reportId: report.id,
      emailType: INTERNAL_NOTIFICATION_EMAIL_TYPE,
      status: internalEmailSent ? "sent" : "failed",
      provider: internalResult.provider,
      providerMessageId: internalResult.providerMessageId,
      errorMessage: internalEmailSent
        ? null
        : "Internal notification email was not accepted.",
      sentAt: internalEmailSent ? new Date() : null,
    });
  } catch (error) {
    await createEmailEvent({
      assessmentSessionId: session.id,
      leadId: lead.id,
      reportId: report.id,
      emailType: INTERNAL_NOTIFICATION_EMAIL_TYPE,
      status: "failed",
      provider: provider.name,
      providerMessageId: null,
      errorMessage:
        error instanceof Error
          ? error.message
          : "Internal notification email failed.",
      sentAt: null,
    });

    return {
      outcome: "partial_failure",
      userEmailSent,
      internalEmailSent: false,
      userEmailStatus,
      internalEmailStatus: "failed",
      provider: provider.name,
    };
  }

  return {
    outcome: userEmailSent && internalEmailSent ? "sent" : "partial_failure",
    userEmailSent,
    internalEmailSent,
    userEmailStatus,
    internalEmailStatus,
    provider: provider.name,
  };
}

export async function getEmailDeliveryStatus(
  publicToken: string,
): Promise<EmailDeliveryStatus | null> {
  const token = publicToken.trim();
  if (!isValidPublicTokenFormat(token)) {
    return null;
  }

  const session = await getAssessmentSessionByPublicToken(token);
  if (!session) {
    return null;
  }

  const [lead, report, events] = await Promise.all([
    getLatestLeadForAssessment(session.id),
    getReportByPublicToken(token),
    getEmailEventsForAssessment(session.id),
  ]);

  const userEvent = events.find(
    (event) =>
      event.emailType === USER_REPORT_EMAIL_TYPE && event.status === "sent",
  );
  const internalEvent = events.find(
    (event) =>
      event.emailType === INTERNAL_NOTIFICATION_EMAIL_TYPE &&
      event.status === "sent",
  );

  return {
    hasSuccessfulUserReportEmail: Boolean(userEvent),
    userReportEmailSentAt: userEvent?.sentAt?.toISOString() ?? null,
    internalNotificationSent: Boolean(internalEvent),
    reportStatus: report?.status ?? "pending",
    leadEmail: lead?.email ?? null,
  };
}
