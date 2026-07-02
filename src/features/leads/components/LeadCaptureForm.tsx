"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { submitLeadCapture } from "@/features/leads/actions";
import {
  COMPANY_NAME_MAX_LENGTH,
  FOLLOW_UP_INTEREST_OPTIONS,
  FULL_NAME_MAX_LENGTH,
  LEAD_CAPTURE_COPY,
  LEAD_CONSENT_TEXT,
  ROLE_TITLE_MAX_LENGTH,
  WORK_EMAIL_MAX_LENGTH,
} from "@/features/leads/constants";
import {
  INITIAL_LEAD_CAPTURE_FORM_STATE,
  type LeadCaptureFormState,
  type LeadCaptureRawFormInput,
} from "@/features/leads/types";
import { cn } from "@/lib/utils/cn";

import { resultCardClasses } from "@/features/results/components/result-ui";

type LeadCaptureFormProps = {
  publicToken: string;
  leadAlreadyCaptured: boolean;
};

const EMPTY_VALUES: LeadCaptureRawFormInput = {
  publicToken: "",
  workEmail: "",
  fullName: "",
  companyName: "",
  roleTitle: "",
  followUpInterest: "",
  consent: false,
};

function fieldError(
  fieldErrors: LeadCaptureFormState["fieldErrors"],
  field: keyof LeadCaptureRawFormInput,
): string | undefined {
  return fieldErrors?.[field]?.[0];
}

