import type { ReactNode } from "react";

import { LinkButton } from "@/components/ui/LinkButton";
import { AssessmentWizard } from "@/features/assessment-wizard/components/AssessmentWizard";
import { ASSESSMENT_WIZARD_COPY } from "@/features/assessment-wizard/constants";
import { isValidPublicTokenFormat } from "@/lib/security/public-token";
import { loadAssessmentWizardContext } from "@/server/services/assessment-wizard.service";

type UsageWizardPageProps = {
  searchParams: Promise<{ session?: string }>;
};

export default async function UsageWizardPage({
  searchParams,
}: UsageWizardPageProps) {
  const params = await searchParams;
  const sessionToken = params.session?.trim();

  if (!sessionToken || !isValidPublicTokenFormat(sessionToken)) {
    return (
      <WizardShell>
        <ErrorPanel message="Assessment session not found. Please start again from the company profile step." />
      </WizardShell>
    );
  }

  const context = await loadAssessmentWizardContext(sessionToken);

  if (!context) {
    return (
      <WizardShell>
        <ErrorPanel message="We could not load your assessment session. Complete the company profile and tool selection steps first." />
      </WizardShell>
    );
  }

  return (
    <WizardShell>
      <div className="space-y-3">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          {ASSESSMENT_WIZARD_COPY.pageTitle}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
          {ASSESSMENT_WIZARD_COPY.pageSubtitle}
        </p>
      </div>

      <AssessmentWizard
        sessionToken={sessionToken}
        toolContext={context.toolContext}
      />
    </WizardShell>
  );
}

function WizardShell({ children }: { children: ReactNode }) {
  return (
    <div className="vyken-grid-bg vyken-radial-glow relative -mx-4 px-4 py-6 sm:-mx-6 sm:px-6 sm:py-10">
      <div className="relative mx-auto max-w-4xl space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-foreground text-xs font-bold tracking-[0.22em] uppercase">
            {ASSESSMENT_WIZARD_COPY.brandLabel}
          </p>
          <span className="vyken-pill">
            {ASSESSMENT_WIZARD_COPY.freeToolLabel}
          </span>
        </header>
        {children}
      </div>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="vyken-card space-y-4 p-6 sm:p-8">
      <p className="text-foreground text-sm leading-relaxed">{message}</p>
      <LinkButton href="/ai-risk-assessment" variant="secondary">
        {ASSESSMENT_WIZARD_COPY.startOverLabel}
      </LinkButton>
    </div>
  );
}
