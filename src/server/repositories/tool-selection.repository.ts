import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
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
