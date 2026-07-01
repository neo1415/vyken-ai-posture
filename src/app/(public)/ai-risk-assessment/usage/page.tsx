import { LinkButton } from "@/components/ui/LinkButton";
import { TOOL_SELECTOR_COPY } from "@/features/tool-selector/constants";
import { isValidPublicTokenFormat } from "@/lib/security/public-token";
import { hasAssessmentSessionWithCompanyProfile } from "@/server/repositories/assessment-sessions.repository";

type UsagePlaceholderPageProps = {
  searchParams: Promise<{ session?: string }>;
};

export default async function UsagePlaceholderPage({
  searchParams,
}: UsagePlaceholderPageProps) {
  const params = await searchParams;
  const sessionToken = params.session?.trim();
  const hasValidFormat = sessionToken && isValidPublicTokenFormat(sessionToken);

  const isValidSession =
    hasValidFormat && sessionToken
      ? await hasAssessmentSessionWithCompanyProfile(sessionToken)
      : false;

  return (
    <div className="vyken-grid-bg vyken-radial-glow relative -mx-4 px-4 py-6 sm:-mx-6 sm:px-6 sm:py-10">
      <div className="relative mx-auto max-w-4xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-foreground text-xs font-bold tracking-[0.22em] uppercase">
            {TOOL_SELECTOR_COPY.brandLabel}
          </p>
          <span className="vyken-pill">Step 3 of 5</span>
        </header>

        <div className="space-y-3">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Next: usage and data exposure
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {isValidSession
              ? "Your tool selections were saved. Usage and governance questions will be built in Module 7."
              : "Assessment session not found. Please start again."}
          </p>
        </div>

        <div className="vyken-card space-y-4 p-6 sm:p-8">
          {isValidSession ? (
            <>
              <p className="text-foreground text-sm leading-relaxed">
                This step will be implemented in Module 7. Scoring,
                recommendations, and reports are not available yet.
              </p>
              {sessionToken ? (
                <LinkButton
                  href={`/ai-risk-assessment/tools?session=${encodeURIComponent(sessionToken)}`}
                  variant="secondary"
                >
                  Back to tool selection
                </LinkButton>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-foreground text-sm leading-relaxed">
                We could not find a valid assessment session. Start from the
                company profile step to begin a new assessment.
              </p>
              <LinkButton href="/ai-risk-assessment" variant="secondary">
                Start assessment
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
