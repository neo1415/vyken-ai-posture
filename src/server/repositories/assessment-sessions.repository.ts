import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  assessmentSessions,
  type assessmentSessions as assessmentSessionsTable,
} from "@/lib/db/schema/assessments";

export type CreateAssessmentSessionInput = {
  publicToken: string;
  status?: (typeof assessmentSessionsTable.$inferInsert)["status"];
  source?: string | null;
  userAgent?: string | null;
  ipHash?: string | null;
};

export type AssessmentSessionRow = typeof assessmentSessions.$inferSelect;

export async function createAssessmentSession(
  input: CreateAssessmentSessionInput,
): Promise<AssessmentSessionRow> {
  const db = getDb();

  const [session] = await db
    .insert(assessmentSessions)
    .values({
      publicToken: input.publicToken,
      status: input.status ?? "started",
      source: input.source ?? null,
      userAgent: input.userAgent ?? null,
      ipHash: input.ipHash ?? null,
    })
    .returning();

  if (!session) {
    throw new Error("Failed to create assessment session.");
  }

  return session;
}

export async function getAssessmentSessionByPublicToken(
  publicToken: string,
): Promise<AssessmentSessionRow | null> {
  const db = getDb();

  const [session] = await db
    .select()
    .from(assessmentSessions)
    .where(eq(assessmentSessions.publicToken, publicToken))
    .limit(1);

  return session ?? null;
}

export async function updateAssessmentSessionStatus(input: {
  sessionId: string;
  status: AssessmentSessionRow["status"];
}): Promise<void> {
  const db = getDb();

  await db
    .update(assessmentSessions)
    .set({ status: input.status })
    .where(eq(assessmentSessions.id, input.sessionId));
}
