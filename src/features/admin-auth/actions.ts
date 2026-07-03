"use server";

import { redirect } from "next/navigation";

import type { AdminLoginFormState } from "@/features/admin-auth/types";
import { validateAdminLoginInput } from "@/features/admin-auth/validation";
import {
  getAuthenticatedAdmin,
  mapAuthConfigError,
} from "@/server/admin/admin-auth";
import {
  clearLegacyAdminSessionCookie,
  requireAdminAccess,
} from "@/server/admin/admin-access";
import {
  assertPermission,
  canManageLeads,
  canManageToolProfiles,
  canPublishToolProfiles,
  canSendReportEmail,
} from "@/server/admin/admin-permissions";
import { getActiveAdminUserByEmail } from "@/server/repositories/admin-users.repository";
import {
  signInWithPassword,
  signOutSupabaseAuth,
} from "@/lib/supabase/auth-server";

export async function loginAdminAction(
  _previousState: AdminLoginFormState,
  formData: FormData,
): Promise<AdminLoginFormState> {
  try {
    const parsed = validateAdminLoginInput({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const { user, errorMessage } = await signInWithPassword({
      email: parsed.email,
      password: parsed.password,
    });

    if (!user || errorMessage) {
      return {
        status: "error",
        message: "Invalid email or password.",
      };
    }

    const admin = await getActiveAdminUserByEmail(user.email ?? parsed.email);
    if (!admin) {
      await signOutSupabaseAuth();
      return {
        status: "error",
        message: "Invalid email or password.",
      };
    }

    await clearLegacyAdminSessionCookie();

    return {
      status: "success",
      message: "Signed in.",
    };
  } catch (error) {
    const configError = mapAuthConfigError(error);
    if (configError) {
      return { status: "error", message: configError.message };
    }
    return {
      status: "error",
      message: "Invalid email or password.",
    };
  }
}

export async function logoutAdminAction(): Promise<void> {
  await signOutSupabaseAuth();
  await clearLegacyAdminSessionCookie();
  redirect("/admin/login");
}

export async function requireAdminForAction(): Promise<
  Awaited<ReturnType<typeof requireAdminAccess>>
> {
  return requireAdminAccess();
}

export async function requireManageLeadsAdmin() {
  const admin = await requireAdminAccess();
  assertPermission(canManageLeads(admin));
  return admin;
}

export async function requireSendReportEmailAdmin() {
  const admin = await requireAdminAccess();
  assertPermission(canSendReportEmail(admin));
  return admin;
}

export async function requireManageToolProfilesAdmin() {
  const admin = await requireAdminAccess();
  assertPermission(canManageToolProfiles(admin));
  return admin;
}

export async function requirePublishToolProfilesAdmin() {
  const admin = await requireAdminAccess();
  assertPermission(canPublishToolProfiles(admin));
  return admin;
}

export async function getOptionalAuthenticatedAdmin() {
  return getAuthenticatedAdmin();
}
