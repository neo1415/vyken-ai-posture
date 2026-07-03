import { FOLLOW_UP_INTEREST_OPTIONS } from "@/features/leads/constants";
import {
  formatCompanySize,
  formatCountryRegion,
  formatIndustry,
  formatPriority,
  formatRiskLevel,
} from "@/features/results/formatters";

import {
  ADMIN_EMAIL_DELIVERY_LABELS,
  ADMIN_LEAD_STATUS_LABELS,
  ADMIN_REPORT_STATUS_LABELS,
  type AdminLeadStatus,
} from "./constants";

export function formatFollowUpInterest(value: string | null): string {
  if (!value) return "Not specified";
  const match = FOLLOW_UP_INTEREST_OPTIONS.find(
    (option) => option.value === value,
  );
  if (match) return match.label;
  return value.replace(/_/g, " ");
}

export function formatLeadStatus(status: string): string {
  if (status in ADMIN_LEAD_STATUS_LABELS) {
    return ADMIN_LEAD_STATUS_LABELS[status as AdminLeadStatus];
  }
  return status.replace(/_/g, " ");
}

export function formatEmailDeliveryStatus(status: string): string {
  return ADMIN_EMAIL_DELIVERY_LABELS[status] ?? status.replace(/_/g, " ");
}

export function formatReportStatus(status: string | null): string {
  if (!status) return "Unknown";
  return ADMIN_REPORT_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export function formatAdminRiskLevel(level: string | null): string {
  if (!level) return "Unknown";
  if (level === "unknown") return "Unknown";
  return formatRiskLevel(level as "low" | "moderate" | "high" | "critical");
}

export function formatAdminIndustry(value: string): string {
  return formatIndustry(value);
}

export function formatAdminCompanySize(value: string): string {
  return formatCompanySize(value);
}

export function formatAdminCountryRegion(value: string | null): string {
  return formatCountryRegion(value);
}

export function formatAdminPriority(priority: string): string {
  if (priority === "urgent") return "Urgent";
  return formatPriority(priority as "low" | "medium" | "high");
}

export function formatAdminConcernList(concerns: string[]): string {
  if (concerns.length === 0) return "None specified";
  return concerns.map((concern) => concern.replace(/_/g, " ")).join(", ");
}

export function formatEmailEventType(type: string): string {
  if (type === "user_report") return "User report";
  if (type === "internal_notification") return "Internal notification";
  return type.replace(/_/g, " ");
}

export function truncateErrorMessage(
  message: string | null,
  max = 160,
): string | null {
  if (!message) return null;
  if (message.length <= max) return message;
  return `${message.slice(0, max - 1)}…`;
}
