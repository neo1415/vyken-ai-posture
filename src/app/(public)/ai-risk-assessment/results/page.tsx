import { LinkButton } from "@/components/ui/LinkButton";
import { LeadCaptureCard } from "@/features/leads/components/LeadCaptureCard";
import { CategoryScoreGrid } from "@/features/results/components/CategoryScoreGrid";
import { FindingsList } from "@/features/results/components/FindingsList";
import { RecommendationsList } from "@/features/results/components/RecommendationsList";
import { ResultCaveats } from "@/features/results/components/ResultCaveats";
import { ResultHero } from "@/features/results/components/ResultHero";
import { RiskScoreCard } from "@/features/results/components/RiskScoreCard";
import { RESULT_PAGE_COPY } from "@/features/results/constants";
import { getAssessmentResult } from "@/server/services/assessment-result.service";
import { hasLeadForAssessmentSession } from "@/server/services/lead-capture.service";

type ResultsPageProps = {
  searchParams: Promise<{ session?: string }>;
};

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const sessionToken = params.session?.trim();
  const result =
    sessionToken != null && sessionToken.length > 0
      ? await getAssessmentResult(sessionToken)
      : null;

  const leadAlreadyCaptured =
    sessionToken != null && sessionToken.length > 0
      ? await hasLeadForAssessmentSession(sessionToken)
      : false;

  if (!result) {
    return (
      <div className="vyken-grid-bg vyken-radial-glow relative -mx-4 px-4 py-6 sm:-mx-6 sm:px-6 sm:py-10">
        <div className="relative mx-auto max-w-3xl space-y-6">
          <p className="text-foreground text-xs font-bold tracking-[0.22em] uppercase">
            {RESULT_PAGE_COPY.brandLabel}
          </p>
          <div className="vyken-card space-y-4 p-6 sm:p-8">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              {RESULT_PAGE_COPY.missingSessionTitle}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {RESULT_PAGE_COPY.missingSessionBody}
            </p>
            <LinkButton href="/ai-risk-assessment" variant="secondary">
              {RESULT_PAGE_COPY.startAssessmentLabel}
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vyken-grid-bg vyken-radial-glow relative -mx-4 px-4 py-6 sm:-mx-6 sm:px-6 sm:py-10">
      <div className="relative mx-auto max-w-5xl space-y-8">
        <ResultHero summary={result.summary} />
        <RiskScoreCard summary={result.summary} />
        <CategoryScoreGrid categories={result.categoryScores} />
        <FindingsList findings={result.findings} />
        <RecommendationsList recommendations={result.recommendations} />
        <ResultCaveats summaryCaveats={result.summary.caveats} />
        <LeadCaptureCard
          publicToken={result.publicToken}
          leadAlreadyCaptured={leadAlreadyCaptured}
        />

        <div className="flex flex-wrap gap-3">
          <LinkButton
            href={`/ai-risk-assessment/usage?session=${encodeURIComponent(result.publicToken)}`}
            variant="secondary"
          >
            {RESULT_PAGE_COPY.backToQuestionsLabel}
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
