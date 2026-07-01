import { LinkButton } from "@/components/ui/LinkButton";
import { ToolSelectorWizard } from "@/features/tool-selector/components/ToolSelectorWizard";
import { TOOL_SELECTOR_COPY } from "@/features/tool-selector/constants";
import { isValidPublicTokenFormat } from "@/lib/security/public-token";
import { hasAssessmentSessionWithCompanyProfile } from "@/server/repositories/assessment-sessions.repository";
import { listAssessmentToolOptions } from "@/server/services/tool-profiles.service";

type ToolSelectorPageProps = {
  searchParams: Promise<{ session?: string }>;
};

export default async function ToolSelectorPage({
  searchParams,
}: ToolSelectorPageProps) {
  const params = await searchParams;
  const sessionToken = params.session?.trim();

  if (!sessionToken || !isValidPublicTokenFormat(sessionToken)) {
    return (
      <ToolSelectorShell>
        <ErrorPanel message="Assessment session not found. Please start again from the company profile step." />
      </ToolSelectorShell>
    );
  }

  const hasValidSession =
    await hasAssessmentSessionWithCompanyProfile(sessionToken);

  if (!hasValidSession) {
    return (
      <ToolSelectorShell>
        <ErrorPanel message="Assessment session not found. Please start again from the company profile step." />
      </ToolSelectorShell>
    );
  }

  const tools = await listAssessmentToolOptions();

  return (
    <ToolSelectorShell>
      <div className="space-y-3">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          {TOOL_SELECTOR_COPY.pageTitle}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
          {TOOL_SELECTOR_COPY.supportingCopy}
        </p>
      </div>

      <ToolSelectorWizard sessionToken={sessionToken} tools={tools} />
    </ToolSelectorShell>
  );
}

function ToolSelectorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="vyken-grid-bg vyken-radial-glow relative -mx-4 px-4 py-6 sm:-mx-6 sm:px-6 sm:py-10">
      <div className="relative mx-auto max-w-4xl space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-foreground text-xs font-bold tracking-[0.22em] uppercase">
            {TOOL_SELECTOR_COPY.brandLabel}
          </p>
          <span className="vyken-pill">{TOOL_SELECTOR_COPY.freeToolLabel}</span>
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
        {TOOL_SELECTOR_COPY.startOverLabel}
      </LinkButton>
    </div>
  );
}
