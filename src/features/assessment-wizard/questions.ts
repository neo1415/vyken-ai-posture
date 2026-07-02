import type { AssessmentQuestion, AssessmentSectionId } from "./types";

const notSure = { value: "not_sure", label: "Not sure" } as const;

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // --- Usage Context ---
  {
    id: "tools_currently_used",
    sectionId: "usage_context",
    title: "Are these AI tools already being used in your organization?",
    frameworkHint:
      "NIST AI RMF-style mapping: identify where AI is used before risk can be managed.",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes, already in use" },
      { value: "being_considered", label: "Being considered / pilot" },
      {
        value: "some_used_some_considered",
        label: "Some in use, some being considered",
      },
      notSure,
    ],
  },
  {
    id: "tools_officially_approved",
    sectionId: "usage_context",
    title: "Are these tools officially approved?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes_approved", label: "Yes, officially approved" },
      { value: "some_approved", label: "Some approved, not all" },
      { value: "no", label: "No formal approval" },
      notSure,
    ],
  },
  {
    id: "account_types",
    sectionId: "usage_context",
    title: "What account types are employees using?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "company_managed", label: "Company-managed accounts" },
      { value: "personal", label: "Personal accounts" },
      { value: "both", label: "Both company and personal" },
      notSure,
    ],
  },
  {
    id: "teams_using_ai",
    sectionId: "usage_context",
    title: "Which teams use or may use these tools?",
    answerType: "multi_select",
    required: true,
    options: [
      { value: "it_security", label: "IT / Security" },
      { value: "engineering", label: "Engineering" },
      { value: "customer_support", label: "Customer support" },
      { value: "sales_marketing", label: "Sales / Marketing" },
      { value: "legal_compliance", label: "Legal / Compliance" },
      { value: "finance", label: "Finance" },
      { value: "hr", label: "HR" },
      { value: "operations", label: "Operations" },
      { value: "claims_underwriting", label: "Claims / Underwriting" },
      { value: "leadership", label: "Leadership" },
      { value: "other", label: "Other" },
      notSure,
    ],
  },
  {
    id: "main_ai_tasks",
    sectionId: "usage_context",
    title: "What are the tools mainly used for?",
    answerType: "multi_select",
    required: true,
    options: [
      { value: "drafting_writing", label: "Drafting / writing" },
      { value: "research", label: "Research" },
      { value: "document_summary", label: "Document summary" },
      { value: "coding", label: "Coding / software development" },
      {
        value: "meeting_notes_transcripts",
        label: "Meeting notes / transcripts",
      },
      { value: "customer_support", label: "Customer support" },
      { value: "data_analysis", label: "Data analysis" },
      { value: "legal_contract_review", label: "Legal / contract review" },
      {
        value: "claims_underwriting_fraud_review",
        label: "Claims / underwriting / fraud review",
      },
      { value: "decision_support", label: "Decision support" },
      { value: "workflow_automation", label: "Workflow automation" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "ai_outputs_influence_decisions",
    sectionId: "usage_context",
    title:
      "Do AI outputs influence decisions about customers, employees, applicants, vendors, or users?",
    helperText:
      "Risk-based AI governance treats some use cases as more sensitive when they affect people, customers, employees, access to services, or regulated decisions.",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "sometimes", label: "Sometimes" },
      notSure,
    ],
  },

  // --- Data Exposure ---
  {
    id: "data_entering_ai",
    sectionId: "data_exposure",
    title:
      "What data may enter prompts, uploads, transcripts, or AI workspaces?",
    answerType: "multi_select",
    required: true,
    options: [
      { value: "public_information", label: "Public information" },
      { value: "internal_documents", label: "Internal documents" },
      { value: "customer_personal_data", label: "Customer personal data" },
      { value: "employee_data", label: "Employee data" },
      { value: "financial_records", label: "Financial records" },
      { value: "legal_contracts", label: "Legal contracts" },
      { value: "claims_documents", label: "Claims documents" },
      { value: "kyc_identity_data", label: "KYC / identity data" },
      { value: "health_medical_data", label: "Health / medical data" },
      { value: "source_code", label: "Source code" },
      { value: "logs", label: "Logs" },
      {
        value: "api_keys_secrets_tokens",
        label: "API keys / secrets / tokens",
      },
      {
        value: "meeting_recordings_transcripts",
        label: "Meeting recordings / transcripts",
      },
      {
        value: "strategy_confidential_plans",
        label: "Strategy / confidential plans",
      },
      notSure,
    ],
  },
  {
    id: "files_uploaded",
    sectionId: "data_exposure",
    title: "Are files uploaded into AI tools?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "sometimes", label: "Sometimes" },
      notSure,
    ],
  },
  {
    id: "meeting_transcripts_processed",
    sectionId: "data_exposure",
    title: "Are meeting recordings or transcripts processed by AI tools?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "sometimes", label: "Sometimes" },
      notSure,
    ],
  },
  {
    id: "developer_workflows_involved",
    sectionId: "data_exposure",
    title: "Are source code, logs, secrets, or developer workflows involved?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "sometimes", label: "Sometimes" },
      notSure,
    ],
  },

  // --- Governance Controls ---
  {
    id: "ai_usage_policy",
    sectionId: "governance_controls",
    title: "Does your organization have an AI usage policy?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes_approved", label: "Yes, approved policy exists" },
      { value: "draft_in_progress", label: "Draft / in progress" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "employees_know_approved_tools",
    sectionId: "governance_controls",
    title: "Do employees know which AI tools are approved?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "partly", label: "Partly" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "sensitive_data_rules",
    sectionId: "governance_controls",
    title: "Are there rules for what data must not be entered into AI tools?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "partly", label: "Partly" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "vendor_review_process",
    sectionId: "governance_controls",
    title: "Is there a vendor review process before approving AI tools?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "partly", label: "Partly" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "human_review_required",
    sectionId: "governance_controls",
    title: "Is human review required for sensitive AI-assisted decisions?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "partly", label: "Partly" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "ai_governance_owner",
    sectionId: "governance_controls",
    title: "Is someone responsible for AI governance?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes, clearly assigned" },
      { value: "informal", label: "Informally, not formalized" },
      { value: "no", label: "No clear owner" },
      notSure,
    ],
  },

  // --- Visibility / Auditability ---
  {
    id: "security_can_review_usage",
    sectionId: "visibility_auditability",
    title: "Can security, compliance, or IT review AI usage later?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes_centrally", label: "Yes, centrally" },
      { value: "partly", label: "Partly" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "ai_usage_logs_available",
    sectionId: "visibility_auditability",
    title: "Are AI usage logs available for review?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "some_tools_only", label: "For some tools only" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "risky_activity_controls",
    sectionId: "visibility_auditability",
    title: "Can risky AI activity be blocked, redacted, alerted on, or logged?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "partly", label: "Partly" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "can_investigate_exposure",
    sectionId: "visibility_auditability",
    title:
      "Can your organization investigate whether sensitive data was pasted, uploaded, or exposed through AI tools?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "partly", label: "Partly" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "role_tool_data_controls",
    sectionId: "visibility_auditability",
    title: "Can controls differ by role, team, tool, or data type?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "partly", label: "Partly" },
      { value: "no", label: "No" },
      notSure,
    ],
  },

  // --- Agentic / Coding (conditional) ---
  {
    id: "developers_use_ai_coding_assistants",
    sectionId: "agentic_coding",
    title: "Are AI coding assistants used by developers?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "ai_can_access_repositories_files",
    sectionId: "agentic_coding",
    title: "Can AI tools access repositories, local files, or project folders?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "ai_can_run_commands_or_modify_files",
    sectionId: "agentic_coding",
    title:
      "Can AI tools run commands, modify files, create pull requests, or take actions?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "mcp_or_connected_tools_used",
    sectionId: "agentic_coding",
    title: "Are MCP servers or connected AI tools used?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "ai_connects_to_internal_systems",
    sectionId: "agentic_coding",
    title:
      "Can AI tools connect to APIs, databases, cloud resources, Slack, Google Drive, internal docs, or other business systems?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "ai_generated_code_reviewed",
    sectionId: "agentic_coding",
    title: "Are AI-generated code changes reviewed before merge or deployment?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "always", label: "Always" },
      { value: "sometimes", label: "Sometimes" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
  {
    id: "secrets_or_production_data_exposure_possible",
    sectionId: "agentic_coding",
    title:
      "Could secrets, logs, tokens, credentials, production data, or customer data be exposed through developer AI tools?",
    answerType: "single_select",
    required: true,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      notSure,
    ],
  },
];

const QUESTION_BY_ID = new Map(
  ASSESSMENT_QUESTIONS.map((question) => [question.id, question]),
);

export function getQuestionById(
  questionId: string,
): AssessmentQuestion | undefined {
  return QUESTION_BY_ID.get(questionId);
}

export function getQuestionsForSection(
  sectionId: AssessmentSectionId,
): AssessmentQuestion[] {
  return ASSESSMENT_QUESTIONS.filter(
    (question) => question.sectionId === sectionId,
  );
}

export const ALL_QUESTION_IDS = ASSESSMENT_QUESTIONS.map((q) => q.id);

export const AGENTIC_QUESTION_IDS = ASSESSMENT_QUESTIONS.filter(
  (q) => q.sectionId === "agentic_coding",
).map((q) => q.id);
