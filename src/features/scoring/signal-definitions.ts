import type { RiskSignal, SignalSeverity, ScoringCategoryId } from "./types";

export type RiskSignalDefinition = {
  signalId: string;
  categoryId: ScoringCategoryId;
  defaultSeverity: SignalSeverity;
  defaultScoreImpact: number;
  title: string;
  description: string;
};

export const RISK_SIGNAL_DEFINITIONS: Record<string, RiskSignalDefinition> = {
  // Visibility / Inventory
  shadow_ai_visibility_gap: {
    signalId: "shadow_ai_visibility_gap",
    categoryId: "visibility_and_inventory",
    defaultSeverity: "medium",
    defaultScoreImpact: 14,
    title: "Limited visibility into AI tool usage",
    description:
      "Answers suggest the organization may not have a clear inventory or evidence of AI tool usage across teams.",
  },
  personal_account_usage: {
    signalId: "personal_account_usage",
    categoryId: "visibility_and_inventory",
    defaultSeverity: "medium",
    defaultScoreImpact: 10,
    title: "Personal AI accounts may be used for work",
    description:
      "Using personal accounts can reduce enterprise controls, retention governance, and auditability.",
  },
  unknown_tool_usage: {
    signalId: "unknown_tool_usage",
    categoryId: "visibility_and_inventory",
    defaultSeverity: "medium",
    defaultScoreImpact: 12,
    title: "Unknown AI tools may be in use",
    description:
      "Unknown or unlisted tools can indicate shadow AI and create vendor review gaps.",
  },
  limited_usage_logs: {
    signalId: "limited_usage_logs",
    categoryId: "visibility_and_inventory",
    defaultSeverity: "high",
    defaultScoreImpact: 14,
    title: "AI usage logs may be limited",
    description:
      "Limited audit logs can reduce the ability to review, investigate, or evidence AI governance.",
  },
  no_exposure_investigation_capability: {
    signalId: "no_exposure_investigation_capability",
    categoryId: "visibility_and_inventory",
    defaultSeverity: "high",
    defaultScoreImpact: 16,
    title: "Exposure investigation capability may be limited",
    description:
      "If sensitive exposure cannot be investigated, incident response and accountability may be weaker.",
  },
  no_role_tool_data_controls: {
    signalId: "no_role_tool_data_controls",
    categoryId: "visibility_and_inventory",
    defaultSeverity: "medium",
    defaultScoreImpact: 10,
    title: "Controls may not vary by role, tool, or data type",
    description:
      "Limited ability to apply differentiated controls can increase risk when sensitive workflows exist.",
  },

  // Data Exposure
  sensitive_data_entering_ai: {
    signalId: "sensitive_data_entering_ai",
    categoryId: "data_exposure",
    defaultSeverity: "high",
    defaultScoreImpact: 20,
    title: "Sensitive data may enter AI tools",
    description:
      "Answers suggest sensitive or confidential data may enter prompts, uploads, transcripts, or AI workspaces.",
  },
  customer_personal_data_exposure: {
    signalId: "customer_personal_data_exposure",
    categoryId: "data_exposure",
    defaultSeverity: "high",
    defaultScoreImpact: 18,
    title: "Customer personal data exposure may be possible",
    description:
      "Customer personal data in AI tools can increase disclosure and retention risk and should be validated internally.",
  },
  employee_data_exposure: {
    signalId: "employee_data_exposure",
    categoryId: "data_exposure",
    defaultSeverity: "medium",
    defaultScoreImpact: 12,
    title: "Employee data exposure may be possible",
    description:
      "Employee data in AI tools can increase privacy and internal disclosure risk.",
  },
  financial_records_exposure: {
    signalId: "financial_records_exposure",
    categoryId: "data_exposure",
    defaultSeverity: "high",
    defaultScoreImpact: 16,
    title: "Financial records exposure may be possible",
    description:
      "Financial data can be sensitive and may require stronger governance and vendor review before use with AI tools.",
  },
  legal_contracts_exposure: {
    signalId: "legal_contracts_exposure",
    categoryId: "data_exposure",
    defaultSeverity: "high",
    defaultScoreImpact: 16,
    title: "Legal or contract data exposure may be possible",
    description:
      "Legal and contract content can be confidential and may require additional review before entering AI tools.",
  },
  claims_documents_exposure: {
    signalId: "claims_documents_exposure",
    categoryId: "data_exposure",
    defaultSeverity: "high",
    defaultScoreImpact: 18,
    title: "Claims document exposure may be possible",
    description:
      "Claims documents may contain personal or regulated information and increase data exposure risk.",
  },
  kyc_identity_data_exposure: {
    signalId: "kyc_identity_data_exposure",
    categoryId: "data_exposure",
    defaultSeverity: "critical",
    defaultScoreImpact: 22,
    title: "KYC or identity data exposure may be possible",
    description:
      "Identity data can be highly sensitive and suggests a need for strong controls and internal validation.",
  },
  health_data_exposure: {
    signalId: "health_data_exposure",
    categoryId: "data_exposure",
    defaultSeverity: "critical",
    defaultScoreImpact: 24,
    title: "Health or medical data exposure may be possible",
    description:
      "Health data is highly sensitive and typically requires strict handling and governance.",
  },
  source_code_exposure: {
    signalId: "source_code_exposure",
    categoryId: "agentic_and_coding_risk",
    defaultSeverity: "high",
    defaultScoreImpact: 18,
    title: "Source code exposure may be possible",
    description:
      "Source code in AI tools can increase IP and supply-chain risk depending on controls and vendor terms.",
  },
  logs_exposure: {
    signalId: "logs_exposure",
    categoryId: "agentic_and_coding_risk",
    defaultSeverity: "high",
    defaultScoreImpact: 16,
    title: "Logs exposure may be possible",
    description:
      "Logs can contain sensitive operational and security information, including identifiers and tokens.",
  },
  secrets_tokens_exposure: {
    signalId: "secrets_tokens_exposure",
    categoryId: "agentic_and_coding_risk",
    defaultSeverity: "critical",
    defaultScoreImpact: 26,
    title: "Secrets or tokens exposure may be possible",
    description:
      "Credentials, API keys, or tokens entering AI tools can create high-impact security risk.",
  },
  meeting_transcript_exposure: {
    signalId: "meeting_transcript_exposure",
    categoryId: "data_exposure",
    defaultSeverity: "medium",
    defaultScoreImpact: 10,
    title: "Meeting transcript exposure may be possible",
    description:
      "Transcripts can capture confidential discussions and may require additional handling rules.",
  },
  file_upload_exposure: {
    signalId: "file_upload_exposure",
    categoryId: "data_exposure",
    defaultSeverity: "medium",
    defaultScoreImpact: 10,
    title: "File upload exposure may be possible",
    description:
      "File uploads can increase exposure scope by moving larger documents into AI tools or workspaces.",
  },

  // Governance
  no_ai_policy: {
    signalId: "no_ai_policy",
    categoryId: "governance_controls",
    defaultSeverity: "high",
    defaultScoreImpact: 14,
    title: "No AI usage policy indicated",
    description:
      "Without an approved AI policy, teams may use AI inconsistently and expose data unknowingly.",
  },
  draft_ai_policy_only: {
    signalId: "draft_ai_policy_only",
    categoryId: "governance_controls",
    defaultSeverity: "medium",
    defaultScoreImpact: 10,
    title: "AI policy may be draft-only",
    description:
      "A draft policy may help, but often indicates governance is still in progress and should be validated internally.",
  },
  employees_unclear_on_approved_tools: {
    signalId: "employees_unclear_on_approved_tools",
    categoryId: "governance_controls",
    defaultSeverity: "medium",
    defaultScoreImpact: 10,
    title: "Approved tool awareness may be unclear",
    description:
      "If employees are unclear on approved tools, shadow AI usage may be more likely.",
  },
  no_sensitive_data_rules: {
    signalId: "no_sensitive_data_rules",
    categoryId: "governance_controls",
    defaultSeverity: "high",
    defaultScoreImpact: 14,
    title: "No rules for sensitive data in AI indicated",
    description:
      "Without clear data rules, sensitive content may enter AI tools without consistent guardrails.",
  },
  partial_sensitive_data_rules: {
    signalId: "partial_sensitive_data_rules",
    categoryId: "governance_controls",
    defaultSeverity: "medium",
    defaultScoreImpact: 10,
    title: "Sensitive data rules may be partial",
    description:
      "Partial rules suggest gaps or inconsistent enforcement and may require review for completeness.",
  },
  no_vendor_review: {
    signalId: "no_vendor_review",
    categoryId: "vendor_and_tool_risk",
    defaultSeverity: "high",
    defaultScoreImpact: 12,
    title: "No vendor review process indicated",
    description:
      "Without vendor review, data retention, training-use, and subprocessor risks may be unknown.",
  },
  partial_vendor_review: {
    signalId: "partial_vendor_review",
    categoryId: "vendor_and_tool_risk",
    defaultSeverity: "medium",
    defaultScoreImpact: 8,
    title: "Vendor review may be partial",
    description:
      "Partial vendor review suggests some due diligence exists, but gaps may remain.",
  },
  no_human_review_for_sensitive_decisions: {
    signalId: "no_human_review_for_sensitive_decisions",
    categoryId: "decision_impact_risk",
    defaultSeverity: "high",
    defaultScoreImpact: 14,
    title: "Human review for sensitive decisions may be limited",
    description:
      "When AI outputs influence decisions about people, human review can reduce risk of insecure output handling.",
  },
  no_governance_owner: {
    signalId: "no_governance_owner",
    categoryId: "governance_controls",
    defaultSeverity: "medium",
    defaultScoreImpact: 10,
    title: "No clear AI governance owner indicated",
    description:
      "Without accountability, policy, approvals, and incident processes can be harder to sustain.",
  },
  informal_governance_owner: {
    signalId: "informal_governance_owner",
    categoryId: "governance_controls",
    defaultSeverity: "low",
    defaultScoreImpact: 6,
    title: "AI governance ownership may be informal",
    description:
      "Informal ownership can help, but may be insufficient for sensitive or high-impact AI use cases.",
  },

  // Vendor / Tool risk
  low_confidence_tool_profile: {
    signalId: "low_confidence_tool_profile",
    categoryId: "vendor_and_tool_risk",
    defaultSeverity: "medium",
    defaultScoreImpact: 10,
    title: "Some tool profiles have low confidence",
    description:
      "Limited reviewed public information can reduce confidence in vendor controls and claims.",
  },
  medium_confidence_tool_profile: {
    signalId: "medium_confidence_tool_profile",
    categoryId: "vendor_and_tool_risk",
    defaultSeverity: "low",
    defaultScoreImpact: 6,
    title: "Some tool profiles have medium confidence",
    description:
      "Partial public documentation suggests some uncertainty that may require internal validation.",
  },
  file_upload_tool_risk: {
    signalId: "file_upload_tool_risk",
    categoryId: "vendor_and_tool_risk",
    defaultSeverity: "medium",
    defaultScoreImpact: 8,
    title: "Selected tools may support file uploads",
    description:
      "File upload capabilities can increase exposure scope depending on governance and controls.",
  },
  meeting_assistant_transcript_risk: {
    signalId: "meeting_assistant_transcript_risk",
    categoryId: "vendor_and_tool_risk",
    defaultSeverity: "medium",
    defaultScoreImpact: 8,
    title: "Meeting assistant transcript risk may be present",
    description:
      "Meeting assistants can process transcripts and recordings that may include confidential content.",
  },
  connected_tool_risk: {
    signalId: "connected_tool_risk",
    categoryId: "vendor_and_tool_risk",
    defaultSeverity: "high",
    defaultScoreImpact: 12,
    title: "Connected tool risk may be present",
    description:
      "Tools connected to other systems can expand the blast radius beyond chat or prompts.",
  },
  automation_platform_risk: {
    signalId: "automation_platform_risk",
    categoryId: "vendor_and_tool_risk",
    defaultSeverity: "high",
    defaultScoreImpact: 12,
    title: "Automation/agent platform risk may be present",
    description:
      "Automation tools may execute actions across systems, increasing risk if permissions are broad.",
  },
  unknown_vendor_review_needed: {
    signalId: "unknown_vendor_review_needed",
    categoryId: "vendor_and_tool_risk",
    defaultSeverity: "high",
    defaultScoreImpact: 14,
    title: "Unknown tools may require vendor review",
    description:
      "Unlisted tools reduce ability to assess vendor controls from curated profiles.",
  },

  // Agentic / Coding
  coding_assistant_used: {
    signalId: "coding_assistant_used",
    categoryId: "agentic_and_coding_risk",
    defaultSeverity: "medium",
    defaultScoreImpact: 10,
    title: "Coding assistants may be used",
    description:
      "Coding assistants can increase supply chain and IP risk depending on data exposure and review gates.",
  },
  repo_or_local_file_access: {
    signalId: "repo_or_local_file_access",
    categoryId: "agentic_and_coding_risk",
    defaultSeverity: "high",
    defaultScoreImpact: 14,
    title: "AI tools may access repositories or local files",
    description:
      "Access to repos or local files increases the potential blast radius of data exposure.",
  },
  ai_can_modify_files_or_run_commands: {
    signalId: "ai_can_modify_files_or_run_commands",
    categoryId: "agentic_and_coding_risk",
    defaultSeverity: "critical",
    defaultScoreImpact: 18,
    title: "AI tools may modify files or run commands",
    description:
      "Command execution and file modification can increase risk of unintended changes or misuse if controls are weak.",
  },
  mcp_or_connected_tools_used: {
    signalId: "mcp_or_connected_tools_used",
    categoryId: "agentic_and_coding_risk",
    defaultSeverity: "high",
    defaultScoreImpact: 14,
    title: "MCP or connected tools may be used",
    description:
      "Connected tooling can increase agency and requires careful permissions and auditability.",
  },
  internal_system_connection: {
    signalId: "internal_system_connection",
    categoryId: "agentic_and_coding_risk",
    defaultSeverity: "high",
    defaultScoreImpact: 14,
    title: "AI tools may connect to internal systems",
    description:
      "Connections to internal systems can expand exposure and require least-privilege integration controls.",
  },
  code_review_not_always_required: {
    signalId: "code_review_not_always_required",
    categoryId: "agentic_and_coding_risk",
    defaultSeverity: "high",
    defaultScoreImpact: 12,
    title: "Code review gates may be inconsistent",
    description:
      "Inconsistent review of AI-generated code can increase supply chain and quality risk.",
  },
  secrets_or_production_data_possible: {
    signalId: "secrets_or_production_data_possible",
    categoryId: "agentic_and_coding_risk",
    defaultSeverity: "critical",
    defaultScoreImpact: 20,
    title: "Secrets or production data exposure may be possible",
    description:
      "Exposure of secrets or production data can create high-impact security risk.",
  },

  // Decision impact
  ai_outputs_influence_people_decisions: {
    signalId: "ai_outputs_influence_people_decisions",
    categoryId: "decision_impact_risk",
    defaultSeverity: "medium",
    defaultScoreImpact: 10,
    title: "AI outputs may influence people-impacting decisions",
    description:
      "When AI influences decisions about people or access to services, stronger governance and review may be needed.",
  },
  ai_decision_support_without_human_review: {
    signalId: "ai_decision_support_without_human_review",
    categoryId: "decision_impact_risk",
    defaultSeverity: "high",
    defaultScoreImpact: 14,
    title: "Decision support may lack consistent human review",
    description:
      "Limited human review can increase risk of insecure output handling and inappropriate reliance.",
  },
  regulated_decision_context_possible: {
    signalId: "regulated_decision_context_possible",
    categoryId: "decision_impact_risk",
    defaultSeverity: "high",
    defaultScoreImpact: 12,
    title: "Regulated decision context may be possible",
    description:
      "Industry and decision-impact answers suggest the use case may require stronger internal review and governance.",
  },
};

export function getSignalDefinition(signalId: string): RiskSignalDefinition {
  const def = RISK_SIGNAL_DEFINITIONS[signalId];
  if (!def) {
    throw new Error(`Unknown signal definition: ${signalId}`);
  }
  return def;
}

export function buildSignalBase(input: {
  signalId: string;
  severity?: SignalSeverity;
  scoreImpact?: number;
  evidence?: string[];
  sourceAnswerIds?: string[];
  confidence?: RiskSignal["confidence"];
}): RiskSignal {
  const def = getSignalDefinition(input.signalId);
  return {
    signalId: def.signalId,
    categoryId: def.categoryId,
    severity: input.severity ?? def.defaultSeverity,
    title: def.title,
    description: def.description,
    evidence: input.evidence ?? [],
    scoreImpact: input.scoreImpact ?? def.defaultScoreImpact,
    confidence: input.confidence ?? "medium",
    sourceAnswerIds: input.sourceAnswerIds ?? [],
  };
}
