import type {
  AssessmentScoringInput,
  RiskSignal,
  ScoringConfidence,
} from "./types";

type AnswerMap = Record<string, string | string[]>;

function answersToMap(answers: AssessmentScoringInput["answers"]): AnswerMap {
  const map: AnswerMap = {};
  for (const row of answers) {
    map[row.questionId] = row.value;
  }
  return map;
}

function countNotSureValues(value: unknown): number {
  if (Array.isArray(value)) {
    return value.filter((v) => v === "not_sure").length;
  }
  return value === "not_sure" ? 1 : 0;
}

export function computeScoringConfidence(input: {
  scoringInput: AssessmentScoringInput;
  signals: RiskSignal[];
}): ScoringConfidence {
  const { scoringInput } = input;
  const answers = answersToMap(scoringInput.answers);

  let downgradePoints = 0;

  // Tool uncertainty
  if (scoringInput.hasNotSureToolSelection) downgradePoints += 2;
  if (scoringInput.unknownTools.length > 0) downgradePoints += 2;

  // Tool profile confidence
  const lowOrUnknownProfiles = scoringInput.selectedTools.filter(
    (t) =>
      t.publicInfoConfidenceLevel === "low" ||
      t.publicInfoConfidenceLevel === "unknown",
  ).length;
  const mediumProfiles = scoringInput.selectedTools.filter(
    (t) => t.publicInfoConfidenceLevel === "medium",
  ).length;

  if (lowOrUnknownProfiles >= 1) downgradePoints += 2;
  if (lowOrUnknownProfiles >= 3) downgradePoints += 1;
  if (mediumProfiles >= 2) downgradePoints += 1;

  // Answer uncertainty (not_sure)
  const notSureCount =
    Object.values(answers).reduce((acc, v) => acc + countNotSureValues(v), 0) +
    scoringInput.answers.reduce(
      (acc, a) => acc + countNotSureValues(a.value),
      0,
    );
  // The second sum is redundant if answers are unique by ID, but it keeps behavior stable
  // if the input includes duplicate rows; risk scoring remains conservative.
  if (notSureCount >= 4) downgradePoints += 1;
  if (notSureCount >= 8) downgradePoints += 2;

  // Key questions that influence visibility/exposure confidence
  const keyIds = [
    "security_can_review_usage",
    "ai_usage_logs_available",
    "can_investigate_exposure",
    "data_entering_ai",
    "files_uploaded",
    "meeting_transcripts_processed",
    "developer_workflows_involved",
  ] as const;
  const keyNotSure = keyIds.reduce(
    (acc, id) => acc + countNotSureValues(answers[id]),
    0,
  );
  if (keyNotSure >= 2) downgradePoints += 1;
  if (keyNotSure >= 4) downgradePoints += 2;

  // Signals with low confidence suggest reduced certainty.
  const lowConfidenceSignals = input.signals.filter(
    (s) => s.confidence === "low",
  ).length;
  if (lowConfidenceSignals >= 2) downgradePoints += 1;

  if (downgradePoints >= 6) return "low";
  if (downgradePoints >= 3) return "medium";
  return "high";
}
