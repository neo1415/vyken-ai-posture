export type AssessmentAnswerType = "single_select" | "multi_select";

export type AssessmentQuestionOption = {
  value: string;
  label: string;
  description?: string;
};

export type AssessmentQuestion = {
  id: string;
  sectionId: AssessmentSectionId;
  title: string;
  helperText?: string;
  frameworkHint?: string;
  answerType: AssessmentAnswerType;
  required: boolean;
  options: AssessmentQuestionOption[];
  maxSelections?: number;
};

export type AssessmentSectionId =
  | "usage_context"
  | "data_exposure"
  | "governance_controls"
  | "visibility_auditability"
  | "agentic_coding";

export type AssessmentSection = {
  id: AssessmentSectionId;
  title: string;
  description: string;
};

/** Safe tool context for client-side agentic trigger preview. No DB IDs. */
export type SelectedToolContext = {
  hasNotSure: boolean;
  categorySlugs: string[];
  codingAssistantRelevance: boolean;
  agenticOrConnectedRelevance: boolean;
};

export type AssessmentAnswerValue = string | string[];

export type AnswerMap = Record<string, AssessmentAnswerValue>;

export type AssessmentWizardAnswer = {
  questionId: string;
  sectionId: AssessmentSectionId;
  answerType: AssessmentAnswerType;
  value: AssessmentAnswerValue;
};

export type AssessmentWizardSubmission = {
  sessionToken: string;
  answers: AssessmentWizardAnswer[];
};

export type AssessmentWizardFieldErrors = Partial<
  Record<string | "form" | "sessionToken", string[]>
>;

export type AssessmentWizardFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: AssessmentWizardFieldErrors;
};

export const INITIAL_ASSESSMENT_WIZARD_FORM_STATE: AssessmentWizardFormState = {
  status: "idle",
};
