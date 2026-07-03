"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { submitCompanyProfile } from "@/features/company-profile/actions";
import {
  COMPANY_NAME_MAX_LENGTH,
  COMPANY_PROFILE_COPY,
  COMPANY_PROFILE_INTERNAL_STEP_COUNT,
  COMPANY_PROFILE_INTERNAL_STEPS,
  COMPANY_SIZE_OPTIONS,
  COUNTRY_REGION_OPTIONS,
  DEPARTMENT_FUNCTION_OPTIONS,
  INDUSTRY_OPTIONS,
  MAIN_AI_CONCERN_OPTIONS,
  RESPONDENT_ROLE_OPTIONS,
  SENSITIVE_DATA_HELPERS,
  SENSITIVE_DATA_OPTIONS,
} from "@/features/company-profile/constants";
import type { CompanyProfileRawFormInput } from "@/features/company-profile/types";
import {
  INITIAL_COMPANY_PROFILE_FORM_STATE,
  type CompanyProfileFormState,
} from "@/features/company-profile/types";

import { CompanyProfileCheckboxCard } from "./CompanyProfileCheckboxCard";
import { CompanyProfileOptionCard } from "./CompanyProfileOptionCard";
import { CompanyProfileProgress } from "./CompanyProfileProgress";
import { CompanyProfileSelect } from "./CompanyProfileSelect";
import { CompanyProfileStepFrame } from "./CompanyProfileStepFrame";
import { CompanyProfileTextInput } from "./CompanyProfileTextInput";
import { FormAlert } from "./FormError";

const EMPTY_VALUES: CompanyProfileRawFormInput = {
  companyName: "",
  countryRegion: "",
  industry: "",
  companySize: "",
  respondentRole: "",
  departmentFunction: "",
  handlesSensitiveOrRegulatedData: "",
  mainAiConcerns: [],
};

const FIELD_STEP_MAP: Record<string, number> = {
  companyName: 0,
  countryRegion: 0,
  industry: 1,
  companySize: 1,
  respondentRole: 2,
  departmentFunction: 2,
  handlesSensitiveOrRegulatedData: 3,
  mainAiConcerns: 4,
};

function firstServerError(
  fieldErrors: CompanyProfileFormState["fieldErrors"],
  field: string,
): string | undefined {
  return fieldErrors?.[field as keyof typeof fieldErrors]?.[0];
}

function validateClientStep(
  step: number,
  values: CompanyProfileRawFormInput,
): string | null {
  switch (step) {
    case 0:
      return values.countryRegion ? null : "Please choose a country or region.";
    case 1:
      if (!values.industry) return "Please choose an industry.";
      if (!values.companySize) return "Please choose a company size.";
      return null;
    case 2:
      return values.respondentRole ? null : "Please choose your role.";
    case 3:
      return values.handlesSensitiveOrRegulatedData
        ? null
        : "Please indicate whether you handle sensitive or regulated data.";
    case 4:
      if (values.mainAiConcerns.length === 0) {
        return "Select at least one main AI concern.";
      }
      if (values.mainAiConcerns.length > 5) {
        return "Select up to five main AI concerns.";
      }
      return null;
    default:
      return null;
  }
}

function HiddenFormFields({ values }: { values: CompanyProfileRawFormInput }) {
  return (
    <>
      <input type="hidden" name="companyName" value={values.companyName} />
      <input type="hidden" name="countryRegion" value={values.countryRegion} />
      <input type="hidden" name="industry" value={values.industry} />
      <input type="hidden" name="companySize" value={values.companySize} />
      <input
        type="hidden"
        name="respondentRole"
        value={values.respondentRole}
      />
      <input
        type="hidden"
        name="departmentFunction"
        value={values.departmentFunction}
      />
      <input
        type="hidden"
        name="handlesSensitiveOrRegulatedData"
        value={values.handlesSensitiveOrRegulatedData}
      />
      {values.mainAiConcerns.map((concern) => (
        <input
          key={concern}
          type="hidden"
          name="mainAiConcerns"
          value={concern}
        />
      ))}
    </>
  );
}

