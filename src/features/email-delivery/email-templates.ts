import type { ReportContext } from "@/features/report-context/types";

import {
  INTERNAL_NOTIFICATION_SUBJECT,
  USER_REPORT_EMAIL_SUBJECT,
} from "./constants";
import {
  escapeHtml,
  formatGreeting,
  formatLabelValue,
  USER_REPORT_DISCLAIMER,
} from "./email-text";

export type UserReportEmailContent = {
  subject: string;
  html: string;
  text: string;
};

export type InternalNotificationEmailContent = {
  subject: string;
  html: string;
  text: string;
};

export function buildUserReportEmail(input: {
  leadName: string | null;
}): UserReportEmailContent {
  const greeting = formatGreeting(input.leadName);
  const text = [
    greeting,
    "",
    "Thanks for completing the Vyken AI governance assessment.",
    "",
    "Your report is attached. It summarizes the answers provided, the risk signals identified, and the recommended next steps for review.",
    "",
    USER_REPORT_DISCLAIMER,
    "",
    "Regards,",
    "Vyken Security",
  ].join("\n");

  const html = [
    `<p>${escapeHtml(greeting)}</p>`,
    "<p>Thanks for completing the Vyken AI governance assessment.</p>",
    "<p>Your report is attached. It summarizes the answers provided, the risk signals identified, and the recommended next steps for review.</p>",
    `<p>${escapeHtml(USER_REPORT_DISCLAIMER)}</p>`,
    "<p>Regards,<br/>Vyken Security</p>",
  ].join("\n");

  return {
    subject: USER_REPORT_EMAIL_SUBJECT,
    html,
    text,
  };
}

export function buildInternalNotificationEmail(input: {
  leadEmail: string;
  leadName: string | null;
  companyName: string | null;
  role: string | null;
  followUpInterest: string | null;
  reportContext: ReportContext;
  reportStatus: string;
  publicToken: string;
}): InternalNotificationEmailContent {
  const textLines = [
    "A new AI governance assessment lead requested report follow-up.",
    "",
    "Lead:",
    formatLabelValue("Email", input.leadEmail),
    formatLabelValue("Name", input.leadName),
    formatLabelValue("Company", input.companyName),
    formatLabelValue("Role", input.role),
    formatLabelValue("Follow-up interest", input.followUpInterest),
    "",
    "Assessment:",
    formatLabelValue(
      "Overall score",
      `${input.reportContext.riskSummary.overallScore}/100`,
    ),
    formatLabelValue(
      "Risk level",
      input.reportContext.riskSummary.overallRiskLevel,
    ),
    formatLabelValue(
      "Confidence",
      input.reportContext.riskSummary.confidenceLevel,
    ),
    formatLabelValue("Report status", input.reportStatus),
    formatLabelValue("Assessment reference", input.publicToken),
    "",
    "Review this lead in the admin dashboard when Module 15 is available.",
  ];

  const html = [
    "<p>A new AI governance assessment lead requested report follow-up.</p>",
    "<p><strong>Lead</strong></p>",
    "<ul>",
    `<li>${escapeHtml(formatLabelValue("Email", input.leadEmail).slice(2))}</li>`,
    `<li>${escapeHtml(formatLabelValue("Name", input.leadName).slice(2))}</li>`,
    `<li>${escapeHtml(formatLabelValue("Company", input.companyName).slice(2))}</li>`,
    `<li>${escapeHtml(formatLabelValue("Role", input.role).slice(2))}</li>`,
    `<li>${escapeHtml(formatLabelValue("Follow-up interest", input.followUpInterest).slice(2))}</li>`,
    "</ul>",
    "<p><strong>Assessment</strong></p>",
    "<ul>",
    `<li>${escapeHtml(formatLabelValue("Overall score", `${input.reportContext.riskSummary.overallScore}/100`).slice(2))}</li>`,
    `<li>${escapeHtml(formatLabelValue("Risk level", input.reportContext.riskSummary.overallRiskLevel).slice(2))}</li>`,
    `<li>${escapeHtml(formatLabelValue("Confidence", input.reportContext.riskSummary.confidenceLevel).slice(2))}</li>`,
    `<li>${escapeHtml(formatLabelValue("Report status", input.reportStatus).slice(2))}</li>`,
    `<li>${escapeHtml(formatLabelValue("Assessment reference", input.publicToken).slice(2))}</li>`,
    "</ul>",
    "<p>Review this lead in the admin dashboard when Module 15 is available.</p>",
  ].join("\n");

  return {
    subject: INTERNAL_NOTIFICATION_SUBJECT,
    html,
    text: textLines.join("\n"),
  };
}

export function collectUserEmailVisibleText(
  content: UserReportEmailContent,
): string {
  return `${content.subject}\n${content.text}`;
}

export function collectInternalEmailVisibleText(
  content: InternalNotificationEmailContent,
): string {
  return `${content.subject}\n${content.text}`;
}
