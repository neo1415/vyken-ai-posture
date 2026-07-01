import { z } from "zod";

import {
  MAX_SELECTED_KNOWN_TOOLS,
  MAX_UNKNOWN_TOOLS,
  UNKNOWN_TOOL_NAME_MAX_LENGTH,
  UNKNOWN_TOOL_URL_MAX_LENGTH,
} from "./constants";
import type { ToolSelectorSubmissionInput } from "./types";

const publicTokenSchema = z
  .string()
  .trim()
  .min(32, "Session reference is invalid.")
  .max(64, "Session reference is invalid.")
  .regex(/^[A-Za-z0-9_-]+$/, "Session reference is invalid.");

const toolSlugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9_-]+$/, "Invalid tool selection.");

const optionalHttpUrlSchema = z
  .string()
  .trim()
  .max(UNKNOWN_TOOL_URL_MAX_LENGTH, "URL is too long.")
  .transform((value) => (value.length === 0 ? null : value))
  .pipe(
    z
      .union([
        z.null(),
        z
          .string()
          .url("Enter a valid URL.")
          .refine(
            (value) =>
              value.startsWith("http://") || value.startsWith("https://"),
            "URL must use http or https.",
          ),
      ])
      .nullable(),
  );

const unknownToolRowSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tool name is required.")
    .max(UNKNOWN_TOOL_NAME_MAX_LENGTH, "Tool name is too long."),
  url: optionalHttpUrlSchema,
});

export const toolSelectorSchema = z
  .object({
    sessionToken: publicTokenSchema,
    selectedToolSlugs: z
      .array(toolSlugSchema)
      .max(
        MAX_SELECTED_KNOWN_TOOLS,
        `Select up to ${MAX_SELECTED_KNOWN_TOOLS} known tools.`,
      )
      .refine((values) => new Set(values).size === values.length, {
        message: "Remove duplicate tool selections.",
      }),
    notSure: z.boolean(),
    unknownTools: z
      .array(unknownToolRowSchema)
      .max(MAX_UNKNOWN_TOOLS, `Add up to ${MAX_UNKNOWN_TOOLS} unknown tools.`),
  })
  .superRefine((data, ctx) => {
    const hasKnown = data.selectedToolSlugs.length > 0;
    const hasUnknown = data.unknownTools.length > 0;
    const hasNotSure = data.notSure;

    if (!hasKnown && !hasUnknown && !hasNotSure) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Select at least one tool, add an unknown tool, or choose Not sure.",
        path: ["form"],
      });
    }

    const normalizedNames = data.unknownTools.map((tool) =>
      tool.name.toLowerCase(),
    );
    const seen = new Set<string>();
    for (let index = 0; index < normalizedNames.length; index += 1) {
      const name = normalizedNames[index];
      if (seen.has(name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Remove duplicate unknown tool names.",
          path: ["unknownTools", index, "name"],
        });
      }
      seen.add(name);
    }
  });

export function parseToolSelectorFormData(formData: FormData): {
  sessionToken: string;
  selectedToolSlugs: string[];
  notSure: boolean;
  unknownTools: Array<{ name: string; url: string }>;
} {
  const sessionToken = formData.get("sessionToken")?.toString() ?? "";
  const selectedToolSlugs = formData
    .getAll("selectedToolSlugs")
    .map((value) => value.toString())
    .filter((value) => value.length > 0);
  const notSure = formData.get("notSure")?.toString() === "true";

  let unknownTools: Array<{ name: string; url: string }> = [];
  const unknownJson = formData.get("unknownToolsJson")?.toString() ?? "[]";

  try {
    const parsed: unknown = JSON.parse(unknownJson);
    if (Array.isArray(parsed)) {
      unknownTools = parsed
        .filter((row): row is { name?: unknown; url?: unknown } =>
          Boolean(row && typeof row === "object"),
        )
        .map((row) => ({
          name: typeof row.name === "string" ? row.name : "",
          url: typeof row.url === "string" ? row.url : "",
        }))
        .filter((row) => row.name.trim().length > 0);
    }
  } catch {
    unknownTools = [];
  }

  return {
    sessionToken,
    selectedToolSlugs,
    notSure,
    unknownTools,
  };
}

export function validateToolSelectorInput(
  input: ReturnType<typeof parseToolSelectorFormData>,
): ToolSelectorSubmissionInput {
  return toolSelectorSchema.parse(input);
}

export function formatZodFieldErrors(
  error: z.ZodError,
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key =
      issue.path.length === 0
        ? "form"
        : issue.path.map((segment) => segment.toString()).join(".");
    const existing = fieldErrors[key] ?? [];
    fieldErrors[key] = [...existing, issue.message];
  }

  return fieldErrors;
}
