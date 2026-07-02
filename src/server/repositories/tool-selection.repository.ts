import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  aiToolCategories,
  aiToolProfileVersions,
  aiTools,
} from "@/lib/db/schema/ai-tools";
import { assessmentSelectedTools } from "@/lib/db/schema/assessments";
import { unknownToolRequests } from "@/lib/db/schema/events";

export type KnownToolSelectionInsert = {
  assessmentSessionId: string;
  toolId: string;
  toolProfileVersionId: string;
};

export type UnknownToolSelectionInsert = {
  assessmentSessionId: string;
  unknownToolName: string;
  unknownToolUrl: string | null;
};

export type UnknownToolRequestInsert = {
  assessmentSessionId: string;
  toolName: string;
  toolUrl: string | null;
};

export async function deleteAssessmentToolSelections(
  assessmentSessionId: string,
): Promise<void> {
  const db = getDb();
  await db
    .delete(assessmentSelectedTools)
    .where(
      eq(assessmentSelectedTools.assessmentSessionId, assessmentSessionId),
    );
}

export async function deleteUnknownToolRequestsForSession(
  assessmentSessionId: string,
): Promise<void> {
  const db = getDb();
  await db
    .delete(unknownToolRequests)
    .where(eq(unknownToolRequests.assessmentSessionId, assessmentSessionId));
}

export async function insertKnownToolSelections(
  items: KnownToolSelectionInsert[],
): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const db = getDb();
  await db.insert(assessmentSelectedTools).values(
    items.map((item) => ({
      assessmentSessionId: item.assessmentSessionId,
      toolId: item.toolId,
      toolProfileVersionId: item.toolProfileVersionId,
      selectionType: "known_tool" as const,
    })),
  );
}

export async function insertUnknownToolSelections(
  items: UnknownToolSelectionInsert[],
): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const db = getDb();
  await db.insert(assessmentSelectedTools).values(
    items.map((item) => ({
      assessmentSessionId: item.assessmentSessionId,
      unknownToolName: item.unknownToolName,
      unknownToolUrl: item.unknownToolUrl,
      selectionType: "unknown_tool" as const,
    })),
  );
}

export async function insertNotSureToolSelection(
  assessmentSessionId: string,
): Promise<void> {
  const db = getDb();
  await db.insert(assessmentSelectedTools).values({
    assessmentSessionId,
    selectionType: "not_sure",
  });
}

export async function createUnknownToolRequests(
  items: UnknownToolRequestInsert[],
): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const db = getDb();
  await db.insert(unknownToolRequests).values(
    items.map((item) => ({
      assessmentSessionId: item.assessmentSessionId,
      toolName: item.toolName,
      toolUrl: item.toolUrl,
      status: "new" as const,
    })),
  );
}

export type ReplaceToolSelectionInput = {
  assessmentSessionId: string;
  knownTools: KnownToolSelectionInsert[];
  unknownTools: UnknownToolSelectionInsert[];
  notSure: boolean;
  unknownToolRequests: UnknownToolRequestInsert[];
};

/** Replaces all tool selections and unknown requests for a session atomically. */
export async function replaceToolSelectionsForSession(
  input: ReplaceToolSelectionInput,
): Promise<void> {
  const db = getDb();

  await db.transaction(async (tx) => {
    await tx
      .delete(assessmentSelectedTools)
      .where(
        eq(
          assessmentSelectedTools.assessmentSessionId,
          input.assessmentSessionId,
        ),
      );

    await tx
      .delete(unknownToolRequests)
      .where(
        eq(unknownToolRequests.assessmentSessionId, input.assessmentSessionId),
      );

    if (input.knownTools.length > 0) {
      await tx.insert(assessmentSelectedTools).values(
        input.knownTools.map((item) => ({
          assessmentSessionId: item.assessmentSessionId,
          toolId: item.toolId,
          toolProfileVersionId: item.toolProfileVersionId,
          selectionType: "known_tool" as const,
        })),
      );
    }

    if (input.unknownTools.length > 0) {
      await tx.insert(assessmentSelectedTools).values(
        input.unknownTools.map((item) => ({
          assessmentSessionId: item.assessmentSessionId,
          unknownToolName: item.unknownToolName,
          unknownToolUrl: item.unknownToolUrl,
          selectionType: "unknown_tool" as const,
        })),
      );
    }

    if (input.notSure) {
      await tx.insert(assessmentSelectedTools).values({
        assessmentSessionId: input.assessmentSessionId,
        selectionType: "not_sure",
      });
    }

    if (input.unknownToolRequests.length > 0) {
      await tx.insert(unknownToolRequests).values(
        input.unknownToolRequests.map((item) => ({
          assessmentSessionId: item.assessmentSessionId,
          toolName: item.toolName,
          toolUrl: item.toolUrl,
          status: "new" as const,
        })),
      );
    }
  });
}

export type SelectedToolContextRow = {
  hasNotSure: boolean;
  categorySlugs: string[];
  codingAssistantRelevance: boolean;
  agenticOrConnectedRelevance: boolean;
};

export async function hasToolSelectionsForSession(
  assessmentSessionId: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: assessmentSelectedTools.id })
    .from(assessmentSelectedTools)
    .where(eq(assessmentSelectedTools.assessmentSessionId, assessmentSessionId))
    .limit(1);
  return rows.length > 0;
}

export async function getSelectedToolContextForAssessment(
  assessmentSessionId: string,
): Promise<SelectedToolContextRow> {
  const db = getDb();

  const selections = await db
    .select({
      selectionType: assessmentSelectedTools.selectionType,
      toolId: assessmentSelectedTools.toolId,
    })
    .from(assessmentSelectedTools)
    .where(
      eq(assessmentSelectedTools.assessmentSessionId, assessmentSessionId),
    );

  const hasNotSure = selections.some((row) => row.selectionType === "not_sure");
  const toolIds = selections
    .map((row) => row.toolId)
    .filter((id): id is string => Boolean(id));

  if (toolIds.length === 0) {
    return {
      hasNotSure,
      categorySlugs: [],
      codingAssistantRelevance: false,
      agenticOrConnectedRelevance: false,
    };
  }

  const profileRows = await db
    .select({
      categorySlug: aiToolCategories.slug,
      codingAssistantRelevance: aiToolProfileVersions.codingAssistantRelevance,
      agenticOrConnectedRelevance:
        aiToolProfileVersions.agenticOrConnectedToolRelevance,
    })
    .from(aiToolProfileVersions)
    .innerJoin(aiTools, eq(aiToolProfileVersions.toolId, aiTools.id))
    .innerJoin(aiToolCategories, eq(aiTools.categoryId, aiToolCategories.id))
    .where(
      and(
        inArray(aiTools.id, toolIds),
        eq(aiTools.isActive, true),
        eq(aiToolProfileVersions.publishedStatus, "published"),
      ),
    );

  const categorySlugs = [
    ...new Set(profileRows.map((row) => row.categorySlug)),
  ];

  return {
    hasNotSure,
    categorySlugs,
    codingAssistantRelevance: profileRows.some(
      (row) => row.codingAssistantRelevance === true,
    ),
    agenticOrConnectedRelevance: profileRows.some(
      (row) => row.agenticOrConnectedRelevance === true,
    ),
  };
}
