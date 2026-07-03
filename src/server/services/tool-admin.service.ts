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
import { requireAdminAccess } from "@/server/admin/admin-access";
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

type AdminAccessInput = { adminKey?: string | null };

export async function getAdminToolsView(
  input: AdminToolListFilters,
  access?: AdminAccessInput,
): Promise<AdminToolListResult> {
  await requireAdminAccess(access);
  return getAdminToolList(input);
}

export async function getAdminToolDetailView(
  toolSlug: string,
  access?: AdminAccessInput,
): Promise<AdminToolDetail | null> {
  await requireAdminAccess(access);
  validateToolSlugForAdmin(toolSlug);
  return getAdminToolDetailBySlug(toolSlug.trim());
}

export async function getAdminToolCategoryOptions(
  access?: AdminAccessInput,
): Promise<AdminToolCategoryOption[]> {
  await requireAdminAccess(access);
  return getAdminToolCategories();
}

export async function createAdminToolProfile(
  input: Parameters<typeof createAdminTool>[0],
): Promise<{ slug: string }> {
  await requireAdminAccess();
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
): Promise<{ slug: string; versionLabel: string }> {
  await requireAdminAccess();
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

export async function publishAdminToolProfile(input: {
  toolSlug: string;
  versionLabel: string;
}): Promise<{ slug: string; versionLabel: string }> {
  await requireAdminAccess();
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

export async function unpublishAdminToolProfile(input: {
  toolSlug: string;
}): Promise<{ slug: string }> {
  await requireAdminAccess();
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
