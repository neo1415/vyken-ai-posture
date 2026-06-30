import {
  SEED_PROFILE_VERSION,
  SEED_REVIEW_DATE,
  SEED_REVIEWED_BY,
} from "@/features/tool-profiles/constants";
import type {
  ProfileSourceMetadata,
  ToolProfileSeed,
} from "@/features/tool-profiles/types";

const REVIEW_DATE = SEED_REVIEW_DATE;

function src(
  label: string,
  url: string,
  source_type: ProfileSourceMetadata["source_type"],
  notes: string,
): ProfileSourceMetadata {
  return { label, url, source_type, reviewed_at: REVIEW_DATE, notes };
}

/** Curated MVP tool identities and published profile version 1.0. */
export const TOOL_PROFILE_SEEDS: ToolProfileSeed[] = [
  {
    toolSlug: "chatgpt",
    toolName: "ChatGPT",
    categorySlug: "general_assistant",
    websiteUrl: "https://chat.openai.com",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "high",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: [
      "General workplace Q&A",
      "Drafting and editing",
      "Code assistance",
      "Document summarization",
    ],
    supportsFileUploads: true,
    supportsMeetingTranscripts: false,
    codingAssistantRelevance: true,
    agenticOrConnectedToolRelevance: true,
    publicPrivacyUrl: "https://openai.com/policies/privacy-policy",
    publicSecurityUrl: "https://openai.com/security",
    publicTrustUrl: "https://openai.com/enterprise-privacy",
    trainingUseNotes:
      "OpenAI states that business data from ChatGPT Business, ChatGPT Enterprise, ChatGPT Edu, and API Platform is not used to train OpenAI models by default, and that business customers own and control their data. Consumer ChatGPT plans have different terms and settings. Training-use and data handling depend on plan and configuration — do not assume consumer use has the same defaults as business/enterprise.",
    dataRetentionNotes:
      "OpenAI describes configurable retention controls for qualifying business/enterprise organizations. Consumer retention behavior may differ. Plan-dependent; requires organization-specific review for exact retention periods.",
    deletionControlNotes:
      "Business customers are described as owning/controlling their data under OpenAI enterprise materials. Consumer deletion and account controls should be reviewed against current OpenAI consumer terms.",
    enterpriseAdminControlsNotes:
      "ChatGPT Business and Enterprise are positioned for organizational use with enterprise privacy commitments. Admin, SSO, and workspace controls vary by plan — review OpenAI enterprise documentation for your deployment.",
    auditLoggingNotes:
      "Enterprise admin and compliance features should be confirmed from OpenAI enterprise documentation for your plan. Not confirmed from reviewed public documentation for all consumer tiers.",
    complianceSecurityDocsNotes:
      "OpenAI publishes security and enterprise privacy resources. Specific certifications and contractual terms depend on plan and agreement.",
    subprocessorNotes:
      "Subprocessor details should be confirmed from OpenAI legal/trust documentation for your plan. Not exhaustively listed in this seed profile.",
    sensitiveDataConcerns:
      "Consumer ChatGPT use may not provide the same data protections as business/enterprise deployments. Sensitive, regulated, or confidential data should use business/enterprise controls and contractual review.",
    recommendedUsageBoundaries:
      "Favor ChatGPT Business, Enterprise, or API with reviewed settings for sensitive work. Avoid entering customer PII, regulated data, or confidential material in unmanaged consumer accounts.",
    sources: [
      src(
        "OpenAI Enterprise Privacy",
        "https://openai.com/enterprise-privacy",
        "official_vendor",
        "Training-use defaults and business data ownership for enterprise/business plans.",
      ),
      src(
        "OpenAI Business terms",
        "https://openai.com/policies/business-terms",
        "official_vendor_legal",
        "Business plan terms and data handling context.",
      ),
      src(
        "OpenAI Security",
        "https://openai.com/security",
        "official_vendor_trust",
        "Security program and trust resources.",
      ),
    ],
    sourceConfidenceNotes:
      "High confidence for business/enterprise training-use statements from official OpenAI pages. Consumer plan behavior requires separate review.",
  },
  {
    toolSlug: "claude",
    toolName: "Claude",
    categorySlug: "general_assistant",
    websiteUrl: "https://claude.ai",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "high",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: [
      "General workplace Q&A",
      "Document analysis",
      "Code assistance",
      "Research drafting",
    ],
    supportsFileUploads: true,
    supportsMeetingTranscripts: false,
    codingAssistantRelevance: true,
    agenticOrConnectedToolRelevance: true,
    publicPrivacyUrl: "https://www.anthropic.com/legal/privacy",
    publicSecurityUrl: "https://www.anthropic.com/trust",
    publicTrustUrl: "https://trust.anthropic.com",
    trainingUseNotes:
      "Anthropic states that by default it does not use inputs/outputs from commercial products such as Claude for Work and the Anthropic API to train models. Consumer Claude plans have different terms and user choices. Do not generalize commercial defaults to consumer usage.",
    dataRetentionNotes:
      "Retention details vary by product and plan. Review Anthropic privacy documentation and your agreement for organization-specific retention.",
    deletionControlNotes:
      "User and organizational deletion controls depend on plan. Review Anthropic privacy center and commercial terms for your deployment.",
    enterpriseAdminControlsNotes:
      "Claude for Work and API commercial offerings include organizational controls described in Anthropic trust and commercial documentation. Consumer admin controls differ.",
    auditLoggingNotes:
      "Audit and logging capabilities for commercial deployments should be confirmed from Anthropic trust/compliance artifacts for your plan.",
    complianceSecurityDocsNotes:
      "Anthropic Trust Center publishes compliance and security resources. Specific certifications depend on product and contract.",
    subprocessorNotes:
      "Subprocessor information should be confirmed from Anthropic legal/trust documentation.",
    sensitiveDataConcerns:
      "Distinguish Claude consumer use from Claude for Work/API commercial use. Sensitive work should use commercial products with reviewed settings and contracts.",
    recommendedUsageBoundaries:
      "Use Claude for Work or API with reviewed commercial terms for sensitive data. Claude Code and coding features increase source-code exposure — apply code review and secrets hygiene.",
    sources: [
      src(
        "Anthropic Privacy Center",
        "https://www.anthropic.com/legal/privacy",
        "official_vendor",
        "Default training-use posture for commercial vs consumer products.",
      ),
      src(
        "Anthropic Trust Center",
        "https://trust.anthropic.com",
        "official_vendor_trust",
        "Compliance artifacts and enterprise controls.",
      ),
    ],
    sourceConfidenceNotes:
      "High confidence for commercial training-use default from official Anthropic privacy materials. Consumer plan nuances require separate review.",
  },
  {
    toolSlug: "google-gemini",
    toolName: "Google Gemini",
    categorySlug: "general_assistant",
    websiteUrl: "https://gemini.google.com",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "medium",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: [
      "General Q&A",
      "Workspace-integrated assistance",
      "Document and email drafting",
      "Code help",
    ],
    supportsFileUploads: true,
    supportsMeetingTranscripts: false,
    codingAssistantRelevance: true,
    agenticOrConnectedToolRelevance: true,
    publicPrivacyUrl: "https://policies.google.com/privacy",
    publicSecurityUrl: "https://workspace.google.com/security",
    publicTrustUrl: "https://workspace.google.com/solutions/ai",
    trainingUseNotes:
      "Gemini for Workspace is integrated with Google Workspace security and data protection commitments. Consumer Gemini Apps may have different privacy and retention behavior. Training-use and model improvement settings depend on product (Workspace vs consumer) and admin configuration.",
    dataRetentionNotes:
      "Workspace-managed Gemini inherits Workspace data handling boundaries for organizational content. Consumer Gemini Apps retention may differ. Plan-dependent; requires organization-specific review.",
    deletionControlNotes:
      "Workspace admins have organizational controls for Workspace data. Consumer account controls should be reviewed separately.",
    enterpriseAdminControlsNotes:
      "Gemini for Workspace is positioned within Google Workspace admin, access control, and security tooling. Organizations using consumer Gemini outside Workspace admin should not assume the same controls.",
    auditLoggingNotes:
      "Workspace audit and logging features may apply to Gemini for Workspace usage within Workspace boundaries. Consumer usage logging not confirmed from reviewed documentation.",
    complianceSecurityDocsNotes:
      "Google Workspace security and compliance documentation applies to Workspace-managed Gemini. Consumer product compliance posture may differ.",
    subprocessorNotes:
      "Google subprocessors and data processing terms are described in Google legal and Workspace documentation.",
    sensitiveDataConcerns:
      "Risk depends on whether the organization uses Gemini for Workspace with admin controls or consumer Gemini Apps. Oversharing and personal-account use outside IT governance increases exposure.",
    recommendedUsageBoundaries:
      "Prefer Gemini for Workspace under organizational admin for business data. Review Workspace sharing, DLP, and permissions before processing sensitive content.",
    sources: [
      src(
        "Gemini for Workspace",
        "https://workspace.google.com/solutions/ai",
        "official_vendor",
        "Workspace integration, security, and data protection context.",
      ),
      src(
        "Google Workspace Security",
        "https://workspace.google.com/security",
        "official_vendor_trust",
        "Workspace security controls relevant to managed Gemini.",
      ),
    ],
    reviewNotes:
      "Primary category set to general_assistant because Gemini spans consumer and Workspace contexts; Workspace copilot notes are captured in enterprise fields.",
    sourceConfidenceNotes:
      "Medium — strong Workspace sources; consumer Gemini Apps behavior requires additional product-specific review.",
  },
  {
    toolSlug: "microsoft-copilot",
    toolName: "Microsoft Copilot",
    categorySlug: "workplace_copilot",
    websiteUrl: "https://www.microsoft.com/microsoft-copilot",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "high",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: [
      "Microsoft 365 document drafting",
      "Teams and meeting summaries",
      "Email and calendar assistance",
      "SharePoint/OneDrive Q&A",
    ],
    supportsFileUploads: true,
    supportsMeetingTranscripts: true,
    codingAssistantRelevance: false,
    agenticOrConnectedToolRelevance: true,
    publicPrivacyUrl: "https://privacy.microsoft.com",
    publicSecurityUrl: "https://www.microsoft.com/trust-center",
    publicTrustUrl:
      "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy",
    trainingUseNotes:
      "Microsoft documents that Microsoft 365 Copilot and Copilot Chat offer enterprise data protection for prompts and responses under Microsoft 365 commercial commitments, and that Copilot does not use organizational content to train foundation models for Microsoft 365 Copilot. Consumer Copilot products may differ.",
    dataRetentionNotes:
      "Microsoft 365 Copilot data handling is described within Microsoft 365 commercial privacy documentation. Retention for consumer Copilot should be reviewed separately.",
    deletionControlNotes:
      "Organizational data lifecycle follows Microsoft 365 admin and compliance tooling for M365 Copilot contexts.",
    enterpriseAdminControlsNotes:
      "Copilot respects Microsoft 365 permissions — users only see organizational data they already have access to. Permissions hygiene and overshared SharePoint/OneDrive/Teams content are significant risk factors. Microsoft 365 Copilot agents/extensions may have separate privacy statements.",
    auditLoggingNotes:
      "Microsoft 365 compliance and audit capabilities may apply depending on license and configuration. Confirm from Microsoft 365 admin/compliance documentation.",
    complianceSecurityDocsNotes:
      "Microsoft Trust Center and Microsoft 365 Copilot privacy documentation describe commercial commitments. Agent extensibility requires review of per-agent terms.",
    subprocessorNotes:
      "Microsoft subprocessors are described in Microsoft trust and DPA documentation.",
    sensitiveDataConcerns:
      "Enterprise data protection applies in Microsoft 365 commercial Copilot context, but overshared files and excessive permissions can expose sensitive content through Copilot retrieval. Agent and connector extensions add connected-tool risk.",
    recommendedUsageBoundaries:
      "Review SharePoint/OneDrive/Teams permissions before broad Copilot rollout. Govern Copilot agents and connectors. Do not assume consumer Copilot has identical protections.",
    sources: [
      src(
        "Microsoft 365 Copilot privacy",
        "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy",
        "official_vendor",
        "Enterprise data protection, permissions model, and training-use posture.",
      ),
      src(
        "Microsoft Trust Center",
        "https://www.microsoft.com/trust-center",
        "official_vendor_trust",
        "Compliance and security documentation.",
      ),
    ],
  },
  {
    toolSlug: "perplexity",
    toolName: "Perplexity",
    categorySlug: "ai_search_research",
    websiteUrl: "https://www.perplexity.ai",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "medium",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: [
      "AI-powered web research",
      "Citation-backed answers",
      "File-assisted research",
    ],
    supportsFileUploads: true,
    supportsMeetingTranscripts: false,
    codingAssistantRelevance: false,
    agenticOrConnectedToolRelevance: false,
    publicPrivacyUrl: "https://www.perplexity.ai/hub/legal/privacy-policy",
    publicSecurityUrl: "https://www.perplexity.ai/enterprise",
    publicTrustUrl: "https://www.perplexity.ai/enterprise",
    trainingUseNotes:
      "Perplexity Enterprise materials state that Perplexity does not train LLMs on enterprise customer data. Public, free, and non-enterprise plan behavior should be reviewed separately — plan-dependent.",
    dataRetentionNotes:
      "Perplexity Enterprise describes configurable file retention and enterprise security controls. Non-enterprise retention details were not fully confirmed from reviewed public documentation.",
    deletionControlNotes:
      "Enterprise plans describe user management and administrative controls. Consumer deletion controls should be reviewed against current Perplexity terms.",
    enterpriseAdminControlsNotes:
      "Perplexity Enterprise advertises SSO/SCIM, user management, and enterprise security/privacy controls.",
    auditLoggingNotes:
      "Enterprise audit capabilities should be confirmed from Perplexity Enterprise documentation and contract.",
    complianceSecurityDocsNotes:
      "Enterprise security positioning is described on Perplexity Enterprise pages. Specific certifications require contract review.",
    subprocessorNotes:
      "Subprocessor details should be confirmed from Perplexity legal/enterprise documentation.",
    sensitiveDataConcerns:
      "Research outputs may include unverified citations — verify sources before business decisions. Uploaded files in non-enterprise use require caution.",
    recommendedUsageBoundaries:
      "Use Enterprise with reviewed settings for organizational research involving sensitive topics. Verify AI-generated citations. Avoid confidential uploads on unmanaged plans.",
    sources: [
      src(
        "Perplexity Enterprise",
        "https://www.perplexity.ai/enterprise",
        "official_vendor",
        "Enterprise training-use, retention, and security controls.",
      ),
      src(
        "Perplexity Privacy Policy",
        "https://www.perplexity.ai/hub/legal/privacy-policy",
        "official_vendor_legal",
        "General privacy terms for non-enterprise context.",
      ),
    ],
    sourceConfidenceNotes:
      "Medium — enterprise claims are sourced; free/pro tier details have gaps.",
  },
  {
    toolSlug: "deepseek",
    toolName: "DeepSeek",
    categorySlug: "general_assistant",
    websiteUrl: "https://www.deepseek.com",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "low",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: ["General Q&A", "Code assistance", "Document analysis"],
    supportsFileUploads: true,
    supportsMeetingTranscripts: false,
    codingAssistantRelevance: true,
    agenticOrConnectedToolRelevance: false,
    publicPrivacyUrl:
      "https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html",
    publicSecurityUrl: null,
    publicTrustUrl: null,
    trainingUseNotes:
      "DeepSeek's privacy policy states its corporate group processes personal data for functions including storage, security, research and development, foundation model training and optimization, analytics, and support. Do not assume inputs are excluded from model development without organization-specific review of deployment path and terms.",
    dataRetentionNotes:
      "Retention details were not confirmed from reviewed public documentation beyond general processing purposes described in the privacy policy.",
    deletionControlNotes:
      "User deletion rights may be described in the privacy policy. Organization-specific deployment controls require internal review.",
    enterpriseAdminControlsNotes:
      "Enterprise admin controls for public DeepSeek consumer/API use were not confirmed from reviewed public documentation.",
    auditLoggingNotes:
      "Audit logging capabilities were not confirmed from reviewed public documentation.",
    complianceSecurityDocsNotes:
      "Formal trust center artifacts were not identified in this seed review. Organization-specific legal and security review recommended.",
    subprocessorNotes:
      "Subprocessor details should be confirmed from DeepSeek legal documentation if available.",
    sensitiveDataConcerns:
      "Higher caution for sensitive, regulated, or customer data in unmanaged public use given stated processing for model training/optimization. Organization-specific review recommended before approval.",
    recommendedUsageBoundaries:
      "Use with sensitive, regulated, or confidential data should be reviewed before approval. Prefer alternatives with clearer enterprise data commitments unless a reviewed private deployment exists.",
    sources: [
      src(
        "DeepSeek Privacy Policy",
        "https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html",
        "official_vendor_legal",
        "Processing purposes including foundation model training and optimization.",
      ),
    ],
    reviewNotes:
      "Low confidence due to limited official trust/security documentation reviewed and policy language indicating broad processing purposes.",
    sourceConfidenceNotes:
      "Low — rely on privacy policy only; no comprehensive trust center reviewed.",
  },
  {
    toolSlug: "github-copilot",
    toolName: "GitHub Copilot",
    categorySlug: "coding_assistant",
    websiteUrl: "https://github.com/features/copilot",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "high",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: [
      "IDE code completion",
      "Code explanation",
      "Test generation",
      "Pull request assistance",
    ],
    supportsFileUploads: false,
    supportsMeetingTranscripts: false,
    codingAssistantRelevance: true,
    agenticOrConnectedToolRelevance: true,
    publicPrivacyUrl:
      "https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement",
    publicSecurityUrl: "https://docs.github.com/en/copilot",
    publicTrustUrl: "https://resources.github.com/copilot-trust-center",
    trainingUseNotes:
      "GitHub Copilot data use depends on plan, settings, and whether content filters or enterprise policies apply. Review GitHub Copilot Trust Center and admin settings for your organization — do not assume all suggestions are private to your tenant without configuration review.",
    dataRetentionNotes:
      "Retention and telemetry behavior are described in GitHub Copilot documentation and vary by plan. Plan-dependent; requires organization-specific review.",
    deletionControlNotes:
      "Organizations should review GitHub enterprise admin controls and Copilot policy settings for data handling and user opt-outs where available.",
    enterpriseAdminControlsNotes:
      "GitHub provides Copilot for Business/Enterprise admin controls, policy management, and trust documentation. Review licensing, seat assignment, and repository access scope.",
    auditLoggingNotes:
      "GitHub enterprise audit log features may apply depending on plan. Confirm from GitHub enterprise documentation.",
    complianceSecurityDocsNotes:
      "GitHub Copilot Trust Center publishes security and compliance resources.",
    subprocessorNotes:
      "GitHub and Microsoft subprocessors apply — confirm from GitHub/Microsoft trust documentation.",
    sensitiveDataConcerns:
      "Private source code, secrets in repos, and generated code quality are primary risks. Copilot may suggest code that requires security review. Ensure secret scanning and code review processes.",
    recommendedUsageBoundaries:
      "Restrict to approved repositories. Enable secret scanning. Require human review of generated code. Review admin policies before allowing access to sensitive codebases.",
    sources: [
      src(
        "GitHub Copilot Trust Center",
        "https://resources.github.com/copilot-trust-center",
        "official_vendor_trust",
        "Security, privacy, and compliance for Copilot.",
      ),
      src(
        "GitHub Copilot documentation",
        "https://docs.github.com/en/copilot",
        "official_vendor_help",
        "Product behavior, settings, and enterprise features.",
      ),
    ],
  },
  {
    toolSlug: "cursor",
    toolName: "Cursor",
    categorySlug: "coding_assistant",
    websiteUrl: "https://cursor.com",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "medium",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: [
      "AI pair programming",
      "Codebase Q&A",
      "Refactoring assistance",
      "Agentic coding tasks",
    ],
    supportsFileUploads: false,
    supportsMeetingTranscripts: false,
    codingAssistantRelevance: true,
    agenticOrConnectedToolRelevance: true,
    publicPrivacyUrl: "https://cursor.com/privacy",
    publicSecurityUrl: "https://cursor.com/security",
    publicTrustUrl: "https://cursor.com/data-use",
    trainingUseNotes:
      "Cursor's data-use documentation states that Privacy Mode affects whether customer data is used for training by Cursor and describes zero-data-retention agreements with model providers under that mode. Training and retention depend on Privacy Mode and plan settings — do not claim all use is zero retention without verifying current settings.",
    dataRetentionNotes:
      "Privacy Mode and provider zero-data-retention agreements are key configuration factors. Without Privacy Mode, retention/training posture may differ.",
    deletionControlNotes:
      "Review Cursor privacy and data-use pages for account data deletion. Codebase indexing scope should be limited to approved projects.",
    enterpriseAdminControlsNotes:
      "Team and enterprise controls should be reviewed from Cursor security documentation for organizational deployments.",
    auditLoggingNotes:
      "Organizational audit logging was not fully confirmed from reviewed public documentation.",
    complianceSecurityDocsNotes:
      "Cursor publishes security documentation. Specific certifications require contract review.",
    subprocessorNotes:
      "Cursor routes requests to model providers — subprocessors include model providers described in Cursor documentation.",
    sensitiveDataConcerns:
      "Full codebase access, agent/command execution, and secrets in source files are primary risks. Agent features can trigger actions depending on configuration.",
    recommendedUsageBoundaries:
      "Enable Privacy Mode for sensitive codebases where appropriate. Exclude secrets from repos. Limit agent permissions. Human-review generated and executed changes.",
    sources: [
      src(
        "Cursor Data Use",
        "https://cursor.com/data-use",
        "official_vendor",
        "Privacy Mode, training use, and provider retention agreements.",
      ),
      src(
        "Cursor Security",
        "https://cursor.com/security",
        "official_vendor_trust",
        "Security practices and organizational deployment notes.",
      ),
    ],
    sourceConfidenceNotes:
      "Medium — strong official data-use page; some enterprise audit details not confirmed.",
  },
  {
    toolSlug: "notion-ai",
    toolName: "Notion AI",
    categorySlug: "writing_productivity",
    websiteUrl: "https://www.notion.so/product/ai",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "medium",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: [
      "Workspace writing assistance",
      "Summarization",
      "Q&A over workspace content",
      "Meeting notes drafting",
    ],
    supportsFileUploads: true,
    supportsMeetingTranscripts: false,
    codingAssistantRelevance: false,
    agenticOrConnectedToolRelevance: false,
    publicPrivacyUrl:
      "https://www.notion.so/help/notion-ai-security-privacy-and-data-policies",
    publicSecurityUrl: "https://www.notion.so/help/security-and-privacy",
    publicTrustUrl:
      "https://www.notion.so/help/notion-ai-security-privacy-and-data-policies",
    trainingUseNotes:
      "Notion AI security materials state that Notion AI is designed to protect customer data and prevent information leaks to other users. Training-use specifics should be confirmed from current Notion AI privacy documentation for your plan.",
    dataRetentionNotes:
      "Workspace data handling follows Notion workspace policies. Exact AI-specific retention should be confirmed from Notion AI documentation.",
    deletionControlNotes:
      "Workspace admins and users should use Notion workspace deletion and export controls. AI-generated content inherits workspace sharing rules.",
    enterpriseAdminControlsNotes:
      "Review workspace permissions, guest access, and enterprise security settings before enabling Notion AI on sensitive workspaces.",
    auditLoggingNotes:
      "Enterprise audit features should be confirmed from Notion enterprise documentation.",
    complianceSecurityDocsNotes:
      "Notion publishes security and compliance resources. Specific certifications depend on plan.",
    subprocessorNotes:
      "Notion subprocessors are described in Notion legal/security documentation.",
    sensitiveDataConcerns:
      "Workspace content including shared pages and databases may be processed by Notion AI. Over-permissive sharing increases exposure.",
    recommendedUsageBoundaries:
      "Review workspace access and sharing before AI use on confidential content. Use enterprise settings and access reviews for regulated data.",
    sources: [
      src(
        "Notion AI security and privacy",
        "https://www.notion.so/help/notion-ai-security-privacy-and-data-policies",
        "official_vendor",
        "Customer data protection and AI data handling.",
      ),
      src(
        "Notion Security and Privacy",
        "https://www.notion.so/help/security-and-privacy",
        "official_vendor_trust",
        "Workspace security controls.",
      ),
    ],
  },
  {
    toolSlug: "grammarly",
    toolName: "Grammarly",
    categorySlug: "writing_productivity",
    websiteUrl: "https://www.grammarly.com",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "medium",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: [
      "Writing correction",
      "Tone adjustment",
      "Email and document editing",
    ],
    supportsFileUploads: false,
    supportsMeetingTranscripts: false,
    codingAssistantRelevance: false,
    agenticOrConnectedToolRelevance: false,
    publicPrivacyUrl: "https://www.grammarly.com/privacy-policy",
    publicSecurityUrl: "https://www.grammarly.com/trust",
    publicTrustUrl: "https://www.grammarly.com/trust",
    trainingUseNotes:
      "Grammarly states it uses user text, writing behavior, and usage data to provide suggestions and improve services. Enterprise offerings describe additional data protection controls — review enterprise terms for organizational use.",
    dataRetentionNotes:
      "Retention details vary by product tier. Review Grammarly trust and privacy documentation for your plan.",
    deletionControlNotes:
      "Account and data deletion options are described in Grammarly privacy materials. Enterprise controls require contract review.",
    enterpriseAdminControlsNotes:
      "Grammarly Business/Enterprise describes admin controls and enterprise-grade data protection. Consumer browser extension use may lack centralized admin governance.",
    auditLoggingNotes:
      "Enterprise audit capabilities should be confirmed from Grammarly trust documentation and contract.",
    complianceSecurityDocsNotes:
      "Grammarly Trust page describes security program and compliance positioning.",
    subprocessorNotes:
      "Subprocessors described in Grammarly legal/trust documentation.",
    sensitiveDataConcerns:
      "Text entered into Grammarly — including email, documents, and form fields — may contain confidential or customer content.",
    recommendedUsageBoundaries:
      "Avoid entering regulated, customer, or confidential text in consumer Grammarly without enterprise terms review. Govern browser extension use via policy.",
    sources: [
      src(
        "Grammarly Trust",
        "https://www.grammarly.com/trust",
        "official_vendor_trust",
        "Security, privacy, and enterprise controls.",
      ),
      src(
        "Grammarly Privacy Policy",
        "https://www.grammarly.com/privacy-policy",
        "official_vendor_legal",
        "Data use including text and usage data.",
      ),
    ],
  },
  {
    toolSlug: "otter",
    toolName: "Otter",
    categorySlug: "meeting_assistant",
    websiteUrl: "https://otter.ai",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "medium",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: [
      "Meeting transcription",
      "Live notes",
      "Meeting summaries",
      "Collaboration on transcripts",
    ],
    supportsFileUploads: true,
    supportsMeetingTranscripts: true,
    codingAssistantRelevance: false,
    agenticOrConnectedToolRelevance: false,
    publicPrivacyUrl: "https://otter.ai/privacy-policy",
    publicSecurityUrl: "https://otter.ai/privacy-security",
    publicTrustUrl: "https://otter.ai/privacy-security",
    trainingUseNotes:
      "Training-use specifics for meeting content were not fully confirmed from reviewed public documentation. Review Otter privacy materials for current model improvement settings.",
    dataRetentionNotes:
      "Transcript retention and sharing settings are user/org configurable in product. Review retention defaults and admin settings.",
    deletionControlNotes:
      "Users should review transcript deletion and sharing controls. Meeting recordings may persist until explicitly deleted per product settings.",
    enterpriseAdminControlsNotes:
      "Otter describes team and enterprise security features on privacy/security pages. Confirm admin controls for your plan.",
    auditLoggingNotes:
      "Audit logging was not confirmed from reviewed public documentation.",
    complianceSecurityDocsNotes:
      "Otter privacy/security resources describe data handling for voice collaboration.",
    subprocessorNotes:
      "Subprocessors should be confirmed from Otter legal documentation.",
    sensitiveDataConcerns:
      "Meeting recordings and transcripts frequently contain sensitive, confidential, or regulated information. Participant consent and meeting transparency are essential.",
    recommendedUsageBoundaries:
      "Establish meeting bot policy and participant consent. Restrict use in confidential meetings. Review transcript sharing and retention regularly.",
    sources: [
      src(
        "Otter Privacy and Security",
        "https://otter.ai/privacy-security",
        "official_vendor_trust",
        "Meeting data handling and security practices.",
      ),
      src(
        "Otter Privacy Policy",
        "https://otter.ai/privacy-policy",
        "official_vendor_legal",
        "Privacy terms for meeting/voice data.",
      ),
    ],
  },
  {
    toolSlug: "fireflies",
    toolName: "Fireflies",
    categorySlug: "meeting_assistant",
    websiteUrl: "https://fireflies.ai",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "medium",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: [
      "Meeting transcription",
      "AI meeting notes",
      "Search across meetings",
      "CRM integrations",
    ],
    supportsFileUploads: true,
    supportsMeetingTranscripts: true,
    codingAssistantRelevance: false,
    agenticOrConnectedToolRelevance: true,
    publicPrivacyUrl: "https://fireflies.ai/privacy_policy.pdf",
    publicSecurityUrl: "https://fireflies.ai/security",
    publicTrustUrl: "https://fireflies.ai/security",
    trainingUseNotes:
      "Training-use on meeting content should be confirmed from Fireflies legal and security documentation for your plan.",
    dataRetentionNotes:
      "Fireflies security materials describe meeting transcripts, recordings, and notes with user control/ownership claims. Review retention settings in product.",
    deletionControlNotes:
      "Users retain control per Fireflies security documentation — verify deletion workflows and integration copies.",
    enterpriseAdminControlsNotes:
      "Review team admin settings, integration permissions, and meeting bot policies.",
    auditLoggingNotes:
      "Enterprise audit features should be confirmed from Fireflies security documentation.",
    complianceSecurityDocsNotes:
      "Fireflies publishes security and trust resources.",
    subprocessorNotes:
      "Integration subprocessors include connected calendar and CRM systems — review connected app permissions.",
    sensitiveDataConcerns:
      "Meeting bots access live conversations. Integrations may copy transcript data to third-party systems. Participant consent required.",
    recommendedUsageBoundaries:
      "Govern meeting bot deployment. Review connected integrations with least privilege. Establish confidential meeting exclusions and consent policy.",
    sources: [
      src(
        "Fireflies Security",
        "https://fireflies.ai/security",
        "official_vendor_trust",
        "Meeting data ownership, security controls, and trust resources.",
      ),
    ],
    sourceConfidenceNotes:
      "Medium — security page reviewed; some legal PDF URLs may require periodic re-verification.",
  },
  {
    toolSlug: "fathom",
    toolName: "Fathom",
    categorySlug: "meeting_assistant",
    websiteUrl: "https://www.fathom.video",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "medium",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: [
      "Zoom meeting recording",
      "AI summaries",
      "Highlight clips",
      "CRM note sync",
    ],
    supportsFileUploads: true,
    supportsMeetingTranscripts: true,
    codingAssistantRelevance: false,
    agenticOrConnectedToolRelevance: false,
    publicPrivacyUrl: "https://www.fathom.video/privacy",
    publicSecurityUrl: "https://www.fathom.video/data-security",
    publicTrustUrl: "https://www.fathom.video/data-security",
    trainingUseNotes:
      "Training-use on meeting recordings was not confirmed from reviewed public documentation.",
    dataRetentionNotes:
      "Fathom data-security resources discuss data storage and handling. Review product retention settings.",
    deletionControlNotes:
      "Fathom describes data deletion request processes in privacy/data-security materials. Verify current workflow on vendor site.",
    enterpriseAdminControlsNotes:
      "Team settings and integration permissions should be reviewed for organizational deployments.",
    auditLoggingNotes:
      "Audit logging was not confirmed from reviewed public documentation.",
    complianceSecurityDocsNotes:
      "Fathom privacy/data-security pages reference GDPR/DPA and SOC 2 positioning — confirm current status from vendor trust materials.",
    subprocessorNotes:
      "Subprocessors should be confirmed from Fathom DPA/legal documentation.",
    sensitiveDataConcerns:
      "Records Zoom meetings by default when enabled — confidential conversations may be captured without clear participant awareness.",
    recommendedUsageBoundaries:
      "Require meeting participant consent and transparency. Review deletion process and storage region. Exclude confidential meetings from recording.",
    sources: [
      src(
        "Fathom Data Security",
        "https://www.fathom.video/data-security",
        "official_vendor_trust",
        "Data handling, deletion, GDPR/DPA, and SOC 2 references.",
      ),
      src(
        "Fathom Privacy",
        "https://www.fathom.video/privacy",
        "official_vendor_legal",
        "Privacy terms for meeting recording data.",
      ),
    ],
  },
  {
    toolSlug: "canva-ai",
    toolName: "Canva AI",
    categorySlug: "design_media",
    websiteUrl: "https://www.canva.com/ai",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "medium",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: [
      "AI image generation",
      "Design drafting",
      "Brand template assistance",
      "Content rewriting",
    ],
    supportsFileUploads: true,
    supportsMeetingTranscripts: false,
    codingAssistantRelevance: false,
    agenticOrConnectedToolRelevance: false,
    publicPrivacyUrl: "https://www.canva.com/policies/privacy-policy",
    publicSecurityUrl: "https://www.canva.com/trust",
    publicTrustUrl: "https://www.canva.com/trust",
    trainingUseNotes:
      "Canva privacy materials indicate users can manage whether data is used to improve AI-powered features through privacy settings. AI training/improvement use is settings-dependent.",
    dataRetentionNotes:
      "Retention follows Canva account and content policies. Review privacy settings for AI improvement opt-outs.",
    deletionControlNotes:
      "Users can manage designs and account data per Canva policies. Review team content ownership for enterprise teams.",
    enterpriseAdminControlsNotes:
      "Canva Teams/Enterprise provides admin controls described in Canva trust documentation. Review brand kit and asset governance.",
    auditLoggingNotes:
      "Enterprise audit features should be confirmed from Canva enterprise documentation.",
    complianceSecurityDocsNotes:
      "Canva Trust describes security program and compliance resources.",
    subprocessorNotes:
      "Canva subprocessors described in legal/trust documentation.",
    sensitiveDataConcerns:
      "Uploaded brand assets, confidential designs, and customer marketing materials may be processed by AI features.",
    recommendedUsageBoundaries:
      "Review AI privacy settings. Restrict confidential brand assets to governed team workspaces. Review enterprise controls before processing sensitive creative assets.",
    sources: [
      src(
        "Canva Trust",
        "https://www.canva.com/trust",
        "official_vendor_trust",
        "Security and compliance resources.",
      ),
      src(
        "Canva Privacy Policy",
        "https://www.canva.com/policies/privacy-policy",
        "official_vendor_legal",
        "AI improvement settings and data use.",
      ),
    ],
  },
  {
    toolSlug: "zapier-ai",
    toolName: "Zapier AI",
    categorySlug: "automation_agent",
    websiteUrl: "https://zapier.com/ai",
    profileVersion: SEED_PROFILE_VERSION,
    publishedStatus: "published",
    publicInfoConfidenceLevel: "medium",
    lastReviewedAt: REVIEW_DATE,
    reviewedBy: SEED_REVIEWED_BY,
    commonUseCases: [
      "Workflow automation",
      "AI-assisted Zap building",
      "Cross-app data sync",
      "Business process automation",
    ],
    supportsFileUploads: false,
    supportsMeetingTranscripts: false,
    codingAssistantRelevance: false,
    agenticOrConnectedToolRelevance: true,
    publicPrivacyUrl: "https://zapier.com/privacy",
    publicSecurityUrl: "https://zapier.com/security-compliance",
    publicTrustUrl: "https://zapier.com/security-compliance",
    trainingUseNotes:
      "AI feature data use should be reviewed in Zapier privacy and security documentation. Automation data flows through connected apps.",
    dataRetentionNotes:
      "Zapier describes enterprise-grade encryption and access controls. Task history retention depends on plan and configuration.",
    deletionControlNotes:
      "Review Zap transfer history, connected app data, and account deletion procedures.",
    enterpriseAdminControlsNotes:
      "Zapier security/compliance pages describe SOC 2, GDPR/CCPA, access controls, and enterprise features. Apply least privilege for connected apps.",
    auditLoggingNotes:
      "Review Zapier enterprise audit and admin logging capabilities for your plan.",
    complianceSecurityDocsNotes:
      "Zapier publishes security and compliance documentation including SOC 2 and GDPR/CCPA references.",
    subprocessorNotes:
      "Each connected app in a Zap is a data processor/subprocessor boundary — review all connected integrations.",
    sensitiveDataConcerns:
      "Automations can read, transform, and write data across business systems. Over-permissioned connections can exfiltrate or modify sensitive records.",
    recommendedUsageBoundaries:
      "Apply least privilege for app connections. Require approval for Zaps touching sensitive systems. Audit logs, secrets, and tokens regularly.",
    sources: [
      src(
        "Zapier Security and Compliance",
        "https://zapier.com/security-compliance",
        "official_vendor_trust",
        "Encryption, access controls, SOC 2, GDPR/CCPA.",
      ),
      src(
        "Zapier Privacy",
        "https://zapier.com/privacy",
        "official_vendor_legal",
        "Data handling for automation and AI features.",
      ),
    ],
  },
];