export function CompanyProfileWizard() {
  const [state, formAction, isPending] = useActionState(
    submitCompanyProfile,
    INITIAL_COMPANY_PROFILE_FORM_STATE,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] =
    useState<CompanyProfileRawFormInput>(EMPTY_VALUES);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (state.status === "error" && state.values) {
      setValues(state.values);
      const errorField = state.fieldErrors
        ? Object.keys(state.fieldErrors).find((key) => key !== "form")
        : undefined;
      if (errorField && FIELD_STEP_MAP[errorField] !== undefined) {
        setCurrentStep(FIELD_STEP_MAP[errorField]);
      }
    }
  }, [state]);

  const stepMeta = COMPANY_PROFILE_INTERNAL_STEPS[currentStep];
  const isLastStep = currentStep === COMPANY_PROFILE_INTERNAL_STEP_COUNT - 1;
  const concernCount = values.mainAiConcerns.length;
  const maxConcernsReached = concernCount >= 5;

  const patchValues = (partial: Partial<CompanyProfileRawFormInput>) => {
    setValues((prev) => ({ ...prev, ...partial }));
    setClientError(null);
  };

  const goNext = () => {
    const error = validateClientStep(currentStep, values);
    if (error) {
      setClientError(error);
      return;
    }
    setCurrentStep((step) =>
      Math.min(step + 1, COMPANY_PROFILE_INTERNAL_STEP_COUNT - 1),
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setClientError(null);
    setCurrentStep((step) => Math.max(step - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleConcern = (value: string, checked: boolean) => {
    setValues((prev) => {
      const next = new Set(prev.mainAiConcerns);
      if (checked) {
        if (next.size >= 5) return prev;
        next.add(value);
      } else {
        next.delete(value);
      }
      return { ...prev, mainAiConcerns: [...next] };
    });
    setClientError(null);
  };

  return (
    <div className="space-y-8">
      <CompanyProfileProgress
        currentStep={currentStep}
        totalSteps={COMPANY_PROFILE_INTERNAL_STEP_COUNT}
      />

      <form action={formAction} className="space-y-6" noValidate>
        <HiddenFormFields values={values} />

        {state.status === "error" && state.message ? (
          <FormAlert message={state.message} />
        ) : null}

        {clientError ? <FormAlert message={clientError} /> : null}

        <CompanyProfileStepFrame
          stepKey={stepMeta.id}
          title={stepMeta.title}
          description={stepMeta.description}
        >
          {currentStep === 0 ? (
            <div className="space-y-6">
              <CompanyProfileTextInput
                id="companyName"
                label="Company name"
                optional
                value={values.companyName}
                onChange={(companyName) => patchValues({ companyName })}
                maxLength={COMPANY_NAME_MAX_LENGTH}
                error={
                  firstServerError(state.fieldErrors, "companyName") ??
                  undefined
                }
                placeholder="Your organization (optional)"
              />
              <CompanyProfileSelect
                id="countryRegion"
                label="Country / region"
                required
                value={values.countryRegion}
                onChange={(countryRegion) => patchValues({ countryRegion })}
                options={COUNTRY_REGION_OPTIONS}
                placeholder="Choose country or region"
                error={
                  firstServerError(state.fieldErrors, "countryRegion") ??
                  undefined
                }
              />
              <p className="text-muted-foreground text-xs">
                {COMPANY_PROFILE_COPY.confidentialityNote}
              </p>
            </div>
          ) : null}

          {currentStep === 1 ? (
            <div className="space-y-8">
              <fieldset className="space-y-3 border-0 p-0">
                <legend className="text-foreground mb-3 text-sm font-medium">
                  Industry
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {INDUSTRY_OPTIONS.map((option) => (
                    <CompanyProfileOptionCard
                      key={option.value}
                      id={`industry-${option.value}`}
                      name="industry-ui"
                      value={option.value}
                      label={option.label}
                      checked={values.industry === option.value}
                      onChange={(industry) => patchValues({ industry })}
                    />
                  ))}
                </div>
                {firstServerError(state.fieldErrors, "industry") ? (
                  <p role="alert" className="text-danger text-sm">
                    {firstServerError(state.fieldErrors, "industry")}
                  </p>
                ) : null}
              </fieldset>
              <fieldset className="space-y-3 border-0 p-0">
                <legend className="text-foreground mb-3 text-sm font-medium">
                  Company size
                </legend>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {COMPANY_SIZE_OPTIONS.map((option) => (
                    <CompanyProfileOptionCard
                      key={option.value}
                      id={`companySize-${option.value}`}
                      name="companySize-ui"
                      value={option.value}
                      label={option.label}
                      checked={values.companySize === option.value}
                      onChange={(companySize) => patchValues({ companySize })}
                    />
                  ))}
                </div>
                {firstServerError(state.fieldErrors, "companySize") ? (
                  <p role="alert" className="text-danger text-sm">
                    {firstServerError(state.fieldErrors, "companySize")}
                  </p>
                ) : null}
              </fieldset>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-6">
              <fieldset className="space-y-3 border-0 p-0">
                <legend className="text-foreground mb-3 text-sm font-medium">
                  Your role
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {RESPONDENT_ROLE_OPTIONS.map((option) => (
                    <CompanyProfileOptionCard
                      key={option.value}
                      id={`role-${option.value}`}
                      name="respondentRole-ui"
                      value={option.value}
                      label={option.label}
                      checked={values.respondentRole === option.value}
                      onChange={(respondentRole) =>
                        patchValues({ respondentRole })
                      }
                    />
                  ))}
                </div>
                {firstServerError(state.fieldErrors, "respondentRole") ? (
                  <p role="alert" className="text-danger text-sm">
                    {firstServerError(state.fieldErrors, "respondentRole")}
                  </p>
                ) : null}
              </fieldset>
              <CompanyProfileSelect
                id="departmentFunction"
                label="Department / function"
                optional
                value={values.departmentFunction}
                onChange={(departmentFunction) =>
                  patchValues({ departmentFunction })
                }
                options={DEPARTMENT_FUNCTION_OPTIONS}
                placeholder="Choose department (optional)"
                error={
                  firstServerError(state.fieldErrors, "departmentFunction") ??
                  undefined
                }
              />
            </div>
          ) : null}

          {currentStep === 3 ? (
            <fieldset className="space-y-3 border-0 p-0">
              <legend className="text-foreground mb-3 text-sm font-medium">
                Does your organization handle sensitive or regulated data?
              </legend>
              <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-3">
                {SENSITIVE_DATA_OPTIONS.map((option) => (
                  <CompanyProfileOptionCard
                    key={option.value}
                    id={`sensitive-${option.value}`}
                    name="sensitive-ui"
                    value={option.value}
                    label={option.label}
                    description={SENSITIVE_DATA_HELPERS[option.value]}
                    checked={
                      values.handlesSensitiveOrRegulatedData === option.value
                    }
                    onChange={(handlesSensitiveOrRegulatedData) =>
                      patchValues({ handlesSensitiveOrRegulatedData })
                    }
                  />
                ))}
              </div>
              {firstServerError(
                state.fieldErrors,
                "handlesSensitiveOrRegulatedData",
              ) ? (
                <p role="alert" className="text-danger text-sm">
                  {firstServerError(
                    state.fieldErrors,
                    "handlesSensitiveOrRegulatedData",
                  )}
                </p>
              ) : null}
            </fieldset>
          ) : null}

          {currentStep === 4 ? (
            <fieldset className="space-y-3 border-0 p-0">
              <legend className="text-foreground mb-1 text-sm font-medium">
                What are your main AI concerns right now?
              </legend>
              <p className="text-muted-foreground mb-4 text-xs">
                {concernCount} of 5 selected
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {MAIN_AI_CONCERN_OPTIONS.map((option) => {
                  const isChecked = values.mainAiConcerns.includes(
                    option.value,
                  );
                  return (
                    <CompanyProfileCheckboxCard
                      key={option.value}
                      id={`concern-${option.value}`}
                      name="mainAiConcerns-ui"
                      value={option.value}
                      label={option.label}
                      checked={isChecked}
                      disabled={!isChecked && maxConcernsReached}
                      onChange={toggleConcern}
                    />
                  );
                })}
              </div>
              {firstServerError(state.fieldErrors, "mainAiConcerns") ? (
                <p role="alert" className="text-danger text-sm">
                  {firstServerError(state.fieldErrors, "mainAiConcerns")}
                </p>
              ) : null}
            </fieldset>
          ) : null}
        </CompanyProfileStepFrame>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={goBack}
            disabled={currentStep === 0 || isPending}
            className="sm:min-w-32"
          >
            {COMPANY_PROFILE_COPY.backLabel}
          </Button>

          {isLastStep ? (
            <Button type="submit" disabled={isPending} className="sm:min-w-48">
              {isPending ? "Saving…" : COMPANY_PROFILE_COPY.submitLabel}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={goNext}
              disabled={isPending}
              className="sm:min-w-40"
            >
              {COMPANY_PROFILE_COPY.continueLabel}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
