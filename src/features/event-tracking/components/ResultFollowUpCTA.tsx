"use client";

import { useActionState } from "react";

import {
  requestReportEmailAction,
  requestReportEmailInitialState,
} from "@/features/event-tracking/actions";
import { RESULT_FOLLOW_UP_COPY } from "@/features/event-tracking/constants";
import { TrackedCTA } from "@/features/event-tracking/components/TrackedCTA";
import { resultCardClasses } from "@/features/results/components/result-ui";
import { Button } from "@/components/ui/Button";

type ResultFollowUpCTAProps = {
  publicToken: string;
  leadAlreadyCaptured: boolean;
};

export function ResultFollowUpCTA({
  publicToken,
  leadAlreadyCaptured,
}: ResultFollowUpCTAProps) {
  const [emailState, emailAction, emailPending] = useActionState(
    requestReportEmailAction,
    requestReportEmailInitialState,
  );

  return (
    <section
      className={resultCardClasses}
      aria-labelledby="follow-up-cta-title"
    >
      <h2
        id="follow-up-cta-title"
        className="text-foreground mb-2 text-lg font-semibold"
      >
        {RESULT_FOLLOW_UP_COPY.title}
      </h2>
      <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
        {RESULT_FOLLOW_UP_COPY.body}
      </p>

      <div className="flex flex-wrap gap-3">
        <TrackedCTA
          publicToken={publicToken}
          destination="request_review"
          sourcePage="results_follow_up"
          label={RESULT_FOLLOW_UP_COPY.requestFollowUpLabel}
          variant="primary"
          onAfterTrack={() => {
            document
              .getElementById("lead-capture-title")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />

        {leadAlreadyCaptured ? (
          <form action={emailAction} className="inline-flex">
            <input type="hidden" name="publicToken" value={publicToken} />
            <Button type="submit" variant="secondary" disabled={emailPending}>
              {emailPending
                ? "Sending…"
                : RESULT_FOLLOW_UP_COPY.emailReportLabel}
            </Button>
          </form>
        ) : null}

        <TrackedCTA
          publicToken={publicToken}
          destination="vyken_guard"
          sourcePage="results_follow_up"
          label={RESULT_FOLLOW_UP_COPY.governanceLabel}
        />
      </div>

      {emailState.message ? (
        <p
          className={
            emailState.status === "error"
              ? "text-danger mt-4 text-sm"
              : "text-muted-foreground mt-4 text-sm"
          }
          role="status"
        >
          {emailState.message}
        </p>
      ) : null}
    </section>
  );
}
