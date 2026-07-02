import { LinkButton } from "@/components/ui/LinkButton";
import { ASSESSMENT_WIZARD_COPY } from "@/features/assessment-wizard/constants";
import { isValidPublicTokenFormat } from "@/lib/security/public-token";
import { hasAssessmentAnswersForSession } from "@/server/repositories/assessment-answers.repository";
import { getAssessmentSessionByPublicToken } from "@/server/repositories/assessment-sessions.repository";

type ResultsPlaceholderPageProps = {
  searchParams: Promise<{ session?: string }>;
};

export default async function ResultsPlaceholderPage({
  searchParams,
}: ResultsPlaceholderPageProps) {
  const params = await searchParams;
  const sessionToken = params.session?.trim();
  const hasValidFormat = sessionToken && isValidPublicTokenFormat(sessionToken);

  const session =
    hasValidFormat && sessionToken
      ? await getAssessmentSessionByPublicToken(sessionToken)
      : null;

  const hasAnswers =
    session != null ? await hasAssessmentAnswersForSession(session.id) : false;

  const isValidSession = Boolean(session && hasAnswers);

  return (
    <div className="vyken-grid-bg vyken-radial-glow relative -mx-4 px-4 py-6 sm:-mx-6 sm:px-6 sm:py-10">
      <div className="relative mx-auto max-w-4xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-foreground text-xs font-bold tracking-[0.22em] uppercase">
            {ASSESSMENT_WIZARD_COPY.brandLabel}
          </p>
          <span className="vyken-pill">Step 4 of 5</span>
        </header>

        <div className="space-y-3">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Results preview comes next.
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {isValidSession
              ? "Your assessment answers were saved. Risk scoring will be calculated in the next module."
              : "Assessment session or answers not found. Please start again."}
          </p>
        </div>

        <div className="vyken-card space-y-4 p-6 sm:p-8">
          {isValidSession ? (
            <>
              <p className="text-foreground text-sm leading-relaxed">
                Scoring, risk signals, recommendations, and reports are not
                available yet. This placeholder confirms your wizard answers
                were persisted.
              </p>
              {sessionToken ? (
                <LinkButton
                  href={`/ai-risk-assessment/usage?session=${encodeURIComponent(sessionToken)}`}
                  variant="secondary"
                >
                  Back to assessment questions
                </LinkButton>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-foreground text-sm leading-relaxed">
                We could not find a valid assessment with saved answers. Start
                from the company profile step.
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
