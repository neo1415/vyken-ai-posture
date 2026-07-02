import "server-only";

import type {
  AssessmentScoringInput,
  AssessmentScoringResult,
} from "@/features/scoring/types";
import { scoreAssessment } from "@/features/scoring/scoring-engine";
import { validateScoringInput } from "@/features/scoring/validation";
import { isAgenticSectionRequired } from "@/features/assessment-wizard/agentic-trigger";
import type { AnswerMap } from "@/features/assessment-wizard/types";

import {
  getScoringInputByPublicToken,
  replaceAssessmentScoreAndSignalsForSession,
  getAssessmentScoreByPublicToken,
  getAssessmentRiskSignalsByPublicToken,
} from "@/server/repositories/assessment-scoring.repository";

export class AssessmentScoringError extends Error {
  constructor(
    message: string,
    readonly code:
      | "session_not_found"
      | "missing_profile"
      | "missing_tools"
      | "missing_answers" = "session_not_found",
  ) {
    super(message);
    this.name = "AssessmentScoringError";
  }
}

function answersToWizardMap(
  input: AssessmentScoringInput["answers"],
): AnswerMap {
  const map: AnswerMap = {};
  for (const row of input) {
    map[row.questionId] = row.value;
  }
  return map;
}

function buildScoringInput(
  row: Awaited<ReturnType<typeof getScoringInputByPublicToken>>,
): {
  scoringInput: AssessmentScoringInput;
  assessmentSessionId: string;
} {
  if (!row) {
    throw new AssessmentScoringError(
      "Assessment session not found.",
      "session_not_found",
    );
  }

  const knownToolRows = row.selectedTools.filter(
    (t) =>
      t.selectionType === "known_tool" && t.tool && t.category && t.profile,
  );
  const unknownTools = row.selectedTools
    .filter((t) => t.selectionType === "unknown_tool")
    .map((t) => ({
      name: t.unknownToolName ?? "Unknown tool",
      url: t.unknownToolUrl ?? null,
    }));
  const hasNotSureToolSelection = row.selectedTools.some(
    (t) => t.selectionType === "not_sure",
  );

  const scoringInput: AssessmentScoringInput = {
    companyProfile: {
      industry: row.companyProfile.industry,
      companySize: row.companyProfile.companySize,
      countryRegion: row.companyProfile.countryRegion ?? null,
      handlesSensitiveOrRegulatedData:
        row.companyProfile.handlesSensitiveOrRegulatedData ?? null,
    },
    selectedTools: knownToolRows.map((t) => ({
      toolSlug: t.tool!.slug,
      toolName: t.tool!.name,
      categorySlug: t.category!.slug,
      supportsFileUploads: t.profile!.supportsFileUploads ?? null,
      supportsMeetingTranscripts: t.profile!.supportsMeetingTranscripts ?? null,
      codingAssistantRelevance: t.profile!.codingAssistantRelevance ?? null,
      agenticOrConnectedToolRelevance:
        t.profile!.agenticOrConnectedToolRelevance ?? null,
      publicInfoConfidenceLevel: t.profile!.publicInfoConfidenceLevel,
    })),
    unknownTools,
    hasNotSureToolSelection,
    answers: row.answers.map((a) => ({
      questionId: a.questionId,
      value: a.answerValue as string | string[],
    })),
  };

  return { scoringInput, assessmentSessionId: row.session.id };
}

function toRiskLevelEnum(level: "low" | "moderate" | "high" | "critical") {
  return level;
}

function toDimensionLevel(result: AssessmentScoringResult, categoryId: string) {
  const category = result.categoryScores.find(
    (c) => c.categoryId === categoryId,
  );
  return category ? toRiskLevelEnum(category.riskLevel) : "low";
}

export async function scoreAssessmentSession(
  publicToken: string,
): Promise<AssessmentScoringResult> {
  const row = await getScoringInputByPublicToken(publicToken);
  if (!row) {
    throw new AssessmentScoringError(
      "Assessment session not found.",
      "session_not_found",
    );
  }
  if (!row.companyProfile) {
    throw new AssessmentScoringError(
      "Company profile not found for this session.",
      "missing_profile",
    );
  }
  if (row.selectedTools.length === 0) {
    throw new AssessmentScoringError(
      "Tool selections not found for this session.",
      "missing_tools",
    );
  }
  if (row.answers.length === 0) {
    throw new AssessmentScoringError(
      "Assessment answers not found.",
      "missing_answers",
    );
  }

  const { scoringInput, assessmentSessionId } = buildScoringInput(row);
  validateScoringInput(scoringInput);

  const result = scoreAssessment(scoringInput);

  const answerMap = answersToWizardMap(scoringInput.answers);
  const agenticRequired = isAgenticSectionRequired(
    {
      hasNotSure: scoringInput.hasNotSureToolSelection,
      categorySlugs: scoringInput.selectedTools.map((t) => t.categorySlug),
      codingAssistantRelevance: scoringInput.selectedTools.some(
        (t) => t.codingAssistantRelevance === true,
      ),
      agenticOrConnectedRelevance: scoringInput.selectedTools.some(
        (t) => t.agenticOrConnectedToolRelevance === true,
      ),
    },
    answerMap,
  );

  await replaceAssessmentScoreAndSignalsForSession({
    assessmentSessionId,
    scoreInsert: {
      overallRiskLevel: toRiskLevelEnum(result.overallRiskLevel),
      toolStackRiskLevel: toDimensionLevel(result, "vendor_and_tool_risk"),
      dataExposureRiskLevel: toDimensionLevel(result, "data_exposure"),
      governanceMaturityGapLevel: toDimensionLevel(
        result,
        "governance_controls",
      ),
      auditabilityEnforcementGapLevel: toDimensionLevel(
        result,
        "visibility_and_inventory",
      ),
      agenticCodingRiskLevel: agenticRequired
        ? toDimensionLevel(result, "agentic_and_coding_risk")
        : "unknown",
      leadQualificationScore: null,
      scoreBreakdown: {
        ...result,
        persistedAt: new Date().toISOString(),
      },
    },
    signals: result.signals.map((s) => ({
      signalKey: s.signalId,
      severity: toRiskLevelEnum(
        s.severity === "medium" ? "moderate" : s.severity,
      ),
      sourceAnswerIds: s.sourceAnswerIds,
    })),
  });

  return result;
}

export async function getAssessmentScoringPreview(
  publicToken: string,
): Promise<AssessmentScoringResult | null> {
  const row = await getScoringInputByPublicToken(publicToken);
  if (!row) return null;
  if (row.answers.length === 0) return null;

  // Compute/persist only if score absent; caller can request recompute separately.
  const existing = await getAssessmentScoreByPublicToken(publicToken);
  if (!existing) {
    return await scoreAssessmentSession(publicToken);
  }

  // Prefer returning a computed preview consistent with current engine, not trusting stored JSON.
  const { scoringInput } = buildScoringInput(row);
  validateScoringInput(scoringInput);
  return scoreAssessment(scoringInput);
}

export async function getPersistedScoringCounts(publicToken: string): Promise<{
  hasScore: boolean;
  signalCount: number;
}> {
  const existing = await getAssessmentScoreByPublicToken(publicToken);
  const signals = await getAssessmentRiskSignalsByPublicToken(publicToken);
  return { hasScore: Boolean(existing), signalCount: signals.length };
}
