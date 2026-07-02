import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";

import { ASSESSMENT_WIZARD_COPY } from "../constants";

export type AssessmentNavigationProps = {
  sessionToken: string;
  isFirstSection: boolean;
  isLastSection: boolean;
  isPending: boolean;
  onBack: () => void;
  onNext: () => void;
};

export function AssessmentNavigation({
  sessionToken,
  isFirstSection,
  isLastSection,
  isPending,
  onBack,
  onNext,
}: AssessmentNavigationProps) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      {isFirstSection ? (
        <LinkButton
          href={`/ai-risk-assessment/tools?session=${encodeURIComponent(sessionToken)}`}
          variant="ghost"
          size="sm"
        >
          {ASSESSMENT_WIZARD_COPY.backToToolsLabel}
        </LinkButton>
      ) : (
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          {ASSESSMENT_WIZARD_COPY.backLabel}
        </Button>
      )}
      <Button
        type={isLastSection ? "submit" : "button"}
        onClick={isLastSection ? undefined : onNext}
        disabled={isPending}
      >
        {isPending
          ? "Saving..."
          : isLastSection
            ? ASSESSMENT_WIZARD_COPY.submitLabel
            : ASSESSMENT_WIZARD_COPY.nextLabel}
      </Button>
    </div>
  );
}
