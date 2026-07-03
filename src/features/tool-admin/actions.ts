"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ZodError } from "zod";

import {
  requireManageToolProfilesAdmin,
  requirePublishToolProfilesAdmin,
} from "@/features/admin-auth/actions";
import type { ToolAdminActionFormState } from "@/features/tool-admin/types";
import {
  parseCreateToolProfileFormData,
  parsePublishToolProfileFormData,
  parseUnpublishToolProfileFormData,
  parseUpdateToolProfileFormData,
} from "@/features/tool-admin/validation";
import { AdminAuthError } from "@/server/admin/admin-access";
import { AdminPermissionError } from "@/server/admin/admin-permissions";
import {
  createAdminToolProfile,
  publishAdminToolProfile,
  ToolAdminServiceError,
  unpublishAdminToolProfile,
  updateAdminToolProfile,
} from "@/server/services/tool-admin.service";

const initialState: ToolAdminActionFormState = { status: "idle" };

function formError(message: string): ToolAdminActionFormState {
  return { status: "error", message };
}

function accessDenied(): ToolAdminActionFormState {
  return formError("Admin access denied.");
}

export async function createToolProfileAction(
  _previousState: ToolAdminActionFormState,
  formData: FormData,
): Promise<ToolAdminActionFormState> {
  try {
    const admin = await requireManageToolProfilesAdmin();
    const parsed = parseCreateToolProfileFormData(formData);
    const result = await createAdminToolProfile(
      {
        slug: parsed.slug,
        name: parsed.name,
        categorySlug: parsed.categorySlug,
        websiteUrl: parsed.websiteUrl,
        isActive: parsed.isActive,
        publicInfoConfidenceLevel: parsed.publicInfoConfidenceLevel,
        reviewNotes: parsed.reviewNotes,
        sourceConfidenceNotes: parsed.sourceConfidenceNotes,
        commonUseCases: parsed.commonUseCases,
        supportsFileUploads: parsed.supportsFileUploads,
        supportsMeetingTranscripts: parsed.supportsMeetingTranscripts,
        codingAssistantRelevance: parsed.codingAssistantRelevance,
        agenticOrConnectedToolRelevance: parsed.agenticOrConnectedToolRelevance,
        publicPrivacyUrl: parsed.publicPrivacyUrl ?? "",
        publicSecurityUrl: parsed.publicSecurityUrl ?? "",
        publicTrustUrl: parsed.publicTrustUrl ?? "",
        trainingUseNotes: parsed.trainingUseNotes,
        dataRetentionNotes: parsed.dataRetentionNotes,
        deletionControlNotes: parsed.deletionControlNotes,
        enterpriseAdminControlsNotes: parsed.enterpriseAdminControlsNotes,
        auditLoggingNotes: parsed.auditLoggingNotes,
        complianceSecurityDocsNotes: parsed.complianceSecurityDocsNotes,
        subprocessorNotes: parsed.subprocessorNotes,
        sensitiveDataConcerns: parsed.sensitiveDataConcerns,
        recommendedUsageBoundaries: parsed.recommendedUsageBoundaries,
      },
      admin,
    );
    revalidatePath("/admin/tools");
    redirect(`/admin/tools/${result.slug}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof ZodError) {
      return formError("Please check the form fields and try again.");
    }
    if (
      error instanceof AdminAuthError ||
      error instanceof AdminPermissionError
    ) {
      return accessDenied();
    }
    if (error instanceof ToolAdminServiceError) {
      return formError(error.message);
    }
    return formError("Tool profile could not be created.");
  }
}

export async function updateToolProfileAction(
  _previousState: ToolAdminActionFormState,
  formData: FormData,
): Promise<ToolAdminActionFormState> {
  try {
    const admin = await requireManageToolProfilesAdmin();
    const parsed = parseUpdateToolProfileFormData(formData);
    const result = await updateAdminToolProfile(
      {
        toolSlug: parsed.toolSlug,
        form: {
          name: parsed.name,
          categorySlug: parsed.categorySlug,
          websiteUrl: parsed.websiteUrl,
          isActive: parsed.isActive,
          publicInfoConfidenceLevel: parsed.publicInfoConfidenceLevel,
          reviewNotes: parsed.reviewNotes,
          sourceConfidenceNotes: parsed.sourceConfidenceNotes,
          commonUseCases: parsed.commonUseCases,
          supportsFileUploads: parsed.supportsFileUploads,
          supportsMeetingTranscripts: parsed.supportsMeetingTranscripts,
          codingAssistantRelevance: parsed.codingAssistantRelevance,
          agenticOrConnectedToolRelevance:
            parsed.agenticOrConnectedToolRelevance,
          publicPrivacyUrl: parsed.publicPrivacyUrl ?? "",
          publicSecurityUrl: parsed.publicSecurityUrl ?? "",
          publicTrustUrl: parsed.publicTrustUrl ?? "",
          trainingUseNotes: parsed.trainingUseNotes,
          dataRetentionNotes: parsed.dataRetentionNotes,
          deletionControlNotes: parsed.deletionControlNotes,
          enterpriseAdminControlsNotes: parsed.enterpriseAdminControlsNotes,
          auditLoggingNotes: parsed.auditLoggingNotes,
          complianceSecurityDocsNotes: parsed.complianceSecurityDocsNotes,
          subprocessorNotes: parsed.subprocessorNotes,
          sensitiveDataConcerns: parsed.sensitiveDataConcerns,
          recommendedUsageBoundaries: parsed.recommendedUsageBoundaries,
        },
      },
      admin,
    );
    revalidatePath("/admin/tools");
    revalidatePath(`/admin/tools/${result.slug}`);
    return {
      status: "success",
      message: `Draft ${result.versionLabel} saved.`,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof ZodError) {
      return formError("Please check the form fields and try again.");
    }
    if (
      error instanceof AdminAuthError ||
      error instanceof AdminPermissionError
    ) {
      return accessDenied();
    }
    if (error instanceof ToolAdminServiceError) {
      return formError(error.message);
    }
    return formError("Tool profile could not be updated.");
  }
}

export async function publishToolProfileAction(
  _previousState: ToolAdminActionFormState,
  formData: FormData,
): Promise<ToolAdminActionFormState> {
  try {
    const admin = await requirePublishToolProfilesAdmin();
    const parsed = parsePublishToolProfileFormData(formData);
    await publishAdminToolProfile(parsed, admin);
    revalidatePath("/admin/tools");
    revalidatePath(`/admin/tools/${parsed.toolSlug}`);
    return { status: "success", message: "Profile published." };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof ZodError) {
      return formError("Invalid publish request.");
    }
    if (
      error instanceof AdminAuthError ||
      error instanceof AdminPermissionError
    ) {
      return accessDenied();
    }
    if (error instanceof ToolAdminServiceError) {
      return formError(error.message);
    }
    return formError("Profile could not be published.");
  }
}

export async function unpublishToolProfileAction(
  _previousState: ToolAdminActionFormState,
  formData: FormData,
): Promise<ToolAdminActionFormState> {
  try {
    const admin = await requirePublishToolProfilesAdmin();
    const parsed = parseUnpublishToolProfileFormData(formData);
    await unpublishAdminToolProfile(parsed, admin);
    revalidatePath("/admin/tools");
    revalidatePath(`/admin/tools/${parsed.toolSlug}`);
    return { status: "success", message: "Published profile archived." };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof ZodError) {
      return formError("Invalid unpublish request.");
    }
    if (
      error instanceof AdminAuthError ||
      error instanceof AdminPermissionError
    ) {
      return accessDenied();
    }
    if (error instanceof ToolAdminServiceError) {
      return formError(error.message);
    }
    return formError("Profile could not be unpublished.");
  }
}

export { initialState as toolAdminActionInitialState };
