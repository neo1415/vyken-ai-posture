"use server";

import { cookies } from "next/headers";

import type {
  AdminAccessFormState,
  AdminActionFormState,
} from "@/features/admin/types";
import {
  validateAdminAccessKey,
  validateAdminEmailAction,
  validateAdminLeadStatusUpdate,
} from "@/features/admin/validation";
import {
  ADMIN_SESSION_COOKIE,
  AdminAccessError,
  buildAdminSessionCookieValue,
  requireAdminAccess,
  verifyAdminAccess,
} from "@/server/admin/admin-access";
import {
  AdminDashboardServiceError,
  sendOrResendReportEmailForAdmin,
  updateAdminLeadStatus,
} from "@/server/services/admin-dashboard.service";

export async function authenticateAdminAction(
  _previousState: AdminAccessFormState,
  formData: FormData,
): Promise<AdminAccessFormState> {
  try {
    const parsed = validateAdminAccessKey({
      adminKey: formData.get("adminKey"),
    });

    if (!verifyAdminAccess({ adminKey: parsed.adminKey })) {
      return {
        status: "error",
        message: "Invalid admin key.",
      };
    }

    const cookieStore = await cookies();
    cookieStore.set(
      ADMIN_SESSION_COOKIE,
      buildAdminSessionCookieValue(parsed.adminKey),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/admin",
        maxAge: 60 * 60 * 8,
      },
    );

    return {
      status: "success",
      message: "Access granted.",
    };
  } catch {
    return {
      status: "error",
      message: "Admin key is required.",
    };
  }
}

export async function updateLeadStatusAction(
  _previousState: AdminActionFormState,
  formData: FormData,
): Promise<AdminActionFormState> {
  try {
    await requireAdminAccess();

    const parsed = validateAdminLeadStatusUpdate({
      publicToken: formData.get("publicToken"),
      status: formData.get("status"),
    });

    await updateAdminLeadStatus(parsed);

    return {
      status: "success",
      message: "Lead status updated.",
    };
  } catch (error) {
    if (error instanceof AdminAccessError) {
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
    await requireAdminAccess();

    const force = formData.get("force") === "true";
    const parsed = validateAdminEmailAction({
      publicToken: formData.get("publicToken"),
      force,
    });

    const result = await sendOrResendReportEmailForAdmin(parsed);

    return {
      status: result.outcome === "failed" ? "error" : "success",
      message: result.message,
    };
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return { status: "error", message: "Admin access denied." };
    }
    if (error instanceof AdminDashboardServiceError) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Report email could not be sent." };
  }
}
