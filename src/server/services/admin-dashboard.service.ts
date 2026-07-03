import "server-only";

import type {
  AdminEmailActionResult,
  AdminLeadDetail,
  AdminLeadListFilters,
  AdminLeadListResult,
  AdminLeadStatusUpdateResult,
} from "@/features/admin/types";
import {
  AdminValidationError,
  validateAdminEmailAction,
  validateAdminLeadListFilters,
  validateAdminLeadStatusUpdate,
  validatePublicTokenForAdmin,
} from "@/features/admin/validation";
import {
  AdminAccessError,
  requireAdminAccess,
} from "@/server/admin/admin-access";
import {
  getAdminLeadDetailByPublicToken,
  getAdminLeadList,
  updateLeadStatusForAdmin,
} from "@/server/repositories/admin-dashboard.repository";
import { sendAssessmentReportEmail } from "@/server/services/email-delivery.service";

export class AdminDashboardServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminDashboardServiceError";
  }
}

export async function getAdminLeadsView(
  input: AdminLeadListFilters,
  access?: { adminKey?: string | null },
): Promise<AdminLeadListResult> {
  await requireAdminAccess(access);
  const filters = validateAdminLeadListFilters(input);
  return getAdminLeadList(filters);
}

export async function getAdminLeadDetailView(
  publicToken: string,
  access?: { adminKey?: string | null },
): Promise<AdminLeadDetail | null> {
  await requireAdminAccess(access);
  validatePublicTokenForAdmin(publicToken);
  return getAdminLeadDetailByPublicToken(publicToken.trim());
}

export async function updateAdminLeadStatus(
  input: { publicToken: string; status: string },
  access?: { adminKey?: string | null },
): Promise<AdminLeadStatusUpdateResult> {
  await requireAdminAccess(access);

  let validated;
  try {
    validated = validateAdminLeadStatusUpdate(input);
  } catch (error) {
    if (error instanceof AdminValidationError) {
      throw new AdminDashboardServiceError(error.message);
    }
    throw error;
  }

  const updated = await updateLeadStatusForAdmin({
    publicToken: validated.publicToken,
    status: validated.status,
  });

  if (!updated) {
    throw new AdminDashboardServiceError("Lead could not be updated.");
  }

  return updated;
}

export async function sendOrResendReportEmailForAdmin(
  input: { publicToken: string; force?: boolean },
  access?: { adminKey?: string | null },
): Promise<AdminEmailActionResult> {
  await requireAdminAccess(access);

  let validated;
  try {
    validated = validateAdminEmailAction({
      publicToken: input.publicToken,
      force: input.force ?? false,
    });
  } catch (error) {
    if (error instanceof AdminValidationError) {
      throw new AdminDashboardServiceError(error.message);
    }
    throw error;
  }

  try {
    const result = await sendAssessmentReportEmail(validated.publicToken, {
      force: validated.force,
    });

    if (result.outcome === "already_sent") {
      return {
        outcome: result.outcome,
        message:
          "Report email was already sent. Use resend to send again with force.",
      };
    }

    if (result.outcome === "partial_failure") {
      return {
        outcome: result.outcome,
        message:
          "User report email sent, but the internal notification failed.",
      };
    }

    if (result.outcome === "sent") {
      return {
        outcome: result.outcome,
        message: validated.force
          ? "Report email resent successfully."
          : "Report email sent successfully.",
      };
    }

    return {
      outcome: result.outcome,
      message: "Report email delivery did not complete successfully.",
    };
  } catch (error) {
    if (error instanceof AdminAccessError) {
      throw error;
    }
    throw new AdminDashboardServiceError(
      error instanceof Error ? error.message : "Report email delivery failed.",
    );
  }
}
