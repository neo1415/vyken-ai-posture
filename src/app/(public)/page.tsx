import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CTAGroup } from "@/components/ui/CTAGroup";
import { LinkButton } from "@/components/ui/LinkButton";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { RiskChip } from "@/components/ui/RiskChip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stepper } from "@/components/ui/Stepper";
import { ToolCard } from "@/components/ui/ToolCard";
import { PlaceholderCard } from "@/components/shared/PlaceholderCard";
import { APP_DESCRIPTION } from "@/lib/constants/app";

const previewSteps = [
  { id: "context", label: "Company", status: "complete" as const },
  { id: "tools", label: "Tools", status: "current" as const },
  { id: "usage", label: "Usage", status: "upcoming" as const },
  { id: "results", label: "Results", status: "upcoming" as const },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Vyken"
        title="Vyken AI Risk Assessment Hub"
        description={`${APP_DESCRIPTION} Design system preview only. Assessment functionality will be implemented in later modules.`}
        actions={
          <CTAGroup>
            <LinkButton href="/ai-risk-assessment" size="sm">
              Assessment placeholder
            </LinkButton>
          </CTAGroup>
        }
      />

      <div className="flex flex-wrap gap-2">
        <RiskChip level="low" />
        <RiskChip level="moderate" />
        <RiskChip level="high" />
        <RiskChip level="critical" />
        <RiskChip level="unknown" />
      </div>

      <PlaceholderCard
        title="Foundation ready"
        description="Reusable UI primitives are in place for the landing page, wizard, results, and admin views. No scoring, forms, or email capture yet."
      >
        <CTAGroup>
          <LinkButton href="/ai-risk-assessment">
            View assessment shell
          </LinkButton>
          <LinkButton href="/admin" variant="outline">
            Admin shell
          </LinkButton>
        </CTAGroup>
      </PlaceholderCard>

      <Card>
        <CardHeader>
          <CardTitle>Component preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Stepper steps={previewSteps} label="Wizard step preview" />
          <ProgressIndicator value={35} label="Preview progress (static)" />
          <div className="grid gap-4 sm:grid-cols-2">
            <ToolCard
              name="Example Assistant"
              category="Visual preview"
              description="Illustrative card only — not a real vendor profile."
            />
            <ToolCard
              name="Example Copilot"
              category="Visual preview"
              selected
              confidenceLabel="Preview"
            />
          </div>
          <Badge variant="info">Design system module</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
