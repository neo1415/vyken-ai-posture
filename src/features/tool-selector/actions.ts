"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import type { ToolSelectorFormState } from "@/features/tool-selector/types";
import {
  formatZodFieldErrors,
  parseToolSelectorFormData,
  validateToolSelectorInput,
} from "@/features/tool-selector/validation";
import {
  saveToolSelection,
  ToolSelectionError,
} from "@/server/services/tool-selection.service";

export async function submitToolSelection(
  _previousState: ToolSelectorFormState,
  formData: FormData,
): Promise<ToolSelectorFormState> {
  const raw = parseToolSelectorFormData(formData);

  try {
    const validated = validateToolSelectorInput(raw);
    const { publicToken } = await saveToolSelection(validated);
    redirect(
      `/ai-risk-assessment/usage?session=${encodeURIComponent(publicToken)}`,
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof ZodError) {
      return {
        status: "error",
        message: "Please fix the highlighted fields and try again.",
        fieldErrors: formatZodFieldErrors(error),
      };
    }

    if (error instanceof ToolSelectionError) {
      return {
        status: "error",
        message: error.message,
      };
    }

    return {
      status: "error",
      message: "We could not save this step. Please try again.",
    };
  }
}
