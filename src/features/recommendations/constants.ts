import type { ScoringCategoryId } from "@/features/scoring/types";

import type {
  FindingCategoryId,
  RecommendationCategoryId,
  RecommendationEffort,
  RecommendationPriority,
} from "./types";

export const RECOMMENDATION_MODEL_VERSION = "v1.0-framework-informed" as const;

export const MAX_RECOMMENDATIONS = 8 as const;

export const FINDING_CATEGORY_LABELS: Record<FindingCategoryId, string> = {
  visibility_and_inventory: "Visibility and inventory",
  data_exposure: "Data exposure",
  governance_controls: "Governance controls",
  vendor_and_tool_risk: "Vendor and tool risk",
  agentic_and_coding_risk: "Agentic and coding risk",
  decision_impact_risk: "Decision impact risk",
};

export const RECOMMENDATION_CATEGORY_LABELS: Record<
  RecommendationCategoryId,
  string
> = {
  policy_and_governance: "Policy and governance",
  tool_inventory_and_approval: "Tool inventory and approval",
  data_protection: "Data protection",
  logging_and_auditability: "Logging and auditability",
  vendor_risk_review: "Vendor risk review",
  human_review_and_decision_controls: "Human review and decision controls",
  developer_ai_controls: "Developer AI controls",
  agentic_ai_controls: "Agentic AI controls",
  training_and_awareness: "Training and awareness",
};

export const PRIORITY_ORDER: Record<RecommendationPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const EFFORT_ORDER: Record<RecommendationEffort, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export const BANNED_TERMS = [
  "certified",
  "compliant",
  "non-compliant",
  "audit passed",
  "audit failed",
  "guaranteed",
  "breach confirmed",
  "violation confirmed",
  "safe to use",
  "unsafe to use",
] as const;

export const CRITICAL_DATA_SIGNAL_IDS = [
  "secrets_tokens_exposure",
  "health_data_exposure",
  "kyc_identity_data_exposure",
  "secrets_or_production_data_possible",
] as const;

export const HIGH_DATA_SIGNAL_IDS = [
  "sensitive_data_entering_ai",
  "customer_personal_data_exposure",
  "employee_data_exposure",
  "financial_records_exposure",
  "legal_contracts_exposure",
  "claims_documents_exposure",
] as const;

export const VISIBILITY_SIGNAL_IDS = [
  "shadow_ai_visibility_gap",
  "personal_account_usage",
  "unknown_tool_usage",
  "limited_usage_logs",
  "no_exposure_investigation_capability",
  "no_role_tool_data_controls",
] as const;

export const GOVERNANCE_SIGNAL_IDS = [
  "no_ai_policy",
  "draft_ai_policy_only",
  "employees_unclear_on_approved_tools",
  "no_sensitive_data_rules",
  "partial_sensitive_data_rules",
  "no_governance_owner",
  "informal_governance_owner",
] as const;

export const VENDOR_SIGNAL_IDS = [
  "low_confidence_tool_profile",
  "medium_confidence_tool_profile",
  "file_upload_tool_risk",
  "meeting_assistant_transcript_risk",
  "connected_tool_risk",
  "automation_platform_risk",
  "unknown_vendor_review_needed",
  "no_vendor_review",
  "partial_vendor_review",
] as const;

export const AGENTIC_CODING_SIGNAL_IDS = [
  "coding_assistant_used",
  "repo_or_local_file_access",
  "ai_can_modify_files_or_run_commands",
  "mcp_or_connected_tools_used",
  "internal_system_connection",
  "code_review_not_always_required",
  "secrets_or_production_data_possible",
  "source_code_exposure",
  "logs_exposure",
  "secrets_tokens_exposure",
] as const;

export const DECISION_IMPACT_SIGNAL_IDS = [
  "ai_outputs_influence_people_decisions",
  "ai_decision_support_without_human_review",
  "regulated_decision_context_possible",
  "no_human_review_for_sensitive_decisions",
] as const;

export const CATEGORY_WEIGHT_FOR_SORT: Record<ScoringCategoryId, number> = {
  data_exposure: 6,
  agentic_and_coding_risk: 5,
  visibility_and_inventory: 4,
  governance_controls: 4,
  vendor_and_tool_risk: 3,
  decision_impact_risk: 3,
};
