"use client";

import { useActionState, useMemo, useState, type FormEvent } from "react";

import { FormAlert } from "@/features/company-profile/components/FormError";
import { submitAssessmentAnswers } from "@/features/assessment-wizard/actions";
import { getActiveSectionIds } from "@/features/assessment-wizard/agentic-trigger";
import { ASSESSMENT_SECTIONS } from "@/features/assessment-wizard/constants";
import { getQuestionsForSection } from "@/features/assessment-wizard/questions";
import type {
  AnswerMap,
  AssessmentSectionId,
  AssessmentWizardFormState,
  SelectedToolContext,
} from "@/features/assessment-wizard/types";
import { INITIAL_ASSESSMENT_WIZARD_FORM_STATE } from "@/features/assessment-wizard/types";
import { validateSectionAnswers } from "@/features/assessment-wizard/validation";

import { AssessmentAnswerSummary } from "./AssessmentAnswerSummary";
import { AssessmentCheckboxCard } from "./AssessmentCheckboxCard";
import { AssessmentNavigation } from "./AssessmentNavigation";
import { AssessmentQuestionCard } from "./AssessmentQuestionCard";
import { AssessmentRadioCard } from "./AssessmentRadioCard";
import { AssessmentSectionFrame } from "./AssessmentSectionFrame";
import { AssessmentWizardProgress } from "./AssessmentWizardProgress";

export type AssessmentWizardProps = {
  sessionToken: string;
  toolContext: SelectedToolContext;
};

function buildAnswersPayload(
  answers: AnswerMap,
  toolContext: SelectedToolContext,
): string {
  const activeSectionIds = new Set(
    getActiveSectionIds(toolContext, answers) as AssessmentSectionId[],
  );
  const payload = [];

  for (const section of ASSESSMENT_SECTIONS) {
    if (!activeSectionIds.has(section.id)) {
      continue;
    }
    for (const question of getQuestionsForSection(section.id)) {
      const value = answers[question.id];
      if (value === undefined) {
        continue;
      }
      if (question.answerType === "multi_select" && Array.isArray(value)) {
        if (value.length === 0) continue;
      }
      if (
        question.answerType === "single_select" &&
        typeof value === "string" &&
        value.length === 0
      ) {
        continue;
      }
      payload.push({
        questionId: question.id,
        sectionId: question.sectionId,
        answerType: question.answerType,
        value,
      });
    }
  }

  return JSON.stringify(payload);
}

export function AssessmentWizard({
  sessionToken,
  toolContext,
}: AssessmentWizardProps) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [sectionIndex, setSectionIndex] = useState(0);
  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>(
    {},
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const [formState, submitAction, isPending] = useActionState<
    AssessmentWizardFormState,
    FormData
  >(submitAssessmentAnswers, INITIAL_ASSESSMENT_WIZARD_FORM_STATE);

  const activeSectionIds = useMemo(
    () => getActiveSectionIds(toolContext, answers) as AssessmentSectionId[],
    [toolContext, answers],
  );

  const activeSections = useMemo(
    () =>
      ASSESSMENT_SECTIONS.filter((section) =>
        activeSectionIds.includes(section.id),
      ),
    [activeSectionIds],
  );

  const currentSection = activeSections[sectionIndex];
  const currentQuestions = currentSection
    ? getQuestionsForSection(currentSection.id)
    : [];
  const isFirstSection = sectionIndex === 0;
  const isLastSection = sectionIndex === activeSections.length - 1;

  const formError =
    clientError ??
    formState.fieldErrors?.form?.[0] ??
    (formState.status === "error" ? formState.message : undefined);

  function setSingleAnswer(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setSectionErrors((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  }

  function setMultiAnswer(
    questionId: string,
    optionValue: string,
    checked: boolean,
  ) {
    setAnswers((current) => {
      const existing = current[questionId];
      const currentValues = Array.isArray(existing) ? existing : [];
      const nextValues = checked
        ? [...currentValues, optionValue]
        : currentValues.filter((value) => value !== optionValue);
      return { ...current, [questionId]: nextValues };
    });
    setSectionErrors((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  }

  function handleNext() {
    if (!currentSection) {
      return;
    }
    const errors = validateSectionAnswers(
      currentSection.id,
      answers,
      toolContext,
    );
    if (Object.keys(errors).length > 0) {
      setSectionErrors(errors);
      setClientError("Please answer all required questions in this section.");
      return;
    }
    setClientError(null);
    setSectionErrors({});
    setSectionIndex((index) => Math.min(index + 1, activeSections.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setClientError(null);
    setSectionErrors({});
    setSectionIndex((index) => Math.max(index - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!isLastSection) {
      event.preventDefault();
      handleNext();
      return;
    }

    if (!currentSection) {
      event.preventDefault();
      return;
    }

    const errors = validateSectionAnswers(
      currentSection.id,
      answers,
      toolContext,
    );
    if (Object.keys(errors).length > 0) {
      event.preventDefault();
      setSectionErrors(errors);
      setClientError("Please answer all required questions before continuing.");
    } else {
      setClientError(null);
    }
  }

  if (!currentSection) {
    return null;
  }

  const serverFieldErrors = formState.fieldErrors ?? {};

  return (
    <form action={submitAction} onSubmit={handleSubmit} className="space-y-8">
      <AssessmentWizardProgress
        currentSection={sectionIndex + 1}
        totalSections={activeSections.length}
      />

      <AssessmentAnswerSummary answers={answers} toolContext={toolContext} />

      <AssessmentSectionFrame
        title={currentSection.title}
        description={currentSection.description}
      >
        {currentQuestions.map((question) => {
          const error =
            sectionErrors[question.id] ?? serverFieldErrors[question.id]?.[0];

          return (
            <AssessmentQuestionCard
              key={question.id}
              questionId={question.id}
              title={question.title}
              helperText={question.helperText}
              frameworkHint={question.frameworkHint}
              error={error}
            >
              {question.answerType === "single_select"
                ? question.options.map((option) => (
                    <AssessmentRadioCard
                      key={option.value}
                      id={`${question.id}-${option.value}`}
                      name={question.id}
                      value={option.value}
                      label={option.label}
                      description={option.description}
                      checked={answers[question.id] === option.value}
                      onChange={(value) => setSingleAnswer(question.id, value)}
                    />
                  ))
                : question.options.map((option) => {
                    const selected = answers[question.id];
                    const selectedValues = Array.isArray(selected)
                      ? selected
                      : [];
                    return (
                      <AssessmentCheckboxCard
                        key={option.value}
                        id={`${question.id}-${option.value}`}
                        name={question.id}
                        value={option.value}
                        label={option.label}
                        description={option.description}
                        checked={selectedValues.includes(option.value)}
                        onChange={(value, checked) =>
                          setMultiAnswer(question.id, value, checked)
                        }
                      />
                    );
                  })}
            </AssessmentQuestionCard>
          );
        })}
      </AssessmentSectionFrame>

      {formError ? <FormAlert message={formError} /> : null}

      <input type="hidden" name="sessionToken" value={sessionToken} />
      <input
        type="hidden"
        name="answersJson"
        value={buildAnswersPayload(answers, toolContext)}
        readOnly
      />

      <AssessmentNavigation
        sessionToken={sessionToken}
        isFirstSection={isFirstSection}
        isLastSection={isLastSection}
        isPending={isPending}
        onBack={handleBack}
        onNext={handleNext}
      />
    </form>
  );
}
