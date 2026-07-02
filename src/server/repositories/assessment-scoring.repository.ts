import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  aiToolCategories,
  aiToolProfileVersions,
  aiTools,
} from "@/lib/db/schema/ai-tools";
import {
  assessmentAnswers,
  assessmentCompanyProfiles,
  assessmentRiskSignals,
  assessmentScores,
  assessmentSelectedTools,
  assessmentSessions,
} from "@/lib/db/schema/assessments";
import { unknownToolRequests } from "@/lib/db/schema/events";

export type ScoringInputRow = {
  session: typeof assessmentSessions.$inferSelect;
  companyProfile: typeof assessmentCompanyProfiles.$inferSelect;
  answers: (typeof assessmentAnswers.$inferSelect)[];
  selectedTools: Array<{
    selectionType: (typeof assessmentSelectedTools.$inferSelect)["selectionType"];
    unknownToolName: string | null;
    unknownToolUrl: string | null;
    tool: typeof aiTools.$inferSelect | null;
    category: typeof aiToolCategories.$inferSelect | null;
    profile: typeof aiToolProfileVersions.$inferSelect | null;
  }>;
  unknownToolRequests: (typeof unknownToolRequests.$inferSelect)[];
};

export async function getScoringInputByPublicToken(
  publicToken: string,
): Promise<ScoringInputRow | null> {
  const db = getDb();

  const [session] = await db
    .select()
    .from(assessmentSessions)
    .where(eq(assessmentSessions.publicToken, publicToken))
    .limit(1);

  if (!session) return null;

  const [companyProfile] = await db
    .select()
    .from(assessmentCompanyProfiles)
    .where(eq(assessmentCompanyProfiles.assessmentSessionId, session.id))
    .limit(1);

  if (!companyProfile) return null;

  const answers = await db
    .select()
    .from(assessmentAnswers)
    .where(eq(assessmentAnswers.assessmentSessionId, session.id));

  const selectedTools = await db
    .select({
      selectionType: assessmentSelectedTools.selectionType,
      unknownToolName: assessmentSelectedTools.unknownToolName,
      unknownToolUrl: assessmentSelectedTools.unknownToolUrl,
      tool: aiTools,
      category: aiToolCategories,
      profile: aiToolProfileVersions,
    })
    .from(assessmentSelectedTools)
    .leftJoin(aiTools, eq(assessmentSelectedTools.toolId, aiTools.id))
    .leftJoin(aiToolCategories, eq(aiTools.categoryId, aiToolCategories.id))
    .leftJoin(
      aiToolProfileVersions,
      eq(
        assessmentSelectedTools.toolProfileVersionId,
        aiToolProfileVersions.id,
      ),
    )
    .where(eq(assessmentSelectedTools.assessmentSessionId, session.id));

  const unknownRequests = await db
    .select()
    .from(unknownToolRequests)
    .where(eq(unknownToolRequests.assessmentSessionId, session.id));

  return {
    session,
    companyProfile,
    answers,
    selectedTools,
    unknownToolRequests: unknownRequests,
  };
}

export async function getAssessmentScoreByPublicToken(
  publicToken: string,
): Promise<typeof assessmentScores.$inferSelect | null> {
  const db = getDb();

  const [session] = await db
    .select({ id: assessmentSessions.id })
    .from(assessmentSessions)
    .where(eq(assessmentSessions.publicToken, publicToken))
    .limit(1);

  if (!session) return null;

  const [score] = await db
    .select()
    .from(assessmentScores)
    .where(eq(assessmentScores.assessmentSessionId, session.id))
    .limit(1);

  return score ?? null;
}

export async function getAssessmentRiskSignalsByPublicToken(
  publicToken: string,
): Promise<(typeof assessmentRiskSignals.$inferSelect)[]> {
  const db = getDb();

  const [session] = await db
    .select({ id: assessmentSessions.id })
    .from(assessmentSessions)
    .where(eq(assessmentSessions.publicToken, publicToken))
    .limit(1);

  if (!session) return [];

  return db
    .select()
    .from(assessmentRiskSignals)
    .where(eq(assessmentRiskSignals.assessmentSessionId, session.id));
}

export async function replaceAssessmentScoreAndSignalsForSession(input: {
  assessmentSessionId: string;
  scoreInsert: Omit<
    typeof assessmentScores.$inferInsert,
    "id" | "assessmentSessionId" | "createdAt" | "calculatedAt"
  >;
  signals: Array<{
    signalKey: string;
    severity: (typeof assessmentRiskSignals.$inferInsert)["severity"];
    sourceAnswerIds: string[];
  }>;
}): Promise<void> {
  const db = getDb();

  await db.transaction(async (tx) => {
    await tx
      .delete(assessmentRiskSignals)
      .where(
        eq(
          assessmentRiskSignals.assessmentSessionId,
          input.assessmentSessionId,
        ),
      );

    await tx
      .delete(assessmentScores)
      .where(
        eq(assessmentScores.assessmentSessionId, input.assessmentSessionId),
      );

    await tx.insert(assessmentScores).values({
      assessmentSessionId: input.assessmentSessionId,
      ...input.scoreInsert,
    });

    if (input.signals.length > 0) {
      await tx.insert(assessmentRiskSignals).values(
        input.signals.map((s) => ({
          assessmentSessionId: input.assessmentSessionId,
          signalKey: s.signalKey,
          severity: s.severity,
          sourceAnswerIds: s.sourceAnswerIds,
        })),
      );
    }
  });
}
