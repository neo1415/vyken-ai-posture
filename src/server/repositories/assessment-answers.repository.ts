import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { assessmentAnswers } from "@/lib/db/schema/assessments";

export type AssessmentAnswerInsert = {
  assessmentSessionId: string;
  questionId: string;
  sectionId: string;
  answerType: "single_select" | "multi_select";
  answerValue: string | string[];
};

export async function getAssessmentAnswersBySessionId(
  assessmentSessionId: string,
): Promise<(typeof assessmentAnswers.$inferSelect)[]> {
  const db = getDb();
  return db
    .select()
    .from(assessmentAnswers)
    .where(eq(assessmentAnswers.assessmentSessionId, assessmentSessionId));
}

export async function replaceAssessmentAnswersForSession(input: {
  assessmentSessionId: string;
  answers: AssessmentAnswerInsert[];
}): Promise<void> {
  const db = getDb();

  await db.transaction(async (tx) => {
    await tx
      .delete(assessmentAnswers)
      .where(
        eq(assessmentAnswers.assessmentSessionId, input.assessmentSessionId),
      );

    if (input.answers.length === 0) {
      return;
    }

    await tx.insert(assessmentAnswers).values(
      input.answers.map((answer) => ({
        assessmentSessionId: input.assessmentSessionId,
        questionId: answer.questionId,
        sectionId: answer.sectionId,
        answerType: answer.answerType,
        answerValue: answer.answerValue,
      })),
    );
  });
}

export async function hasAssessmentAnswersForSession(
  assessmentSessionId: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: assessmentAnswers.id })
    .from(assessmentAnswers)
    .where(eq(assessmentAnswers.assessmentSessionId, assessmentSessionId))
    .limit(1);
  return rows.length > 0;
}
