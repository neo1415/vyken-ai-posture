import "server-only";

import type { ToolSelectorSubmissionInput } from "@/features/tool-selector/types";
import { getAssessmentSessionWithCompanyProfileByPublicToken } from "@/server/repositories/assessment-sessions.repository";
import { getPublishedToolProfilesBySlugs } from "@/server/repositories/tool-profiles.repository";
import { replaceToolSelectionsForSession } from "@/server/repositories/tool-selection.repository";
import { validateToolSlugs } from "@/server/services/tool-profiles.service";
import { trackPublicAssessmentEventBySessionId } from "@/server/services/event-tracking.service";

export class ToolSelectionError extends Error {
  constructor(
    message: string,
    readonly code: "session_not_found" | "invalid_tools" = "session_not_found",
  ) {
    super(message);
    this.name = "ToolSelectionError";
  }
}

export async function saveToolSelection(
  input: ToolSelectorSubmissionInput,
): Promise<{ publicToken: string }> {
  const sessionBundle =
    await getAssessmentSessionWithCompanyProfileByPublicToken(
      input.sessionToken,
    );

  if (!sessionBundle) {
    throw new ToolSelectionError(
      "Assessment session not found.",
      "session_not_found",
    );
  }

  const { session } = sessionBundle;
  const slugValidation = await validateToolSlugs(input.selectedToolSlugs);

  if (slugValidation.invalid.length > 0) {
    throw new ToolSelectionError(
      "One or more selected tools are not available.",
      "invalid_tools",
    );
  }

  const profileRows = await getPublishedToolProfilesBySlugs(
    slugValidation.valid,
  );

  if (profileRows.length !== slugValidation.valid.length) {
    throw new ToolSelectionError(
      "One or more selected tools are not available.",
      "invalid_tools",
    );
  }

  const profileBySlug = new Map(
    profileRows.map((row) => [row.tool.slug, row] as const),
  );

  const knownTools = slugValidation.valid.map((slug) => {
    const row = profileBySlug.get(slug);
    if (!row) {
      throw new ToolSelectionError(
        "One or more selected tools are not available.",
        "invalid_tools",
      );
    }

    return {
      assessmentSessionId: session.id,
      toolId: row.tool.id,
      toolProfileVersionId: row.profile.id,
    };
  });

  const unknownTools = input.unknownTools.map((tool) => ({
    assessmentSessionId: session.id,
    unknownToolName: tool.name.trim(),
    unknownToolUrl: tool.url,
  }));

  const unknownToolRequests = input.unknownTools.map((tool) => ({
    assessmentSessionId: session.id,
    toolName: tool.name.trim(),
    toolUrl: tool.url,
  }));

  await replaceToolSelectionsForSession({
    assessmentSessionId: session.id,
    knownTools,
    unknownTools,
    notSure: input.notSure,
    unknownToolRequests,
  });

  void trackPublicAssessmentEventBySessionId({
    assessmentSessionId: session.id,
    action: "tools_selected",
    metadata: {
      toolCount: knownTools.length,
      unknownToolCount: unknownTools.length,
      hasNotSure: input.notSure,
    },
  });

  return { publicToken: session.publicToken };
}
