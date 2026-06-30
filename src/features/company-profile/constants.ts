export const COUNTRY_REGION_VALUES = [
  "nigeria",
  "united_states",
  "united_kingdom",
  "european_union",
  "canada",
  "south_africa",
  "ghana",
  "kenya",
  "other",
  "not_sure",
] as const;

export const INDUSTRY_VALUES = [
  "banking",
  "fintech",
  "insurance",
  "healthcare",
  "legal_professional_services",
  "consulting",
  "saas_technology",
  "education",
  "public_sector",
  "telecoms",
  "retail_ecommerce",
  "media_marketing",
  "manufacturing",
  "other",
  "not_sure",
] as const;

export const COMPANY_SIZE_VALUES = [
  "1_10",
  "11_50",
  "51_200",
  "201_500",
  "501_1000",
  "1001_5000",
  "5000_plus",
  "not_sure",
] as const;

export const RESPONDENT_ROLE_VALUES = [
  "ciso_security_leader",
  "grc_compliance",
  "data_protection_privacy",
  "it_leader",
  "risk_audit",
  "legal",
  "engineering_cto",
  "operations",
  "founder_executive",
  "product_business",
  "other",
  "not_sure",
] as const;

export const DEPARTMENT_FUNCTION_VALUES = [
  "security",
  "it",
  "compliance",
  "privacy",
  "risk",
  "legal",
  "engineering",
  "operations",
  "sales_marketing",
  "finance",
  "hr",
  "leadership",
  "other",
  "not_sure",
] as const;

export const SENSITIVE_DATA_VALUES = ["yes", "no", "not_sure"] as const;

export const MAIN_AI_CONCERN_VALUES = [
  "personal_ai_accounts",
  "sensitive_data_prompts_uploads",
  "meeting_transcripts",
  "source_code_developer_tools",
  "ai_agents_connected_tools",
  "lack_of_ai_policy",
  "lack_of_visibility_audit_logs",
  "vendor_privacy_concerns",
  "regulatory_compliance_pressure",
  "not_sure_yet",
] as const;

export const COUNTRY_REGION_OPTIONS = [
  { value: "nigeria", label: "Nigeria" },
  { value: "united_states", label: "United States" },
  { value: "united_kingdom", label: "United Kingdom" },
  { value: "european_union", label: "European Union" },
  { value: "canada", label: "Canada" },
  { value: "south_africa", label: "South Africa" },
  { value: "ghana", label: "Ghana" },
  { value: "kenya", label: "Kenya" },
  { value: "other", label: "Other" },
  { value: "not_sure", label: "Not sure" },
] as const satisfies ReadonlyArray<{
  value: (typeof COUNTRY_REGION_VALUES)[number];
  label: string;
}>;

export const INDUSTRY_OPTIONS = [
  { value: "banking", label: "Banking" },
  { value: "fintech", label: "Fintech" },
  { value: "insurance", label: "Insurance" },
  { value: "healthcare", label: "Healthcare" },
  {
    value: "legal_professional_services",
    label: "Legal / Professional Services",
  },
  { value: "consulting", label: "Consulting" },
  { value: "saas_technology", label: "SaaS / Technology" },
  { value: "education", label: "Education" },
  { value: "public_sector", label: "Public Sector" },
  { value: "telecoms", label: "Telecoms" },
  { value: "retail_ecommerce", label: "Retail / Ecommerce" },
  { value: "media_marketing", label: "Media / Marketing" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "other", label: "Other" },
  { value: "not_sure", label: "Not sure" },
] as const satisfies ReadonlyArray<{
  value: (typeof INDUSTRY_VALUES)[number];
  label: string;
}>;

export const COMPANY_SIZE_OPTIONS = [
  { value: "1_10", label: "1–10" },
  { value: "11_50", label: "11–50" },
  { value: "51_200", label: "51–200" },
  { value: "201_500", label: "201–500" },
  { value: "501_1000", label: "501–1,000" },
  { value: "1001_5000", label: "1,001–5,000" },
  { value: "5000_plus", label: "5,000+" },
  { value: "not_sure", label: "Not sure" },
] as const satisfies ReadonlyArray<{
  value: (typeof COMPANY_SIZE_VALUES)[number];
  label: string;
}>;

export const RESPONDENT_ROLE_OPTIONS = [
  { value: "ciso_security_leader", label: "CISO / Security Leader" },
  { value: "grc_compliance", label: "GRC / Compliance" },
  { value: "data_protection_privacy", label: "Data Protection / Privacy" },
  { value: "it_leader", label: "IT Leader" },
  { value: "risk_audit", label: "Risk / Audit" },
  { value: "legal", label: "Legal" },
  { value: "engineering_cto", label: "Engineering / CTO" },
  { value: "operations", label: "Operations" },
  { value: "founder_executive", label: "Founder / Executive" },
  { value: "product_business", label: "Product / Business" },
  { value: "other", label: "Other" },
  { value: "not_sure", label: "Not sure" },
] as const satisfies ReadonlyArray<{
  value: (typeof RESPONDENT_ROLE_VALUES)[number];
  label: string;
}>;

