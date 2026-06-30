import type {
  COMPANY_SIZE_VALUES,
  COUNTRY_REGION_VALUES,
  DEPARTMENT_FUNCTION_VALUES,
  INDUSTRY_VALUES,
  MAIN_AI_CONCERN_VALUES,
  RESPONDENT_ROLE_VALUES,
  SENSITIVE_DATA_VALUES,
} from "./constants";

export type CountryRegion = (typeof COUNTRY_REGION_VALUES)[number];
export type Industry = (typeof INDUSTRY_VALUES)[number];
export type CompanySize = (typeof COMPANY_SIZE_VALUES)[number];
export type RespondentRole = (typeof RESPONDENT_ROLE_VALUES)[number];
export type DepartmentFunction = (typeof DEPARTMENT_FUNCTION_VALUES)[number];
export type SensitiveDataAnswer = (typeof SENSITIVE_DATA_VALUES)[number];
export type MainAiConcern = (typeof MAIN_AI_CONCERN_VALUES)[number];

export type CompanyProfileOption<T extends string = string> = {
  value: T;
  label: string;
};

export type CompanyProfileInput = {
  companyName: string | null;
  countryRegion: CountryRegion;
  industry: Industry;
  companySize: CompanySize;
  respondentRole: RespondentRole;
  departmentFunction: DepartmentFunction | null;
  handlesSensitiveOrRegulatedData: SensitiveDataAnswer;
  mainAiConcerns: MainAiConcern[];
};

export type CompanyProfileFieldErrors = Partial<
  Record<keyof CompanyProfileInput | "form", string[]>
>;

export type CompanyProfileRawFormInput = {
  companyName: string;
  countryRegion: string;
  industry: string;
  companySize: string;
  respondentRole: string;
  departmentFunction: string;
  handlesSensitiveOrRegulatedData: string;
  mainAiConcerns: string[];
};

export type CompanyProfileFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: CompanyProfileFieldErrors;
  values?: CompanyProfileRawFormInput;
};

export const INITIAL_COMPANY_PROFILE_FORM_STATE: CompanyProfileFormState = {
  status: "idle",
};
