"use server";

import type { AdminActionFormState } from "@/features/admin/types";
import {
  validateAdminEmailAction,
  validateAdminLeadStatusUpdate,
} from "@/features/admin/validation";
import {
  requireManageLeadsAdmin,
  requireSendReportEmailAdmin,
} from "@/features/admin-auth/actions";
import {
  AdminAuthError,
  requireAdminAccess,
} from "@/server/admin/admin-access";
import { AdminPermissionError } from "@/server/admin/admin-permissions";
import {
  AdminDashboardServiceError,
  sendOrResendReportEmailForAdmin,
  updateAdminLeadStatus,
} from "@/server/services/admin-dashboard.service";

export async function updateLeadStatusAction(
  _previousState: AdminActionFormState,
  formData: FormData,
): Promise<AdminActionFormState> {
  try {
    const admin = await requireManageLeadsAdmin();

    const parsed = validateAdminLeadStatusUpdate({
      publicToken: formData.get("publicToken"),
      status: formData.get("status"),
    });

    await updateAdminLeadStatus(parsed, admin);

    return {
      status: "success",
      message: "Lead status updated.",
    };
  } catch (error) {
    if (
      error instanceof AdminAuthError ||
      error instanceof AdminPermissionError
    ) {
      return { status: "error", message: "Admin access denied." };
    }
    if (error instanceof AdminDashboardServiceError) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Lead status could not be updated." };
  }
}

export async function sendReportEmailAction(
  _previousState: AdminActionFormState,
  formData: FormData,
): Promise<AdminActionFormState> {
  try {
    const admin = await requireSendReportEmailAdmin();

    const force = formData.get("force") === "true";
    const parsed = validateAdminEmailAction({
      publicToken: formData.get("publicToken"),
      force,
    });

    const result = await sendOrResendReportEmailForAdmin(parsed, admin);

    return {
      status: result.outcome === "failed" ? "error" : "success",
      message: result.message,
    };
  } catch (error) {
    if (
      error instanceof AdminAuthError ||
      error instanceof AdminPermissionError
    ) {
      return { status: "error", message: "Admin access denied." };
    }
    if (error instanceof AdminDashboardServiceError) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Report email could not be sent." };
  }
}

export async function getCurrentAdminSessionAction() {
  const admin = await requireAdminAccess();
  return {
    email: admin.email,
    role: admin.role,
  };
}
