import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { RiskChip } from "@/components/ui/RiskChip";
import { formatAdminRiskLevel } from "@/features/admin/formatters";
import { formatConfidenceLevel } from "@/features/results/formatters";
import type { AdminLeadDetail } from "@/features/admin/types";

type AdminRiskSummaryCardProps = {
  assessment: AdminLeadDetail["assessment"];
};

export function AdminRiskSummaryCard({
  assessment,
}: AdminRiskSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk summary</CardTitle>
        <CardDescription>
          Score, risk level, confidence, and category breakdown.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground text-xs uppercase">Score</dt>
            <dd className="text-foreground text-2xl font-semibold">
              {assessment.overallScore ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase">Risk</dt>
            <dd className="pt-1">
              {assessment.riskLevel ? (
                <RiskChip
                  level={
                    assessment.riskLevel as
                      "low" | "moderate" | "high" | "critical" | "unknown"
                  }
                  label={formatAdminRiskLevel(assessment.riskLevel)}
                />
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase">
              Confidence
            </dt>
            <dd className="text-foreground pt-1 text-sm">
              {assessment.confidenceLevel
                ? formatConfidenceLevel(
                    assessment.confidenceLevel as "low" | "medium" | "high",
                  )
                : "—"}
            </dd>
          </div>
        </dl>

        {assessment.categoryScores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-muted-foreground border-border border-b">
                <tr>
                  <th className="py-2 pr-4 font-medium" scope="col">
                    Category
                  </th>
                  <th className="py-2 pr-4 font-medium" scope="col">
                    Score
                  </th>
                  <th className="py-2 font-medium" scope="col">
                    Risk
                  </th>
                </tr>
              </thead>
              <tbody>
                {assessment.categoryScores.map((category) => (
                  <tr
                    key={category.label}
                    className="border-border border-b last:border-b-0"
                  >
                    <td className="py-2 pr-4">{category.label}</td>
                    <td className="py-2 pr-4">{category.score}</td>
                    <td className="py-2">
                      {formatAdminRiskLevel(category.riskLevel)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Category scores are not available for this assessment.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
