import type { RecommendationTemplate } from "./types";

const LOW_CONFIDENCE_CAVEAT =
  "This recommendation is based on limited visibility from the provided answers and should be validated internally.";

export const RECOMMENDATION_LIBRARY: Record<string, RecommendationTemplate> = {
  establish_ai_tool_inventory: {
    recommendationId: "establish_ai_tool_inventory",
    title: "Establish an AI tool inventory",
    summary:
      "Create a practical inventory of AI tools in use across teams to improve visibility and governance.",
    categoryId: "tool_inventory_and_approval",
    defaultEffort: "medium",
    defaultPriority: "medium",
    triggerSignalIds: [
      "shadow_ai_visibility_gap",
      "unknown_tool_usage",
      "unknown_vendor_review_needed",
    ],
    triggerCategoryIds: ["visibility_and_inventory"],
    minCategoryRiskLevel: "moderate",
    implementationSteps: [
      "Survey teams for AI tools used in daily work",
      "Record tool name, account type, and primary use case",
      "Identify tools not on an approved list",
      "Review inventory quarterly or after major tool changes",
    ],
    whyThisMatters:
      "Without an inventory, shadow AI and unmanaged tools are harder to detect and govern.",
    vykenGuardRelevance: "high",
    defaultCaveats: [
      "An inventory is a starting point; enforcement and review processes may still be needed.",
    ],
    relatedRiskCategories: ["visibility_and_inventory"],
    priorityBoostSignalIds: ["shadow_ai_visibility_gap", "unknown_tool_usage"],
    urgentSignalIds: [],
  },

  define_approved_ai_tool_list: {
    recommendationId: "define_approved_ai_tool_list",
    title: "Define an approved AI tool list",
    summary:
      "Publish a maintained list of approved AI tools and account types for work use.",
    categoryId: "tool_inventory_and_approval",
    defaultEffort: "medium",
    defaultPriority: "medium",
    triggerSignalIds: [
      "employees_unclear_on_approved_tools",
      "shadow_ai_visibility_gap",
      "unknown_tool_usage",
    ],
    implementationSteps: [
      "Define approval criteria for new AI tools",
      "Publish the approved list in an accessible internal location",
      "Clarify whether personal accounts are permitted for work",
      "Review the list when teams adopt new tools",
    ],
    whyThisMatters:
      "Clear approved-tool guidance can reduce inconsistent use and shadow AI adoption.",
    vykenGuardRelevance: "medium",
    defaultCaveats: [
      "Approval lists should be paired with communication and practical enforcement where possible.",
    ],
    relatedRiskCategories: ["visibility_and_inventory", "governance_controls"],
  },

  review_unknown_or_unmanaged_tools: {
    recommendationId: "review_unknown_or_unmanaged_tools",
    title: "Review unknown or unmanaged AI tools",
    summary:
      "Prioritize review of unlisted or unknown tools that may lack enterprise controls.",
    categoryId: "tool_inventory_and_approval",
    defaultEffort: "medium",
    defaultPriority: "high",
    triggerSignalIds: ["unknown_tool_usage", "unknown_vendor_review_needed"],
    implementationSteps: [
      "Identify unknown tools reported in the assessment",
      "Document intended use case and data types involved",
      "Perform a basic vendor and data-handling review",
      "Decide whether to approve, restrict, or replace the tool",
    ],
    whyThisMatters:
      "Unknown tools can indicate shadow AI and reduce confidence in vendor controls.",
    vykenGuardRelevance: "high",
    defaultCaveats: [
      "Vendor information may be limited until an internal review is completed.",
    ],
    relatedRiskCategories: ["visibility_and_inventory", "vendor_and_tool_risk"],
    urgentSignalIds: ["unknown_vendor_review_needed"],
  },

  monitor_shadow_ai_usage_patterns: {
    recommendationId: "monitor_shadow_ai_usage_patterns",
    title: "Monitor shadow AI usage patterns",
    summary:
      "Look for signs of unmanaged AI usage that may bypass approved tools and logging.",
    categoryId: "tool_inventory_and_approval",
    defaultEffort: "medium",
    defaultPriority: "high",
    triggerSignalIds: [
      "shadow_ai_visibility_gap",
      "personal_account_usage",
      "limited_usage_logs",
    ],
    implementationSteps: [
      "Review personal-account usage patterns where enterprise seats exist",
      "Enable logging where available for approved tools",
      "Define indicators of shadow AI for security and IT review",
      "Establish a periodic review cadence for new AI tool adoption",
    ],
    whyThisMatters:
      "Shadow AI can increase data exposure when tools lack enterprise governance.",
    vykenGuardRelevance: "high",
    defaultCaveats: [
      "Monitoring capabilities vary by tool and deployment; validate what is feasible internally.",
    ],
    relatedRiskCategories: ["visibility_and_inventory"],
  },

  define_sensitive_data_ai_rules: {
    recommendationId: "define_sensitive_data_ai_rules",
    title: "Define sensitive-data rules for AI use",
    summary:
      "Clarify which data types may or may not enter AI tools through prompts, uploads, or transcripts.",
    categoryId: "data_protection",
    defaultEffort: "medium",
    defaultPriority: "high",
    triggerSignalIds: [
      "sensitive_data_entering_ai",
      "no_sensitive_data_rules",
      "partial_sensitive_data_rules",
      "customer_personal_data_exposure",
      "employee_data_exposure",
      "financial_records_exposure",
      "legal_contracts_exposure",
      "claims_documents_exposure",
      "health_data_exposure",
      "kyc_identity_data_exposure",
      "secrets_tokens_exposure",
    ],
    triggerCategoryIds: ["data_exposure"],
    minCategoryRiskLevel: "high",
    implementationSteps: [
      "Classify data types allowed in AI tools",
      "Block or restrict secrets, regulated, and highly sensitive data",
      "Publish short examples of acceptable and unacceptable prompts",
      "Train teams on data-handling expectations for AI workflows",
    ],
    whyThisMatters:
      "Clear data rules can help reduce unintended disclosure in AI tools.",
    vykenGuardRelevance: "high",
    defaultCaveats: [
      "Rules should be validated against internal legal and security guidance.",
    ],
    relatedRiskCategories: ["data_exposure", "governance_controls"],
    urgentSignalIds: [
      "secrets_tokens_exposure",
      "health_data_exposure",
      "kyc_identity_data_exposure",
    ],
  },

  restrict_sensitive_data_in_personal_ai_accounts: {
    recommendationId: "restrict_sensitive_data_in_personal_ai_accounts",
    title: "Restrict sensitive data in personal AI accounts",
    summary:
      "Limit sensitive work on personal AI accounts where enterprise controls may be weaker.",
    categoryId: "data_protection",
    defaultEffort: "low",
    defaultPriority: "high",
    triggerSignalIds: ["personal_account_usage", "sensitive_data_entering_ai"],
    implementationSteps: [
      "Communicate that sensitive work should use company-managed accounts",
      "Provide enterprise seats where feasible for approved tools",
      "Update acceptable-use guidance for personal accounts",
      "Review high-risk workflows that may still use personal accounts",
    ],
    whyThisMatters:
      "Personal accounts can reduce retention, deletion, and auditability controls.",
    vykenGuardRelevance: "medium",
    defaultCaveats: [
      "Enforcement may require a combination of policy and technical controls.",
    ],
    relatedRiskCategories: ["data_exposure", "visibility_and_inventory"],
  },

  review_file_upload_and_transcript_controls: {
    recommendationId: "review_file_upload_and_transcript_controls",
    title: "Review file upload and transcript controls",
    summary:
      "Assess how file uploads and meeting transcripts are handled in AI tools.",
    categoryId: "data_protection",
    defaultEffort: "medium",
    defaultPriority: "medium",
    triggerSignalIds: [
      "file_upload_exposure",
      "meeting_transcript_exposure",
      "file_upload_tool_risk",
      "meeting_assistant_transcript_risk",
    ],
    implementationSteps: [
      "Inventory tools that accept uploads or process transcripts",
      "Define which document types may be uploaded",
      "Review retention and sharing settings where available",
      "Add guidance for confidential meetings and recordings",
    ],
    whyThisMatters:
      "Uploads and transcripts can move larger confidential content into AI systems.",
    vykenGuardRelevance: "medium",
    defaultCaveats: [
      "Tool capabilities vary; validate settings for each approved product.",
    ],
    relatedRiskCategories: ["data_exposure", "vendor_and_tool_risk"],
  },

  create_prompt_and_upload_data_handling_guidance: {
    recommendationId: "create_prompt_and_upload_data_handling_guidance",
    title: "Create prompt and upload handling guidance",
    summary:
      "Publish practical guidance on what employees should avoid entering into AI tools.",
    categoryId: "training_and_awareness",
    defaultEffort: "low",
    defaultPriority: "medium",
    triggerSignalIds: [
      "sensitive_data_entering_ai",
      "file_upload_exposure",
      "meeting_transcript_exposure",
    ],
    implementationSteps: [
      "Draft short do/do-not examples for prompts and uploads",
      "Highlight secrets, customer data, and regulated content",
      "Share guidance during onboarding and team meetings",
      "Review guidance when new AI tools are approved",
    ],
    whyThisMatters:
      "Practical examples can reduce accidental data exposure in everyday AI use.",
    vykenGuardRelevance: "low",
    defaultCaveats: [
      "Guidance should be paired with technical controls for high-risk data types.",
    ],
    relatedRiskCategories: ["data_exposure"],
  },

  create_or_finalize_ai_usage_policy: {
    recommendationId: "create_or_finalize_ai_usage_policy",
    title: "Create or finalize an AI usage policy",
    summary:
      "Establish or complete an approved AI usage policy with clear rules for teams.",
    categoryId: "policy_and_governance",
    defaultEffort: "medium",
    defaultPriority: "medium",
    triggerSignalIds: [
      "no_ai_policy",
      "draft_ai_policy_only",
      "employees_unclear_on_approved_tools",
    ],
    triggerCategoryIds: ["governance_controls"],
    minCategoryRiskLevel: "moderate",
    implementationSteps: [
      "Assign an AI governance owner",
      "Draft acceptable-use rules for approved tools and data types",
      "Define escalation paths for new tool requests",
      "Communicate the policy to employees",
    ],
    whyThisMatters:
      "A clear policy can reduce inconsistent AI use and improve accountability.",
    vykenGuardRelevance: "none",
    defaultCaveats: [
      "Policy alone may not reduce risk without communication and enforcement.",
    ],
    relatedRiskCategories: ["governance_controls"],
    priorityBoostSignalIds: [
      "sensitive_data_entering_ai",
      "no_sensitive_data_rules",
    ],
  },

  assign_ai_governance_owner: {
    recommendationId: "assign_ai_governance_owner",
    title: "Assign an AI governance owner",
    summary:
      "Designate accountability for AI policy, approvals, and incident follow-up.",
    categoryId: "policy_and_governance",
    defaultEffort: "low",
    defaultPriority: "medium",
    triggerSignalIds: ["no_governance_owner", "informal_governance_owner"],
    implementationSteps: [
      "Name a primary owner for AI governance activities",
      "Define responsibilities for policy, approvals, and review",
      "Establish a lightweight review cadence",
      "Document how teams request new AI tools or exceptions",
    ],
    whyThisMatters:
      "Clear ownership helps sustain governance as AI adoption grows.",
    vykenGuardRelevance: "none",
    defaultCaveats: [
      "Ownership can be shared across security, IT, and business leads as needed.",
    ],
    relatedRiskCategories: ["governance_controls"],
  },

  establish_ai_vendor_review_process: {
    recommendationId: "establish_ai_vendor_review_process",
    title: "Establish an AI vendor review process",
    summary:
      "Review AI vendor privacy, security, and data-handling practices before sensitive use.",
    categoryId: "vendor_risk_review",
    defaultEffort: "medium",
    defaultPriority: "medium",
    triggerSignalIds: [
      "no_vendor_review",
      "partial_vendor_review",
      "unknown_vendor_review_needed",
      "low_confidence_tool_profile",
    ],
    implementationSteps: [
      "Create a vendor review checklist for AI tools",
      "Review training use, retention, and subprocessors",
      "Require enterprise agreements for sensitive workflows",
      "Re-review vendors when use cases or data types change",
    ],
    whyThisMatters:
      "Vendor review can surface data retention and control gaps before adoption expands.",
    vykenGuardRelevance: "low",
    defaultCaveats: [
      "Public documentation may be incomplete; validate claims internally.",
    ],
    relatedRiskCategories: ["vendor_and_tool_risk"],
  },

  communicate_approved_ai_use_rules: {
    recommendationId: "communicate_approved_ai_use_rules",
    title: "Communicate approved AI use rules",
    summary:
      "Ensure employees understand which AI tools and data types are permitted for work.",
    categoryId: "training_and_awareness",
    defaultEffort: "low",
    defaultPriority: "medium",
    triggerSignalIds: [
      "employees_unclear_on_approved_tools",
      "draft_ai_policy_only",
    ],
    implementationSteps: [
      "Share approved tools and account types with all teams",
      "Provide examples of acceptable AI-assisted tasks",
      "Clarify where to ask questions about new tools",
      "Repeat communication after policy updates",
    ],
    whyThisMatters:
      "Employees may expose data unknowingly when rules are unclear.",
    vykenGuardRelevance: "none",
    defaultCaveats: [],
    relatedRiskCategories: ["governance_controls", "visibility_and_inventory"],
  },

  enable_ai_usage_logging_where_available: {
    recommendationId: "enable_ai_usage_logging_where_available",
    title: "Enable AI usage logging where available",
    summary:
      "Turn on enterprise logging or audit features for approved AI tools when supported.",
    categoryId: "logging_and_auditability",
    defaultEffort: "medium",
    defaultPriority: "high",
    triggerSignalIds: [
      "limited_usage_logs",
      "no_exposure_investigation_capability",
    ],
    implementationSteps: [
      "Identify which approved tools support audit or activity logs",
      "Enable logging in enterprise admin consoles",
      "Define who can access logs and for what purpose",
      "Set a retention period aligned with internal policy",
    ],
    whyThisMatters:
      "Usage logs can support investigation and accountability after incidents.",
    vykenGuardRelevance: "high",
    defaultCaveats: [
      "Logging coverage depends on vendor capabilities and deployment model.",
    ],
    relatedRiskCategories: ["visibility_and_inventory"],
  },

  define_ai_audit_review_process: {
    recommendationId: "define_ai_audit_review_process",
    title: "Define an AI audit review process",
    summary:
      "Establish a lightweight process to review AI usage evidence on a recurring basis.",
    categoryId: "logging_and_auditability",
    defaultEffort: "medium",
    defaultPriority: "medium",
    triggerSignalIds: [
      "limited_usage_logs",
      "no_exposure_investigation_capability",
    ],
    implementationSteps: [
      "Define what AI activity evidence should be reviewed",
      "Set a review cadence for security or governance owners",
      "Document findings and follow-up actions",
      "Align review scope with sensitive workflows",
    ],
    whyThisMatters:
      "Periodic review can surface risky patterns before they become incidents.",
    vykenGuardRelevance: "medium",
    defaultCaveats: [
      "Review processes should respect privacy and access controls.",
    ],
    relatedRiskCategories: ["visibility_and_inventory", "governance_controls"],
  },

  establish_alerting_or_blocking_for_high_risk_ai_activity: {
    recommendationId:
      "establish_alerting_or_blocking_for_high_risk_ai_activity",
    title: "Establish alerting or blocking for high-risk AI activity",
    summary:
      "Consider technical controls to warn or block high-risk AI data patterns where feasible.",
    categoryId: "logging_and_auditability",
    defaultEffort: "high",
    defaultPriority: "high",
    triggerSignalIds: [
      "sensitive_data_entering_ai",
      "secrets_tokens_exposure",
      "no_role_tool_data_controls",
    ],
    implementationSteps: [
      "Identify high-risk data patterns for AI workflows",
      "Evaluate warn, block, or redact options in enterprise tools",
      "Pilot controls on a limited team before broad rollout",
      "Document exceptions and approval paths",
    ],
    whyThisMatters:
      "Technical enforcement can complement policy for sensitive data patterns.",
    vykenGuardRelevance: "high",
    defaultCaveats: [
      "Controls should be tested to avoid disrupting legitimate workflows.",
    ],
    relatedRiskCategories: ["data_exposure", "visibility_and_inventory"],
    urgentSignalIds: ["secrets_tokens_exposure"],
  },

  document_ai_incident_investigation_process: {
    recommendationId: "document_ai_incident_investigation_process",
    title: "Document an AI incident investigation process",
    summary:
      "Define how the organization investigates suspected AI data exposure or misuse.",
    categoryId: "logging_and_auditability",
    defaultEffort: "high",
    defaultPriority: "medium",
    triggerSignalIds: [
      "no_exposure_investigation_capability",
      "sensitive_data_entering_ai",
      "secrets_tokens_exposure",
    ],
    implementationSteps: [
      "Define triggers for AI-related incident review",
      "Identify log sources and stakeholders to involve",
      "Document containment and communication steps",
      "Run a tabletop exercise for a plausible AI exposure scenario",
    ],
    whyThisMatters:
      "A documented process can reduce response time when exposure is suspected.",
    vykenGuardRelevance: "medium",
    defaultCaveats: [
      "This is an internal readiness step, not a substitute for legal counsel.",
    ],
    relatedRiskCategories: ["visibility_and_inventory", "data_exposure"],
  },

  set_developer_ai_usage_rules: {
    recommendationId: "set_developer_ai_usage_rules",
    title: "Set developer AI usage rules",
    summary:
      "Define rules for how engineering teams may use coding assistants and AI agents.",
    categoryId: "developer_ai_controls",
    defaultEffort: "medium",
    defaultPriority: "high",
    triggerSignalIds: ["coding_assistant_used", "repo_or_local_file_access"],
    implementationSteps: [
      "Define permitted repositories and environments for AI tools",
      "Clarify rules for production data and secrets in dev workflows",
      "Require security review for new AI coding integrations",
      "Communicate rules to engineering and platform teams",
    ],
    whyThisMatters:
      "Developer AI tools can access code and systems with broader blast radius.",
    vykenGuardRelevance: "medium",
    defaultCaveats: [
      "Rules should align with existing secure development practices.",
    ],
    relatedRiskCategories: ["agentic_and_coding_risk"],
  },

  require_review_for_ai_generated_code: {
    recommendationId: "require_review_for_ai_generated_code",
    title: "Require review for AI-generated code",
    summary:
      "Ensure AI-assisted code changes receive appropriate human review before merge.",
    categoryId: "developer_ai_controls",
    defaultEffort: "medium",
    defaultPriority: "high",
    triggerSignalIds: [
      "coding_assistant_used",
      "code_review_not_always_required",
      "secrets_or_production_data_possible",
    ],
    implementationSteps: [
      "Require peer review for AI-generated or AI-assisted changes",
      "Add checklist items for secrets, dependencies, and licensing",
      "Train reviewers on common AI code risks",
      "Track exceptions and tighten gates for sensitive repos",
    ],
    whyThisMatters:
      "Inconsistent review can increase supply-chain and quality risk.",
    vykenGuardRelevance: "low",
    defaultCaveats: ["Review depth should match repository sensitivity."],
    relatedRiskCategories: ["agentic_and_coding_risk"],
    urgentSignalIds: ["secrets_or_production_data_possible"],
  },

  protect_secrets_and_production_data_from_ai_tools: {
    recommendationId: "protect_secrets_and_production_data_from_ai_tools",
    title: "Protect secrets and production data from AI tools",
    summary:
      "Prevent credentials and production data from entering coding assistants or AI workspaces.",
    categoryId: "developer_ai_controls",
    defaultEffort: "high",
    defaultPriority: "urgent",
    triggerSignalIds: [
      "secrets_tokens_exposure",
      "secrets_or_production_data_possible",
      "logs_exposure",
      "source_code_exposure",
    ],
    implementationSteps: [
      "Scan repositories for secrets before enabling AI tooling",
      "Block production credentials in developer AI environments",
      "Use secret scanning in CI for AI-assisted commits",
      "Train developers on safe prompt hygiene for code tools",
    ],
    whyThisMatters:
      "Secrets and production data in AI tools can create high-impact security risk.",
    vykenGuardRelevance: "high",
    defaultCaveats: [
      "Validate controls with security engineering before broad rollout.",
    ],
    relatedRiskCategories: ["agentic_and_coding_risk", "data_exposure"],
    urgentSignalIds: [
      "secrets_tokens_exposure",
      "secrets_or_production_data_possible",
    ],
  },

  review_coding_assistant_repository_permissions: {
    recommendationId: "review_coding_assistant_repository_permissions",
    title: "Review coding assistant repository permissions",
    summary:
      "Apply least privilege to repositories and files accessible to coding assistants.",
    categoryId: "developer_ai_controls",
    defaultEffort: "medium",
    defaultPriority: "high",
    triggerSignalIds: [
      "repo_or_local_file_access",
      "coding_assistant_used",
      "ai_can_modify_files_or_run_commands",
    ],
    implementationSteps: [
      "Inventory which repos are connected to coding assistants",
      "Remove access to sensitive or production repositories where possible",
      "Require approval for new repository connections",
      "Review permissions after tool or team changes",
    ],
    whyThisMatters:
      "Broad repository access increases the scope of potential data exposure.",
    vykenGuardRelevance: "medium",
    defaultCaveats: [],
    relatedRiskCategories: ["agentic_and_coding_risk"],
  },

  review_agentic_ai_permissions: {
    recommendationId: "review_agentic_ai_permissions",
    title: "Review agentic AI permissions",
    summary:
      "Review permissions granted to agentic or connected AI tools that can take actions.",
    categoryId: "agentic_ai_controls",
    defaultEffort: "medium",
    defaultPriority: "high",
    triggerSignalIds: [
      "connected_tool_risk",
      "automation_platform_risk",
      "mcp_or_connected_tools_used",
      "ai_can_modify_files_or_run_commands",
    ],
    implementationSteps: [
      "List connected systems and actions each agentic tool can perform",
      "Remove unnecessary integrations and scopes",
      "Require approval for high-impact actions",
      "Document owners for each connected integration",
    ],
    whyThisMatters:
      "Agentic tools can act across systems and require careful permission design.",
    vykenGuardRelevance: "high",
    defaultCaveats: [
      "Permission reviews should be repeated when integrations change.",
    ],
    relatedRiskCategories: ["agentic_and_coding_risk", "vendor_and_tool_risk"],
  },

  apply_least_privilege_to_connected_ai_tools: {
    recommendationId: "apply_least_privilege_to_connected_ai_tools",
    title: "Apply least privilege to connected AI tools",
    summary:
      "Limit connected AI tools to the minimum permissions needed for their task.",
    categoryId: "agentic_ai_controls",
    defaultEffort: "high",
    defaultPriority: "high",
    triggerSignalIds: [
      "connected_tool_risk",
      "automation_platform_risk",
      "mcp_or_connected_tools_used",
      "internal_system_connection",
      "ai_can_modify_files_or_run_commands",
    ],
    implementationSteps: [
      "Map each integration to required actions only",
      "Disable write or execute permissions where read-only is sufficient",
      "Use separate service accounts with narrow scopes",
      "Review integrations after incidents or tool updates",
    ],
    whyThisMatters:
      "Least privilege can reduce blast radius when agentic tools are misused or misconfigured.",
    vykenGuardRelevance: "high",
    defaultCaveats: [
      "Some workflows may need phased rollout to avoid breaking automation.",
    ],
    relatedRiskCategories: ["agentic_and_coding_risk"],
    urgentSignalIds: [
      "internal_system_connection",
      "ai_can_modify_files_or_run_commands",
    ],
    priorityBoostSignalIds: ["shadow_ai_visibility_gap", "no_ai_policy"],
  },

  require_approval_for_ai_actions_touching_business_systems: {
    recommendationId:
      "require_approval_for_ai_actions_touching_business_systems",
    title: "Require approval for AI actions on business systems",
    summary:
      "Add human approval gates before AI tools modify files, tickets, or internal systems.",
    categoryId: "agentic_ai_controls",
    defaultEffort: "medium",
    defaultPriority: "high",
    triggerSignalIds: [
      "internal_system_connection",
      "ai_can_modify_files_or_run_commands",
      "automation_platform_risk",
    ],
    implementationSteps: [
      "Identify AI workflows that write to business systems",
      "Add approval steps for production-impacting actions",
      "Log approvals and outcomes for later review",
      "Restrict autonomous actions in sensitive environments",
    ],
    whyThisMatters:
      "Approval gates can reduce unintended changes from autonomous AI actions.",
    vykenGuardRelevance: "medium",
    defaultCaveats: [],
    relatedRiskCategories: ["agentic_and_coding_risk"],
  },

  log_and_review_agentic_ai_actions: {
    recommendationId: "log_and_review_agentic_ai_actions",
    title: "Log and review agentic AI actions",
    summary:
      "Capture and periodically review actions taken by connected or agentic AI tools.",
    categoryId: "agentic_ai_controls",
    defaultEffort: "medium",
    defaultPriority: "medium",
    triggerSignalIds: [
      "mcp_or_connected_tools_used",
      "connected_tool_risk",
      "limited_usage_logs",
    ],
    implementationSteps: [
      "Enable action logs where the platform supports them",
      "Define which agentic actions require review",
      "Assign owners to review high-risk action logs",
      "Investigate anomalous or high-volume actions",
    ],
    whyThisMatters:
      "Action logs support accountability for autonomous AI behavior.",
    vykenGuardRelevance: "high",
    defaultCaveats: [
      "Log detail varies by vendor; validate coverage internally.",
    ],
    relatedRiskCategories: [
      "agentic_and_coding_risk",
      "visibility_and_inventory",
    ],
  },

  require_human_review_for_sensitive_ai_assisted_decisions: {
    recommendationId:
      "require_human_review_for_sensitive_ai_assisted_decisions",
    title: "Require human review for sensitive AI-assisted decisions",
    summary:
      "Ensure people-impacting decisions assisted by AI receive appropriate human review.",
    categoryId: "human_review_and_decision_controls",
    defaultEffort: "medium",
    defaultPriority: "high",
    triggerSignalIds: [
      "ai_outputs_influence_people_decisions",
      "ai_decision_support_without_human_review",
      "no_human_review_for_sensitive_decisions",
    ],
    implementationSteps: [
      "Identify workflows where AI influences people-impacting outcomes",
      "Require human sign-off before final decisions",
      "Document what AI may and may not decide",
      "Train reviewers on limitations of AI outputs",
    ],
    whyThisMatters:
      "Human review can reduce reliance on unverified AI outputs in sensitive contexts.",
    vykenGuardRelevance: "low",
    defaultCaveats: [
      "Review requirements should be tailored to workflow sensitivity.",
    ],
    relatedRiskCategories: ["decision_impact_risk"],
  },

  document_ai_decision_support_boundaries: {
    recommendationId: "document_ai_decision_support_boundaries",
    title: "Document AI decision-support boundaries",
    summary:
      "Clarify where AI may assist versus where human judgment is required.",
    categoryId: "human_review_and_decision_controls",
    defaultEffort: "low",
    defaultPriority: "medium",
    triggerSignalIds: [
      "ai_outputs_influence_people_decisions",
      "regulated_decision_context_possible",
    ],
    implementationSteps: [
      "Document permitted AI-assisted decision types",
      "Define prohibited or high-risk decision categories",
      "Share boundaries with teams handling customer or employee outcomes",
      "Review boundaries when regulations or products change",
    ],
    whyThisMatters:
      "Clear boundaries can reduce inappropriate reliance on AI in regulated contexts.",
    vykenGuardRelevance: "none",
    defaultCaveats: [
      "Boundaries should be validated with legal and compliance stakeholders.",
    ],
    relatedRiskCategories: ["decision_impact_risk", "governance_controls"],
  },

  review_ai_use_in_regulated_or_people_impacting_workflows: {
    recommendationId:
      "review_ai_use_in_regulated_or_people_impacting_workflows",
    title: "Review AI use in regulated or people-impacting workflows",
    summary:
      "Review AI use cases that may affect customers, employees, or regulated processes.",
    categoryId: "human_review_and_decision_controls",
    defaultEffort: "medium",
    defaultPriority: "high",
    triggerSignalIds: [
      "regulated_decision_context_possible",
      "ai_outputs_influence_people_decisions",
      "health_data_exposure",
      "kyc_identity_data_exposure",
    ],
    implementationSteps: [
      "List workflows where AI supports regulated or people-impacting decisions",
      "Assess data types and vendor terms for each workflow",
      "Add review gates appropriate to workflow sensitivity",
      "Document residual risks and monitoring plans",
    ],
    whyThisMatters:
      "Regulated or people-impacting workflows may need stronger governance than general productivity use.",
    vykenGuardRelevance: "low",
    defaultCaveats: [
      "This assessment does not provide legal conclusions; validate internally.",
    ],
    relatedRiskCategories: ["decision_impact_risk", "data_exposure"],
    urgentSignalIds: ["health_data_exposure", "kyc_identity_data_exposure"],
  },

  periodically_review_ai_usage_and_governance: {
    recommendationId: "periodically_review_ai_usage_and_governance",
    title: "Periodically review AI usage and governance",
    summary:
      "Schedule recurring reviews of AI tools, policies, and risk signals as adoption evolves.",
    categoryId: "policy_and_governance",
    defaultEffort: "low",
    defaultPriority: "low",
    triggerSignalIds: [],
    implementationSteps: [
      "Set a quarterly review of approved tools and policies",
      "Track new AI tools requested by teams",
      "Revisit data-handling rules after major product changes",
      "Update governance owners and documentation as needed",
    ],
    whyThisMatters:
      "AI adoption changes quickly; periodic review helps maintain practical governance.",
    vykenGuardRelevance: "none",
    defaultCaveats: [
      "This is a baseline hygiene step for lower-risk contexts.",
    ],
    relatedRiskCategories: ["governance_controls"],
  },
};

export function getRecommendationTemplate(
  recommendationId: string,
): RecommendationTemplate {
  const template = RECOMMENDATION_LIBRARY[recommendationId];
  if (!template) {
    throw new Error(`Unknown recommendation template: ${recommendationId}`);
  }
  return template;
}

export function getLowConfidenceCaveat(): string {
  return LOW_CONFIDENCE_CAVEAT;
}
