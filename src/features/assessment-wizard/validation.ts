import { z } from "zod";

import { isAgenticSectionRequired } from "./agentic-trigger";
import {
  AGENTIC_QUESTION_IDS,
  ASSESSMENT_QUESTIONS,
  getQuestionById,
} from "./questions";
import type {
  AssessmentSectionId,
  AssessmentWizardAnswer,
  AssessmentWizardSubmission,
  AnswerMap,
  SelectedToolContext,
} from "./types";

const publicTokenSchema = z
  .string()
  .trim()
  .min(32, "Session reference is invalid.")
  .max(64, "Session reference is invalid.")
  .regex(/^[A-Za-z0-9_-]+$/, "Session reference is invalid.");

const answerRowSchema = z.object({
  questionId: z.string().trim().min(1),
  sectionId: z.string().trim().min(1),
  answerType: z.enum(["single_select", "multi_select"]),
  value: z.union([z.string(), z.array(z.string())]),
});

export class AssessmentWizardValidationError extends Error {
  constructor(public fieldErrors: Record<string, string[]>) {
    super("Assessment wizard validation failed.");
    this.name = "AssessmentWizardValidationError";
  }
}

export function parseAssessmentWizardFormData(formData: FormData): {
  sessionToken: string;
  answers: AssessmentWizardAnswer[];
} {
  const sessionToken = formData.get("sessionToken")?.toString() ?? "";
  const answersJson = formData.get("answersJson")?.toString() ?? "[]";

  let answers: AssessmentWizardAnswer[] = [];
  try {
    const parsed: unknown = JSON.parse(answersJson);
    if (Array.isArray(parsed)) {
      answers = parsed as AssessmentWizardAnswer[];
    }
  } catch {
    answers = [];
  }

  return { sessionToken, answers };
}

function validateAnswerValue(
  questionId: string,
  value: string | string[],
): string | null {
  const question = getQuestionById(questionId);
  if (!question) {
    return "Unknown question.";
  }

  const allowedValues = new Set(question.options.map((option) => option.value));

  if (question.answerType === "single_select") {
    if (typeof value !== "string" || !allowedValues.has(value)) {
      return "Please select a valid option.";
    }
    return null;
  }

  if (!Array.isArray(value) || value.length === 0) {
    return "Select at least one option.";
  }

  const unique = [...new Set(value)];
  if (unique.length !== value.length) {
    return "Remove duplicate selections.";
  }

  for (const item of value) {
    if (!allowedValues.has(item)) {
      return "One or more selected options are invalid.";
    }
  }

  if (question.maxSelections && value.length > question.maxSelections) {
    return `Select up to ${question.maxSelections} options.`;
  }

  return null;
}

export function answersToMap(answers: AssessmentWizardAnswer[]): AnswerMap {
  const map: AnswerMap = {};
  for (const answer of answers) {
    map[answer.questionId] = answer.value;
  }
  return map;
}

export function getRequiredQuestionIds(
  toolContext: SelectedToolContext,
  answers: AnswerMap,
): string[] {
  const agenticRequired = isAgenticSectionRequired(toolContext, answers);
  return ASSESSMENT_QUESTIONS.filter((question) => {
    if (question.sectionId === "agentic_coding") {
      return agenticRequired;
    }
    return question.required;
  }).map((question) => question.id);
}

export function validateAssessmentWizardSubmission(input: {
  sessionToken: string;
  answers: AssessmentWizardAnswer[];
  toolContext: SelectedToolContext;
}): AssessmentWizardSubmission {
  const tokenResult = publicTokenSchema.safeParse(input.sessionToken);
  if (!tokenResult.success) {
    throw new AssessmentWizardValidationError({
      sessionToken: tokenResult.error.issues.map((i) => i.message),
    });
  }

  const answersResult = z.array(answerRowSchema).safeParse(input.answers);
  if (!answersResult.success) {
    throw new AssessmentWizardValidationError({
      form: ["Submitted answers are not in a valid format."],
    });
  }

  const answerMap = answersToMap(
    answersResult.data.map((answer) => ({
      ...answer,
      sectionId: answer.sectionId as AssessmentSectionId,
    })),
  );
  const requiredIds = new Set(
    getRequiredQuestionIds(input.toolContext, answerMap),
  );
  const fieldErrors: Record<string, string[]> = {};
  const normalizedAnswers: AssessmentWizardAnswer[] = [];

  for (const answer of answersResult.data) {
    const question = getQuestionById(answer.questionId);
    if (!question) {
      fieldErrors.form = [
        ...(fieldErrors.form ?? []),
        `Unknown question: ${answer.questionId}`,
      ];
      continue;
    }

    if (
      question.sectionId === "agentic_coding" &&
      !requiredIds.has(answer.questionId)
    ) {
      continue;
    }

    if (!requiredIds.has(answer.questionId)) {
      continue;
    }

    const valueError = validateAnswerValue(answer.questionId, answer.value);
    if (valueError) {
      fieldErrors[answer.questionId] = [valueError];
      continue;
    }

    normalizedAnswers.push({
      questionId: answer.questionId,
      sectionId: question.sectionId as AssessmentSectionId,
      answerType: question.answerType,
      value: answer.value,
    });
  }

  for (const requiredId of requiredIds) {
    if (!normalizedAnswers.some((answer) => answer.questionId === requiredId)) {
      fieldErrors[requiredId] = fieldErrors[requiredId] ?? [
        "This question is required.",
      ];
    }
  }

  for (const agenticId of AGENTIC_QUESTION_IDS) {
    if (!requiredIds.has(agenticId)) {
      const extraIndex = normalizedAnswers.findIndex(
        (answer) => answer.questionId === agenticId,
      );
      if (extraIndex >= 0) {
        normalizedAnswers.splice(extraIndex, 1);
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AssessmentWizardValidationError(fieldErrors);
  }

  return {
    sessionToken: tokenResult.data,
    answers: normalizedAnswers,
  };
}

export function formatWizardFieldErrors(
  error: unknown,
): Record<string, string[]> {
  if (error instanceof AssessmentWizardValidationError) {
    return error.fieldErrors;
  }

  if (error instanceof z.ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return fieldErrors;
  }

  return { form: ["Validation failed."] };
}

export function validateSectionAnswers(
  sectionId: AssessmentSectionId,
  answers: AnswerMap,
  toolContext: SelectedToolContext,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const agenticRequired = isAgenticSectionRequired(toolContext, answers);

  for (const question of ASSESSMENT_QUESTIONS) {
    if (question.sectionId !== sectionId) {
      continue;
    }
    if (question.sectionId === "agentic_coding" && !agenticRequired) {
      continue;
    }
    if (!question.required) {
      continue;
    }

    const value = answers[question.id];
    const error = validateAnswerValue(
      question.id,
      value ?? (question.answerType === "multi_select" ? [] : ""),
    );
    if (error) {
      errors[question.id] = error;
    }
  }

  return errors;
}
