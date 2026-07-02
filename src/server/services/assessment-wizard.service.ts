import "server-only";

import type { AssessmentWizardSubmission } from "@/features/assessment-wizard/types";
import { validateAssessmentWizardSubmission } from "@/features/assessment-wizard/validation";
import { replaceAssessmentAnswersForSession } from "@/server/repositories/assessment-answers.repository";
import { getAssessmentSessionByPublicToken } from "@/server/repositories/assessment-sessions.repository";
import { getCompanyProfileBySessionId } from "@/server/repositories/company-profiles.repository";
import {
  getSelectedToolContextForAssessment,
  hasToolSelectionsForSession,
} from "@/server/repositories/tool-selection.repository";

export class AssessmentWizardError extends Error {
  constructor(
    message: string,
    readonly code:
      | "session_not_found"
      | "missing_profile"
      | "missing_tools" = "session_not_found",
  ) {
    super(message);
    this.name = "AssessmentWizardError";
  }
}

function toSafeToolContext(
  row: Awaited<ReturnType<typeof getSelectedToolContextForAssessment>>,
) {
  return {
    hasNotSure: row.hasNotSure,
    categorySlugs: row.categorySlugs,
    codingAssistantRelevance: row.codingAssistantRelevance,
    agenticOrConnectedRelevance: row.agenticOrConnectedRelevance,
  };
}

export async function loadAssessmentWizardContext(
  publicToken: string,
): Promise<{
  toolContext: ReturnType<typeof toSafeToolContext>;
} | null> {
  const session = await getAssessmentSessionByPublicToken(publicToken);
  if (!session) {
    return null;
  }

  const companyProfile = await getCompanyProfileBySessionId(session.id);
  if (!companyProfile) {
    return null;
  }

  const hasSelections = await hasToolSelectionsForSession(session.id);
  if (!hasSelections) {
    return null;
  }

  const toolContext = await getSelectedToolContextForAssessment(session.id);
  return { toolContext: toSafeToolContext(toolContext) };
}

export async function saveAssessmentWizardAnswers(input: {
  sessionToken: string;
  answers: AssessmentWizardSubmission["answers"];
}): Promise<{ publicToken: string }> {
  const session = await getAssessmentSessionByPublicToken(input.sessionToken);
  if (!session) {
    throw new AssessmentWizardError(
      "Assessment session not found.",
      "session_not_found",
    );
  }

  const companyProfile = await getCompanyProfileBySessionId(session.id);
  if (!companyProfile) {
    throw new AssessmentWizardError(
      "Company profile not found for this session.",
      "missing_profile",
    );
  }

  const hasSelections = await hasToolSelectionsForSession(session.id);
  if (!hasSelections) {
    throw new AssessmentWizardError(
      "Tool selections not found for this session.",
      "missing_tools",
    );
  }

  const toolContextRow = await getSelectedToolContextForAssessment(session.id);
  const toolContext = toSafeToolContext(toolContextRow);

  const validated = validateAssessmentWizardSubmission({
    sessionToken: input.sessionToken,
    answers: input.answers,
    toolContext,
  });

  await replaceAssessmentAnswersForSession({
    assessmentSessionId: session.id,
    answers: validated.answers.map((answer) => ({
      assessmentSessionId: session.id,
      questionId: answer.questionId,
      sectionId: answer.sectionId,
      answerType: answer.answerType,
      answerValue: answer.value,
    })),
  });

  return { publicToken: session.publicToken };
}
