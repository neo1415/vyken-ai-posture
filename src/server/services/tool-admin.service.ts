import "server-only";

import type {
  AdminToolCategoryOption,
  AdminToolDetail,
  AdminToolListFilters,
  AdminToolListResult,
} from "@/features/tool-admin/types";
import {
  ToolAdminValidationError,
  validateToolSlugForAdmin,
} from "@/features/tool-admin/validation";
import type { AuthenticatedAdmin } from "@/server/admin/admin-permissions";
import {
  assertPermission,
  canManageToolProfiles,
  canPublishToolProfiles,
  canViewAdminDashboard,
} from "@/server/admin/admin-permissions";
import {
  createAdminTool,
  createToolProfileDraft,
  getAdminToolCategories,
  getAdminToolDetailBySlug,
  getAdminToolList,
  publishToolProfileVersion,
  unpublishToolProfileVersion,
  updateToolProfileDraft,
} from "@/server/repositories/tool-admin.repository";

export class ToolAdminServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolAdminServiceError";
  }
}

function ensureCanView(admin: AuthenticatedAdmin): void {
  assertPermission(canViewAdminDashboard(admin));
}

export async function getAdminToolsView(
  input: AdminToolListFilters,
  admin: AuthenticatedAdmin,
): Promise<AdminToolListResult> {
  ensureCanView(admin);
  return getAdminToolList(input);
}

export async function getAdminToolDetailView(
  toolSlug: string,
  admin: AuthenticatedAdmin,
): Promise<AdminToolDetail | null> {
  ensureCanView(admin);
  validateToolSlugForAdmin(toolSlug);
  return getAdminToolDetailBySlug(toolSlug.trim());
}

export async function getAdminToolCategoryOptions(
  admin: AuthenticatedAdmin,
): Promise<AdminToolCategoryOption[]> {
  ensureCanView(admin);
  return getAdminToolCategories();
}

export async function createAdminToolProfile(
  input: Parameters<typeof createAdminTool>[0],
  admin: AuthenticatedAdmin,
): Promise<{ slug: string }> {
  assertPermission(canManageToolProfiles(admin));
  try {
    return await createAdminTool(input);
  } catch (error) {
    throw new ToolAdminServiceError(
      error instanceof Error ? error.message : "Tool could not be created.",
    );
  }
}

export async function updateAdminToolProfile(
  input: Parameters<typeof updateToolProfileDraft>[0],
  admin: AuthenticatedAdmin,
): Promise<{ slug: string; versionLabel: string }> {
  assertPermission(canManageToolProfiles(admin));
  validateToolSlugForAdmin(input.toolSlug);
  try {
    return await updateToolProfileDraft(input);
  } catch (error) {
    if (error instanceof ToolAdminValidationError) {
      throw new ToolAdminServiceError(error.message);
    }
    throw new ToolAdminServiceError(
      error instanceof Error ? error.message : "Profile could not be updated.",
    );
  }
}

export async function publishAdminToolProfile(
  input: { toolSlug: string; versionLabel: string },
  admin: AuthenticatedAdmin,
): Promise<{ slug: string; versionLabel: string }> {
  assertPermission(canPublishToolProfiles(admin));
  validateToolSlugForAdmin(input.toolSlug);
  try {
    return await publishToolProfileVersion(input);
  } catch (error) {
    throw new ToolAdminServiceError(
      error instanceof Error
        ? error.message
        : "Profile could not be published.",
    );
  }
}

export async function unpublishAdminToolProfile(
  input: { toolSlug: string },
  admin: AuthenticatedAdmin,
): Promise<{ slug: string }> {
  assertPermission(canPublishToolProfiles(admin));
  validateToolSlugForAdmin(input.toolSlug);
  try {
    return await unpublishToolProfileVersion(input);
  } catch (error) {
    throw new ToolAdminServiceError(
      error instanceof Error
        ? error.message
        : "Profile could not be unpublished.",
    );
  }
}

export { createToolProfileDraft };