export function LeadCaptureForm({
  publicToken,
  leadAlreadyCaptured,
}: LeadCaptureFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitLeadCapture,
    INITIAL_LEAD_CAPTURE_FORM_STATE,
  );
  const [values, setValues] = useState<LeadCaptureRawFormInput>({
    ...EMPTY_VALUES,
    publicToken,
  });

  useEffect(() => {
    if (state.status === "error" && state.values) {
      setValues(state.values);
    }
  }, [state]);

  const showSuccess = leadAlreadyCaptured || state.status === "success";

  if (showSuccess) {
    return (
      <section
        className={resultCardClasses}
        aria-labelledby="lead-capture-title"
      >
        <h2
          id="lead-capture-title"
          className="text-foreground mb-2 text-lg font-semibold"
        >
          {LEAD_CAPTURE_COPY.title}
        </h2>
        <p role="status" className="text-foreground text-sm leading-relaxed">
          {state.message ?? LEAD_CAPTURE_COPY.successMessage}
        </p>
      </section>
    );
  }

  return (
    <section className={resultCardClasses} aria-labelledby="lead-capture-title">
      <div className="space-y-2">
        <h2
          id="lead-capture-title"
          className="text-foreground text-lg font-semibold"
        >
          {LEAD_CAPTURE_COPY.title}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {LEAD_CAPTURE_COPY.body}
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {LEAD_CAPTURE_COPY.resultVisibleNote}
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-5" noValidate>
        <input type="hidden" name="publicToken" value={publicToken} />

        {state.status === "error" && state.message ? (
          <p role="alert" className="text-danger text-sm">
            {state.message}
          </p>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="workEmail"
            className="text-foreground block text-sm font-medium"
          >
            {LEAD_CAPTURE_COPY.workEmailLabel}
          </label>
          <input
            id="workEmail"
            name="workEmail"
            type="email"
            required
            autoComplete="email"
            maxLength={WORK_EMAIL_MAX_LENGTH}
            value={values.workEmail}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                workEmail: event.target.value,
              }))
            }
            aria-invalid={
              fieldError(state.fieldErrors, "workEmail") ? true : undefined
            }
            aria-describedby={
              fieldError(state.fieldErrors, "workEmail")
                ? "workEmail-error"
                : undefined
            }
            className={cn(
              "vyken-input",
              fieldError(state.fieldErrors, "workEmail") &&
                "vyken-input--error",
            )}
          />
          {fieldError(state.fieldErrors, "workEmail") ? (
            <p
              id="workEmail-error"
              role="alert"
              className="text-danger text-sm"
            >
              {fieldError(state.fieldErrors, "workEmail")}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="fullName"
            className="text-foreground block text-sm font-medium"
          >
            {LEAD_CAPTURE_COPY.fullNameLabel}
            <span className="text-muted-foreground ml-1 font-normal">
              (optional)
            </span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            maxLength={FULL_NAME_MAX_LENGTH}
            value={values.fullName}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                fullName: event.target.value,
              }))
            }
            aria-invalid={
              fieldError(state.fieldErrors, "fullName") ? true : undefined
            }
            aria-describedby={
              fieldError(state.fieldErrors, "fullName")
                ? "fullName-error"
                : undefined
            }
            className={cn(
              "vyken-input",
              fieldError(state.fieldErrors, "fullName") && "vyken-input--error",
            )}
          />
          {fieldError(state.fieldErrors, "fullName") ? (
            <p id="fullName-error" role="alert" className="text-danger text-sm">
              {fieldError(state.fieldErrors, "fullName")}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="companyName"
            className="text-foreground block text-sm font-medium"
          >
            {LEAD_CAPTURE_COPY.companyNameLabel}
            <span className="text-muted-foreground ml-1 font-normal">
              (optional)
            </span>
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            autoComplete="organization"
            maxLength={COMPANY_NAME_MAX_LENGTH}
            value={values.companyName}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                companyName: event.target.value,
              }))
            }
            aria-invalid={
              fieldError(state.fieldErrors, "companyName") ? true : undefined
            }
            aria-describedby={
              fieldError(state.fieldErrors, "companyName")
                ? "companyName-error"
                : undefined
            }
            className={cn(
              "vyken-input",
              fieldError(state.fieldErrors, "companyName") &&
                "vyken-input--error",
            )}
          />
          {fieldError(state.fieldErrors, "companyName") ? (
            <p
              id="companyName-error"
              role="alert"
              className="text-danger text-sm"
            >
              {fieldError(state.fieldErrors, "companyName")}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="roleTitle"
            className="text-foreground block text-sm font-medium"
          >
            {LEAD_CAPTURE_COPY.roleTitleLabel}
            <span className="text-muted-foreground ml-1 font-normal">
              (optional)
            </span>
          </label>
          <input
            id="roleTitle"
            name="roleTitle"
            type="text"
            autoComplete="organization-title"
            maxLength={ROLE_TITLE_MAX_LENGTH}
            value={values.roleTitle}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                roleTitle: event.target.value,
              }))
            }
            aria-invalid={
              fieldError(state.fieldErrors, "roleTitle") ? true : undefined
            }
            aria-describedby={
              fieldError(state.fieldErrors, "roleTitle")
                ? "roleTitle-error"
                : undefined
            }
            className={cn(
              "vyken-input",
              fieldError(state.fieldErrors, "roleTitle") &&
                "vyken-input--error",
            )}
          />
          {fieldError(state.fieldErrors, "roleTitle") ? (
            <p
              id="roleTitle-error"
              role="alert"
              className="text-danger text-sm"
            >
              {fieldError(state.fieldErrors, "roleTitle")}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="followUpInterest"
            className="text-foreground block text-sm font-medium"
          >
            {LEAD_CAPTURE_COPY.followUpInterestLabel}
            <span className="text-muted-foreground ml-1 font-normal">
              (optional)
            </span>
          </label>
          <select
            id="followUpInterest"
            name="followUpInterest"
            value={values.followUpInterest}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                followUpInterest: event.target.value,
              }))
            }
            aria-invalid={
              fieldError(state.fieldErrors, "followUpInterest")
                ? true
                : undefined
            }
            aria-describedby={
              fieldError(state.fieldErrors, "followUpInterest")
                ? "followUpInterest-error"
                : undefined
            }
            className={cn(
              "vyken-input",
              fieldError(state.fieldErrors, "followUpInterest") &&
                "vyken-input--error",
            )}
          >
            <option value="">
              {LEAD_CAPTURE_COPY.followUpInterestPlaceholder}
            </option>
            {FOLLOW_UP_INTEREST_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError(state.fieldErrors, "followUpInterest") ? (
            <p
              id="followUpInterest-error"
              role="alert"
              className="text-danger text-sm"
            >
              {fieldError(state.fieldErrors, "followUpInterest")}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              name="consent"
              checked={values.consent}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  consent: event.target.checked,
                }))
              }
              aria-invalid={
                fieldError(state.fieldErrors, "consent") ? true : undefined
              }
              aria-describedby={
                fieldError(state.fieldErrors, "consent")
                  ? "consent-error"
                  : "consent-label"
              }
              className="border-border mt-0.5 size-4 shrink-0 rounded"
            />
            <span id="consent-label">{LEAD_CONSENT_TEXT}</span>
          </label>
          {fieldError(state.fieldErrors, "consent") ? (
            <p id="consent-error" role="alert" className="text-danger text-sm">
              {fieldError(state.fieldErrors, "consent")}
            </p>
          ) : null}
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">
          {LEAD_CAPTURE_COPY.privacyNote}
        </p>

        <Button type="submit" disabled={isPending}>
          {isPending
            ? LEAD_CAPTURE_COPY.submittingLabel
            : LEAD_CAPTURE_COPY.submitLabel}
        </Button>
      </form>
    </section>
  );
}