export const DEPARTMENT_FUNCTION_OPTIONS = [
  { value: "security", label: "Security" },
  { value: "it", label: "IT" },
  { value: "compliance", label: "Compliance" },
  { value: "privacy", label: "Privacy" },
  { value: "risk", label: "Risk" },
  { value: "legal", label: "Legal" },
  { value: "engineering", label: "Engineering" },
  { value: "operations", label: "Operations" },
  { value: "sales_marketing", label: "Sales / Marketing" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "HR" },
  { value: "leadership", label: "Leadership" },
  { value: "other", label: "Other" },
  { value: "not_sure", label: "Not sure" },
] as const satisfies ReadonlyArray<{
  value: (typeof DEPARTMENT_FUNCTION_VALUES)[number];
  label: string;
}>;

export const SENSITIVE_DATA_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
] as const satisfies ReadonlyArray<{
  value: (typeof SENSITIVE_DATA_VALUES)[number];
  label: string;
}>;

export const MAIN_AI_CONCERN_OPTIONS = [
  { value: "personal_ai_accounts", label: "Personal AI accounts" },
  {
    value: "sensitive_data_prompts_uploads",
    label: "Sensitive data in prompts/uploads",
  },
  { value: "meeting_transcripts", label: "Meeting transcripts" },
  {
    value: "source_code_developer_tools",
    label: "Source code or developer tools",
  },
  {
    value: "ai_agents_connected_tools",
    label: "AI agents or connected tools",
  },
  { value: "lack_of_ai_policy", label: "Lack of AI policy" },
  {
    value: "lack_of_visibility_audit_logs",
    label: "Lack of visibility/audit logs",
  },
  { value: "vendor_privacy_concerns", label: "Vendor/privacy concerns" },
  {
    value: "regulatory_compliance_pressure",
    label: "Regulatory or compliance pressure",
  },
  { value: "not_sure_yet", label: "Not sure yet" },
] as const satisfies ReadonlyArray<{
  value: (typeof MAIN_AI_CONCERN_VALUES)[number];
  label: string;
}>;

export const COMPANY_PROFILE_COPY = {
  pageTitle: "Tell us about your organization",
  supportingCopy:
    "We only ask for basic business context so the report can reflect your industry, company size, and likely governance expectations. Do not enter confidential information.",
  stepLabel: "Step 1 of 4",
  introLine: "First, tell us a little about your organization.",
  submitLabel: "Continue to AI tools",
  continueLabel: "Continue",
  backLabel: "Back",
  progressLabel: "Your AI governance posture",
  brandLabel: "Vyken Security",
  freeToolLabel: "Free tool",
  confidentialityNote: "Do not enter confidential information.",
} as const;

export const COMPANY_PROFILE_INTERNAL_STEPS = [
  {
    id: "basics",
    title: "Organization basics",
    description: "Optional company name and your country or region.",
  },
  {
    id: "industry-size",
    title: "Industry and company size",
    description:
      "Industry helps us interpret governance expectations. Company size changes what reasonable AI governance usually looks like.",
  },
  {
    id: "role",
    title: "Your role",
    description: "This helps tailor report language and follow-up context.",
  },
  {
    id: "sensitivity",
    title: "Data sensitivity",
    description:
      "This helps us understand whether stricter data handling, auditability, or human review may be needed.",
  },
  {
    id: "concerns",
    title: "Main AI concerns",
    description:
      "Select up to five. This helps focus your report on what matters most.",
  },
] as const;

export const SENSITIVE_DATA_HELPERS = {
  yes: "Customer, employee, financial, health, legal, claims, or regulated data may be involved.",
  no: "AI use is currently limited to low-sensitivity business context.",
  not_sure: "The report will treat this as an area to review.",
} as const satisfies Record<(typeof SENSITIVE_DATA_VALUES)[number], string>;

export const COMPANY_PROFILE_INTERNAL_STEP_COUNT =
  COMPANY_PROFILE_INTERNAL_STEPS.length;

export const ASSESSMENT_WIZARD_STEPS = [
  { id: "company", label: "Company context" },
  { id: "tools", label: "AI tools" },
  { id: "usage", label: "Usage & data" },
  { id: "results", label: "Results" },
] as const;

export const COMPANY_NAME_MAX_LENGTH = 120;
