import { LinkButton } from "@/components/ui/LinkButton";
import { COMPANY_PROFILE_COPY } from "@/features/company-profile/constants";
import { isValidPublicTokenFormat } from "@/lib/security/public-token";
import { getAssessmentSessionByPublicToken } from "@/server/repositories/assessment-sessions.repository";

type ToolsPlaceholderPageProps = {
  searchParams: Promise<{ session?: string }>;
};

export default async function ToolsPlaceholderPage({
  searchParams,
}: ToolsPlaceholderPageProps) {
  const params = await searchParams;
  const sessionToken = params.session?.trim();

  const hasValidFormat = sessionToken && isValidPublicTokenFormat(sessionToken);

  const session =
    hasValidFormat && sessionToken
      ? await getAssessmentSessionByPublicToken(sessionToken)
      : null;

  const isValidSession = Boolean(session);

  return (
    <div className="vyken-grid-bg vyken-radial-glow relative -mx-4 px-4 py-6 sm:-mx-6 sm:px-6 sm:py-10">
      <div className="relative mx-auto max-w-4xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-foreground text-xs font-bold tracking-[0.22em] uppercase">
            {COMPANY_PROFILE_COPY.brandLabel}
          </p>
          <span className="vyken-pill">Step 2 of 4</span>
        </header>

        <div className="space-y-3">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Next: select AI tools
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {isValidSession
              ? "Your company profile was saved. Tool selection will be built in Module 6."
              : "Assessment session not found. Please start again."}
          </p>
        </div>

        <div className="vyken-card space-y-4 p-6 sm:p-8">
          {isValidSession ? (
            <>
              <p className="text-foreground text-sm leading-relaxed">
                Tool selection comes next. You will choose which workplace AI
                tools your organization uses from our curated database. Scoring,
                recommendations, and reports are not available yet.
              </p>
              <p className="text-muted-foreground text-xs">
                Session reference received. Module 6 will use this to continue
                your assessment.
              </p>
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
