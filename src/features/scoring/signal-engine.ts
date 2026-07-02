import type { AssessmentScoringInput, RiskSignal } from "./types";
import { buildSignalBase } from "./signal-definitions";
import { dedupeSignalsById } from "./validation";

type AnswerMap = Record<string, string | string[]>;

function answersToMap(answers: AssessmentScoringInput["answers"]): AnswerMap {
  const map: AnswerMap = {};
  for (const row of answers) {
    map[row.questionId] = row.value;
  }
  return map;
}

function isNotSure(value: unknown): boolean {
  return value === "not_sure";
}

function includesValue(value: unknown, expected: string): boolean {
  return Array.isArray(value) ? value.includes(expected) : value === expected;
}

function includesAny(value: unknown, expected: string[]): boolean {
  return expected.some((x) => includesValue(value, x));
}

function selectedToolCategorySlugs(input: AssessmentScoringInput): Set<string> {
  return new Set(input.selectedTools.map((t) => t.categorySlug));
}

export function generateRiskSignals(
  input: AssessmentScoringInput,
): RiskSignal[] {
  const answers = answersToMap(input.answers);
  const signals: RiskSignal[] = [];

  const categorySlugs = selectedToolCategorySlugs(input);
  const hasUnknownTools = input.unknownTools.length > 0;
  const hasNotSureTools = input.hasNotSureToolSelection;
  const hasLowConfidenceProfiles = input.selectedTools.some(
    (t) =>
      t.publicInfoConfidenceLevel === "low" ||
      t.publicInfoConfidenceLevel === "unknown",
  );
  const hasMediumConfidenceProfiles = input.selectedTools.some(
    (t) => t.publicInfoConfidenceLevel === "medium",
  );

  // --- Visibility / inventory ---
  if (
    hasNotSureTools ||
    hasUnknownTools ||
    isNotSure(answers.tools_currently_used) ||
    isNotSure(answers.tools_officially_approved) ||
    isNotSure(answers.security_can_review_usage) ||
    answers.security_can_review_usage === "no"
  ) {
    signals.push(
      buildSignalBase({
        signalId: "shadow_ai_visibility_gap",
        severity:
          hasNotSureTools || isNotSure(answers.security_can_review_usage)
            ? "high"
            : "medium",
        evidence: [
          hasNotSureTools ? "Tool selection included 'Not sure'." : null,
          hasUnknownTools ? "Unknown tools were added." : null,
          isNotSure(answers.security_can_review_usage)
            ? "Not sure if usage can be reviewed."
            : null,
          answers.security_can_review_usage === "no"
            ? "Usage review capability indicated as 'No'."
            : null,
        ].filter((x): x is string => Boolean(x)),
        sourceAnswerIds: [
          "tools_currently_used",
          "tools_officially_approved",
          "security_can_review_usage",
        ].filter((id) => id in answers),
        confidence: "medium",
      }),
    );
  }

  if (hasUnknownTools) {
    signals.push(
      buildSignalBase({
        signalId: "unknown_tool_usage",
        severity: "high",
        evidence: input.unknownTools.map((t) =>
          t.url
            ? `Unknown tool: ${t.name} (${t.url})`
            : `Unknown tool: ${t.name}`,
        ),
        sourceAnswerIds: [],
        confidence: "low",
      }),
    );
  }

  if (
    answers.account_types === "personal" ||
    answers.account_types === "both"
  ) {
    signals.push(
      buildSignalBase({
        signalId: "personal_account_usage",
        severity: answers.account_types === "personal" ? "high" : "medium",
        evidence: [`Account types: ${String(answers.account_types)}`],
        sourceAnswerIds: ["account_types"],
        confidence: "high",
      }),
    );
  }

  if (
    answers.ai_usage_logs_available === "no" ||
    isNotSure(answers.ai_usage_logs_available) ||
    answers.ai_usage_logs_available === "some_tools_only"
  ) {
    signals.push(
      buildSignalBase({
        signalId: "limited_usage_logs",
        severity:
          answers.ai_usage_logs_available === "no" ||
          isNotSure(answers.ai_usage_logs_available)
            ? "high"
            : "medium",
        evidence: [`AI usage logs: ${String(answers.ai_usage_logs_available)}`],
        sourceAnswerIds: ["ai_usage_logs_available"],
        confidence: "high",
      }),
    );
  }

  if (
    answers.can_investigate_exposure === "no" ||
    isNotSure(answers.can_investigate_exposure)
  ) {
    signals.push(
      buildSignalBase({
        signalId: "no_exposure_investigation_capability",
        severity: "high",
        evidence: [
          `Investigation capability: ${String(answers.can_investigate_exposure)}`,
        ],
        sourceAnswerIds: ["can_investigate_exposure"],
        confidence: "high",
      }),
    );
  }

  if (
    answers.role_tool_data_controls === "no" ||
    isNotSure(answers.role_tool_data_controls)
  ) {
    signals.push(
      buildSignalBase({
        signalId: "no_role_tool_data_controls",
        severity: "medium",
        evidence: [
          `Differentiated controls: ${String(answers.role_tool_data_controls)}`,
        ],
        sourceAnswerIds: ["role_tool_data_controls"],
        confidence: "high",
      }),
    );
  }

  // --- Data exposure ---
  const dataEntering = answers.data_entering_ai;
  const hasSensitiveData =
    Array.isArray(dataEntering) &&
    includesAny(dataEntering, [
      "internal_documents",
      "customer_personal_data",
      "employee_data",
      "financial_records",
      "legal_contracts",
      "claims_documents",
      "kyc_identity_data",
      "health_medical_data",
      "source_code",
      "logs",
      "api_keys_secrets_tokens",
      "meeting_recordings_transcripts",
      "strategy_confidential_plans",
    ]);

  if (hasSensitiveData || isNotSure(dataEntering)) {
    const isCriticalSensitive = includesAny(dataEntering, [
      "api_keys_secrets_tokens",
      "health_medical_data",
      "kyc_identity_data",
    ]);
    signals.push(
      buildSignalBase({
        signalId: "sensitive_data_entering_ai",
        severity: isCriticalSensitive ? "critical" : "high",
        evidence: Array.isArray(dataEntering)
          ? [`Data entering AI: ${dataEntering.join(", ")}`]
          : ["Data entering AI: not sure"],
        sourceAnswerIds: ["data_entering_ai"],
        confidence: isNotSure(dataEntering) ? "medium" : "high",
      }),
    );
  }

  if (includesValue(dataEntering, "customer_personal_data")) {
    signals.push(
      buildSignalBase({
        signalId: "customer_personal_data_exposure",
        severity: "high",
        evidence: ["Customer personal data selected."],
        sourceAnswerIds: ["data_entering_ai"],
        confidence: "high",
      }),
    );
  }
  if (includesValue(dataEntering, "employee_data")) {
    signals.push(
      buildSignalBase({
        signalId: "employee_data_exposure",
        severity: "medium",
        evidence: ["Employee data selected."],
        sourceAnswerIds: ["data_entering_ai"],
        confidence: "high",
      }),
    );
  }
  if (includesValue(dataEntering, "financial_records")) {
    signals.push(
      buildSignalBase({
        signalId: "financial_records_exposure",
        severity: "high",
        evidence: ["Financial records selected."],
        sourceAnswerIds: ["data_entering_ai"],
        confidence: "high",
      }),
    );
  }
  if (includesValue(dataEntering, "legal_contracts")) {
    signals.push(
      buildSignalBase({
        signalId: "legal_contracts_exposure",
        severity: "high",
        evidence: ["Legal contracts selected."],
        sourceAnswerIds: ["data_entering_ai"],
        confidence: "high",
      }),
    );
  }
  if (includesValue(dataEntering, "claims_documents")) {
    signals.push(
      buildSignalBase({
        signalId: "claims_documents_exposure",
        severity: "high",
        evidence: ["Claims documents selected."],
        sourceAnswerIds: ["data_entering_ai"],
        confidence: "high",
      }),
    );
  }
  if (includesValue(dataEntering, "kyc_identity_data")) {
    signals.push(
      buildSignalBase({
        signalId: "kyc_identity_data_exposure",
        severity: "critical",
        evidence: ["KYC / identity data selected."],
        sourceAnswerIds: ["data_entering_ai"],
        confidence: "high",
      }),
    );
  }
  if (includesValue(dataEntering, "health_medical_data")) {
    signals.push(
      buildSignalBase({
        signalId: "health_data_exposure",
        severity: "critical",
        evidence: ["Health / medical data selected."],
        sourceAnswerIds: ["data_entering_ai"],
        confidence: "high",
      }),
    );
  }

  if (includesValue(dataEntering, "source_code")) {
    signals.push(
      buildSignalBase({
        signalId: "source_code_exposure",
        severity: "high",
        evidence: ["Source code selected."],
        sourceAnswerIds: ["data_entering_ai"],
        confidence: "high",
      }),
    );
  }
  if (includesValue(dataEntering, "logs")) {
    signals.push(
      buildSignalBase({
        signalId: "logs_exposure",
        severity: "high",
        evidence: ["Logs selected."],
        sourceAnswerIds: ["data_entering_ai"],
        confidence: "high",
      }),
    );
  }
  if (includesValue(dataEntering, "api_keys_secrets_tokens")) {
    signals.push(
      buildSignalBase({
        signalId: "secrets_tokens_exposure",
        severity: "critical",
        evidence: ["API keys / secrets / tokens selected."],
        sourceAnswerIds: ["data_entering_ai"],
        confidence: "high",
      }),
    );
  }
  if (includesValue(dataEntering, "meeting_recordings_transcripts")) {
    signals.push(
      buildSignalBase({
        signalId: "meeting_transcript_exposure",
        severity: "medium",
        evidence: ["Meeting recordings/transcripts selected."],
        sourceAnswerIds: ["data_entering_ai"],
        confidence: "high",
      }),
    );
  }

  if (
    answers.files_uploaded === "yes" ||
    answers.files_uploaded === "sometimes" ||
    isNotSure(answers.files_uploaded)
  ) {
    signals.push(
      buildSignalBase({
        signalId: "file_upload_exposure",
        severity: answers.files_uploaded === "yes" ? "high" : "medium",
        evidence: [`Files uploaded: ${String(answers.files_uploaded)}`],
        sourceAnswerIds: ["files_uploaded"],
        confidence: isNotSure(answers.files_uploaded) ? "medium" : "high",
      }),
    );
  }

  if (
    answers.meeting_transcripts_processed === "yes" ||
    answers.meeting_transcripts_processed === "sometimes" ||
    isNotSure(answers.meeting_transcripts_processed)
  ) {
    signals.push(
      buildSignalBase({
        signalId: "meeting_transcript_exposure",
        severity:
          answers.meeting_transcripts_processed === "yes" ? "high" : "medium",
        evidence: [
          `Meeting transcripts processed: ${String(answers.meeting_transcripts_processed)}`,
        ],
        sourceAnswerIds: ["meeting_transcripts_processed"],
        confidence: isNotSure(answers.meeting_transcripts_processed)
          ? "medium"
          : "high",
      }),
    );
  }

  // --- Governance controls ---
  if (answers.ai_usage_policy === "no" || isNotSure(answers.ai_usage_policy)) {
    signals.push(
      buildSignalBase({
        signalId: "no_ai_policy",
        severity: answers.ai_usage_policy === "no" ? "high" : "medium",
        evidence: [`AI usage policy: ${String(answers.ai_usage_policy)}`],
        sourceAnswerIds: ["ai_usage_policy"],
        confidence: isNotSure(answers.ai_usage_policy) ? "medium" : "high",
      }),
    );
  } else if (answers.ai_usage_policy === "draft_in_progress") {
    signals.push(
      buildSignalBase({
        signalId: "draft_ai_policy_only",
        severity: "medium",
        evidence: ["AI usage policy is draft/in progress."],
        sourceAnswerIds: ["ai_usage_policy"],
        confidence: "high",
      }),
    );
  }

  if (
    answers.employees_know_approved_tools === "no" ||
    answers.employees_know_approved_tools === "partly" ||
    isNotSure(answers.employees_know_approved_tools)
  ) {
    signals.push(
      buildSignalBase({
        signalId: "employees_unclear_on_approved_tools",
        severity:
          answers.employees_know_approved_tools === "no" ? "high" : "medium",
        evidence: [
          `Approved tool awareness: ${String(answers.employees_know_approved_tools)}`,
        ],
        sourceAnswerIds: ["employees_know_approved_tools"],
        confidence: "high",
      }),
    );
  }

  if (
    answers.sensitive_data_rules === "no" ||
    isNotSure(answers.sensitive_data_rules)
  ) {
    signals.push(
      buildSignalBase({
        signalId: "no_sensitive_data_rules",
        severity: "high",
        evidence: [
          `Sensitive data rules: ${String(answers.sensitive_data_rules)}`,
        ],
        sourceAnswerIds: ["sensitive_data_rules"],
        confidence: isNotSure(answers.sensitive_data_rules) ? "medium" : "high",
      }),
    );
  } else if (answers.sensitive_data_rules === "partly") {
    signals.push(
      buildSignalBase({
        signalId: "partial_sensitive_data_rules",
        severity: "medium",
        evidence: ["Sensitive data rules indicated as partial."],
        sourceAnswerIds: ["sensitive_data_rules"],
        confidence: "high",
      }),
    );
  }

  if (
    answers.vendor_review_process === "no" ||
    isNotSure(answers.vendor_review_process)
  ) {
    signals.push(
      buildSignalBase({
        signalId: "no_vendor_review",
        severity: "high",
        evidence: [
          `Vendor review process: ${String(answers.vendor_review_process)}`,
        ],
        sourceAnswerIds: ["vendor_review_process"],
        confidence: isNotSure(answers.vendor_review_process)
          ? "medium"
          : "high",
      }),
    );
  } else if (answers.vendor_review_process === "partly") {
    signals.push(
      buildSignalBase({
        signalId: "partial_vendor_review",
        severity: "medium",
        evidence: ["Vendor review process indicated as partial."],
        sourceAnswerIds: ["vendor_review_process"],
        confidence: "high",
      }),
    );
  }

  if (
    answers.human_review_required === "no" ||
    isNotSure(answers.human_review_required)
  ) {
    signals.push(
      buildSignalBase({
        signalId: "no_human_review_for_sensitive_decisions",
        severity: "high",
        evidence: [
          `Human review required: ${String(answers.human_review_required)}`,
        ],
        sourceAnswerIds: ["human_review_required"],
        confidence: isNotSure(answers.human_review_required)
          ? "medium"
          : "high",
      }),
    );
  }

  if (
    answers.ai_governance_owner === "no" ||
    isNotSure(answers.ai_governance_owner)
  ) {
    signals.push(
      buildSignalBase({
        signalId: "no_governance_owner",
        severity: "medium",
        evidence: [`Governance owner: ${String(answers.ai_governance_owner)}`],
        sourceAnswerIds: ["ai_governance_owner"],
        confidence: isNotSure(answers.ai_governance_owner) ? "medium" : "high",
      }),
    );
  } else if (answers.ai_governance_owner === "informal") {
    signals.push(
      buildSignalBase({
        signalId: "informal_governance_owner",
        severity: "low",
        evidence: ["Governance owner indicated as informal."],
        sourceAnswerIds: ["ai_governance_owner"],
        confidence: "high",
      }),
    );
  }

  // --- Vendor / tool risk derived from tool profile metadata ---
  if (hasLowConfidenceProfiles) {
    signals.push(
      buildSignalBase({
        signalId: "low_confidence_tool_profile",
        severity: "medium",
        evidence: [
          "One or more selected tool profiles have low or unknown confidence.",
        ],
        confidence: "medium",
        sourceAnswerIds: [],
      }),
    );
  } else if (hasMediumConfidenceProfiles) {
    signals.push(
      buildSignalBase({
        signalId: "medium_confidence_tool_profile",
        severity: "low",
        evidence: [
          "One or more selected tool profiles have medium confidence.",
        ],
        confidence: "high",
        sourceAnswerIds: [],
      }),
    );
  }

  if (hasUnknownTools) {
    signals.push(
      buildSignalBase({
        signalId: "unknown_vendor_review_needed",
        severity: "high",
        evidence: ["Unknown tools were included in selection."],
        confidence: "low",
        sourceAnswerIds: [],
      }),
    );
  }

  if (input.selectedTools.some((t) => t.supportsFileUploads === true)) {
    signals.push(
      buildSignalBase({
        signalId: "file_upload_tool_risk",
        severity: "medium",
        evidence: ["One or more selected tools support file uploads."],
        confidence: "high",
        sourceAnswerIds: [],
      }),
    );
  }

  if (
    input.selectedTools.some((t) => t.supportsMeetingTranscripts === true) ||
    categorySlugs.has("meeting_assistant")
  ) {
    signals.push(
      buildSignalBase({
        signalId: "meeting_assistant_transcript_risk",
        severity: "medium",
        evidence: ["Meeting assistant tools may be present in the selection."],
        confidence: "high",
        sourceAnswerIds: [],
      }),
    );
  }

  if (
    input.selectedTools.some((t) => t.agenticOrConnectedToolRelevance === true)
  ) {
    signals.push(
      buildSignalBase({
        signalId: "connected_tool_risk",
        severity: "high",
        evidence: [
          "Some selected tools are marked as agentic/connected relevance.",
        ],
        confidence: "medium",
        sourceAnswerIds: [],
      }),
    );
  }

  if (categorySlugs.has("automation_agent")) {
    signals.push(
      buildSignalBase({
        signalId: "automation_platform_risk",
        severity: "high",
        evidence: ["Automation/agent tools selected."],
        confidence: "high",
        sourceAnswerIds: [],
      }),
    );
  }

  // --- Agentic / coding (answers and tool-derived) ---
  if (
    categorySlugs.has("coding_assistant") ||
    input.selectedTools.some((t) => t.codingAssistantRelevance === true) ||
    answers.developers_use_ai_coding_assistants === "yes"
  ) {
    signals.push(
      buildSignalBase({
        signalId: "coding_assistant_used",
        severity: "medium",
        evidence: ["Coding assistant usage indicated."],
        sourceAnswerIds:
          "developers_use_ai_coding_assistants" in answers
            ? ["developers_use_ai_coding_assistants"]
            : [],
        confidence: "high",
      }),
    );
  }

  if (answers.ai_can_access_repositories_files === "yes") {
    signals.push(
      buildSignalBase({
        signalId: "repo_or_local_file_access",
        severity: "high",
        evidence: ["AI tools can access repositories/files indicated."],
        sourceAnswerIds: ["ai_can_access_repositories_files"],
        confidence: "high",
      }),
    );
  }

  if (answers.ai_can_run_commands_or_modify_files === "yes") {
    signals.push(
      buildSignalBase({
        signalId: "ai_can_modify_files_or_run_commands",
        severity: "critical",
        evidence: ["AI tools can run commands/modify files indicated."],
        sourceAnswerIds: ["ai_can_run_commands_or_modify_files"],
        confidence: "high",
      }),
    );
  }

  if (answers.mcp_or_connected_tools_used === "yes") {
    signals.push(
      buildSignalBase({
        signalId: "mcp_or_connected_tools_used",
        severity: "high",
        evidence: ["MCP or connected tools usage indicated."],
        sourceAnswerIds: ["mcp_or_connected_tools_used"],
        confidence: "high",
      }),
    );
  }

  if (answers.ai_connects_to_internal_systems === "yes") {
    signals.push(
      buildSignalBase({
        signalId: "internal_system_connection",
        severity: "high",
        evidence: ["Internal system connections indicated."],
        sourceAnswerIds: ["ai_connects_to_internal_systems"],
        confidence: "high",
      }),
    );
  }

  if (
    answers.ai_generated_code_reviewed === "no" ||
    answers.ai_generated_code_reviewed === "sometimes" ||
    isNotSure(answers.ai_generated_code_reviewed)
  ) {
    signals.push(
      buildSignalBase({
        signalId: "code_review_not_always_required",
        severity:
          answers.ai_generated_code_reviewed === "no" ? "high" : "medium",
        evidence: [
          `AI-generated code reviewed: ${String(answers.ai_generated_code_reviewed)}`,
        ],
        sourceAnswerIds: ["ai_generated_code_reviewed"],
        confidence: isNotSure(answers.ai_generated_code_reviewed)
          ? "medium"
          : "high",
      }),
    );
  }

  if (answers.secrets_or_production_data_exposure_possible === "yes") {
    signals.push(
      buildSignalBase({
        signalId: "secrets_or_production_data_possible",
        severity: "critical",
        evidence: ["Secrets/production data exposure possible indicated."],
        sourceAnswerIds: ["secrets_or_production_data_exposure_possible"],
        confidence: "high",
      }),
    );
  }

  // --- Decision impact ---
  if (
    answers.ai_outputs_influence_decisions === "yes" ||
    answers.ai_outputs_influence_decisions === "sometimes" ||
    isNotSure(answers.ai_outputs_influence_decisions)
  ) {
    signals.push(
      buildSignalBase({
        signalId: "ai_outputs_influence_people_decisions",
        severity:
          answers.ai_outputs_influence_decisions === "yes" ? "high" : "medium",
        evidence: [
          `Decision influence: ${String(answers.ai_outputs_influence_decisions)}`,
        ],
        sourceAnswerIds: ["ai_outputs_influence_decisions"],
        confidence: isNotSure(answers.ai_outputs_influence_decisions)
          ? "medium"
          : "high",
      }),
    );
  }

  if (
    (answers.ai_outputs_influence_decisions === "yes" ||
      answers.ai_outputs_influence_decisions === "sometimes") &&
    (answers.human_review_required === "no" ||
      answers.human_review_required === "partly" ||
      isNotSure(answers.human_review_required))
  ) {
    signals.push(
      buildSignalBase({
        signalId: "ai_decision_support_without_human_review",
        severity: "high",
        evidence: [
          "AI influences decisions and human review was not consistently indicated.",
        ],
        sourceAnswerIds: [
          "ai_outputs_influence_decisions",
          "human_review_required",
        ].filter((id) => id in answers),
        confidence: "high",
      }),
    );
  }

  const industry = input.companyProfile.industry;
  const regulatedIndustry = [
    "insurance",
    "fintech",
    "banking",
    "healthcare",
    "legal",
  ].some((k) => industry.includes(k));
  if (
    regulatedIndustry &&
    (answers.ai_outputs_influence_decisions === "yes" ||
      answers.ai_outputs_influence_decisions === "sometimes")
  ) {
    signals.push(
      buildSignalBase({
        signalId: "regulated_decision_context_possible",
        severity: "high",
        evidence: [`Industry: ${industry}`],
        sourceAnswerIds: ["ai_outputs_influence_decisions"].filter(
          (id) => id in answers,
        ),
        confidence: "medium",
      }),
    );
  }

  return dedupeSignalsById(signals);
}
