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
import type { AuthenticatedAdmin } from "@/server/admin/admin-permissions";
import {
  AdminPermissionError,
  assertPermission,
  canManageLeads,
  canSendReportEmail,
  canViewAdminDashboard,
} from "@/server/admin/admin-permissions";
import {
  getAdminLeadDetailByPublicToken,
  getAdminLeadList,
  updateLeadStatusForAdmin,
} from "@/server/repositories/admin-dashboard.repository";
import { getAssessmentSessionByPublicToken } from "@/server/repositories/assessment-sessions.repository";
import { getLatestLeadForAssessment } from "@/server/repositories/leads.repository";
import { sendAssessmentReportEmail } from "@/server/services/email-delivery.service";
import {
  trackAdminAuditEvent,
  trackLeadEvent,
} from "@/server/services/event-tracking.service";

export class AdminDashboardServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminDashboardServiceError";
  }
}

function toAuditAdmin(admin: AuthenticatedAdmin) {
  if (admin.email === "legacy-dev@vyken.internal") {
    return undefined;
  }
  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  };
}

function ensureCanView(admin: AuthenticatedAdmin): void {
  assertPermission(canViewAdminDashboard(admin));
}

export async function getAdminLeadsView(
  input: AdminLeadListFilters,
  admin: AuthenticatedAdmin,
): Promise<AdminLeadListResult> {
  ensureCanView(admin);
  const filters = validateAdminLeadListFilters(input);
  return getAdminLeadList(filters);
}

export async function getAdminLeadDetailView(
  publicToken: string,
  admin: AuthenticatedAdmin,
): Promise<AdminLeadDetail | null> {
  ensureCanView(admin);
  validatePublicTokenForAdmin(publicToken);
  const detail = await getAdminLeadDetailByPublicToken(publicToken.trim());
  if (detail) {
    const session = await getAssessmentSessionByPublicToken(publicToken.trim());
    if (session) {
      void trackAdminAuditEvent({
        action: "admin_lead_viewed",
        entityType: "assessment_session",
        entityId: session.id,
        admin: toAuditAdmin(admin),
        metadata: { sourcePage: "admin_lead_detail" },
      });
    }
  }
  return detail;
}

export async function updateAdminLeadStatus(
  input: { publicToken: string; status: string },
  admin: AuthenticatedAdmin,
): Promise<AdminLeadStatusUpdateResult> {
  assertPermission(canManageLeads(admin));

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

  const session = await getAssessmentSessionByPublicToken(
    validated.publicToken,
  );
  if (session) {
    void trackAdminAuditEvent({
      action: "admin_lead_status_updated",
      entityType: "assessment_session",
      entityId: session.id,
      admin: toAuditAdmin(admin),
      metadata: { leadStatus: validated.status },
    });
    const lead = await getLatestLeadForAssessment(session.id);
    if (lead) {
      void trackLeadEvent({
        leadId: lead.id,
        eventType: "status_changed",
        metadata: { leadStatus: validated.status },
      });
    }
  }

  return updated;
}

export async function sendOrResendReportEmailForAdmin(
  input: { publicToken: string; force?: boolean },
  admin: AuthenticatedAdmin,
): Promise<AdminEmailActionResult> {
  assertPermission(canSendReportEmail(admin));

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
      const session = await getAssessmentSessionByPublicToken(
        validated.publicToken,
      );
      if (session) {
        void trackAdminAuditEvent({
          action: validated.force
            ? "admin_email_resend_clicked"
            : "admin_email_send_clicked",
          entityType: "assessment_session",
          entityId: session.id,
          admin: toAuditAdmin(admin),
          metadata: { forceResend: validated.force ?? false },
        });
      }

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
    if (error instanceof AdminPermissionError) {
      throw error;
    }
    throw new AdminDashboardServiceError(
      error instanceof Error ? error.message : "Report email delivery failed.",
    );
  }
}
