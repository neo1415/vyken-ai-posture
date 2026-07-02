import { LinkButton } from "@/components/ui/LinkButton";
import { ASSESSMENT_WIZARD_COPY } from "@/features/assessment-wizard/constants";
import { isValidPublicTokenFormat } from "@/lib/security/public-token";
import {
  getAssessmentRecommendationPreview,
  getPersistedRecommendationCounts,
} from "@/server/services/assessment-recommendations.service";
import {
  getAssessmentScoringPreview,
  getPersistedScoringCounts,
  scoreAssessmentSession,
} from "@/server/services/assessment-scoring.service";

type ResultsPlaceholderPageProps = {
  searchParams: Promise<{ session?: string; recompute?: string }>;
};

export default async function ResultsPlaceholderPage({
  searchParams,
}: ResultsPlaceholderPageProps) {
  const params = await searchParams;
  const sessionToken = params.session?.trim();
  const hasValidFormat = sessionToken && isValidPublicTokenFormat(sessionToken);

  const recompute = params.recompute === "1";
  const canScore = Boolean(hasValidFormat && sessionToken);

  const scoringResult =
    canScore && sessionToken
      ? recompute
        ? await scoreAssessmentSession(sessionToken)
        : await getAssessmentScoringPreview(sessionToken)
      : null;

  const recommendationResult =
    canScore && sessionToken && scoringResult
      ? recompute
        ? await getAssessmentRecommendationPreview(sessionToken)
        : await getAssessmentRecommendationPreview(sessionToken)
      : null;

  const persistedCounts =
    canScore && sessionToken
      ? await getPersistedScoringCounts(sessionToken)
      : null;

  const recommendationCounts =
    canScore && sessionToken
      ? await getPersistedRecommendationCounts(sessionToken)
      : null;

  const isValidSession = Boolean(scoringResult);

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
              ? "Your risk posture and recommended next steps are ready. The final results view will be built next."
              : "Assessment session or answers not found. Please start again."}
          </p>
        </div>

        <div className="vyken-card space-y-4 p-6 sm:p-8">
          {isValidSession ? (
            <>
              <p className="text-foreground text-sm leading-relaxed">
                This is a limited preview. It is framework-informed and based on
                provided answers and curated tool profiles. It is not a legal
                opinion, compliance certification, audit, or live scan.
              </p>

              {scoringResult ? (
                <div className="border-border bg-surface-muted space-y-2 rounded-lg border p-4">
                  <p className="text-foreground text-sm font-semibold">
                    Overall risk score:{" "}
                    <span className="font-bold tabular-nums">
                      {scoringResult.overallScore}/100
                    </span>
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Risk level:{" "}
                    <span className="text-foreground font-medium">
                      {scoringResult.overallRiskLevel}
                    </span>
                    {" • "}
                    Confidence:{" "}
                    <span className="text-foreground font-medium">
                      {scoringResult.confidenceLevel}
                    </span>
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Signals generated:{" "}
                    <span className="text-foreground font-medium">
                      {scoringResult.signals.length}
                    </span>
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Findings generated:{" "}
                    <span className="text-foreground font-medium">
                      {recommendationResult?.findings.length ??
                        recommendationCounts?.findingCount ??
                        0}
                    </span>
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Recommendations generated:{" "}
                    <span className="text-foreground font-medium">
                      {recommendationResult?.recommendations.length ??
                        recommendationCounts?.recommendationCount ??
                        0}
                    </span>
                  </p>
                  {persistedCounts ? (
                    <p className="text-muted-foreground text-xs">
                      Persisted score: {persistedCounts.hasScore ? "yes" : "no"}
                      ; persisted signals: {persistedCounts.signalCount}
                    </p>
                  ) : null}
                </div>
              ) : null}

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
