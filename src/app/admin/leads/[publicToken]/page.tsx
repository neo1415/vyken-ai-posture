import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminAccessGate } from "@/features/admin/components/AdminAccessGate";
import { AdminEmailEventsTable } from "@/features/admin/components/AdminEmailEventsTable";
import { AdminLeadActions } from "@/features/admin/components/AdminLeadActions";
import { AdminLeadStatusChip } from "@/features/admin/components/AdminLeadStatusChip";
import { AdminRiskSummaryCard } from "@/features/admin/components/AdminRiskSummaryCard";
import {
  formatAdminCompanySize,
  formatAdminConcernList,
  formatAdminCountryRegion,
  formatAdminIndustry,
  formatAdminPriority,
  formatEmailDeliveryStatus,
  formatFollowUpInterest,
  formatReportStatus,
} from "@/features/admin/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAdminAccessFromRequest } from "@/server/admin/admin-access";
import { getAdminLeadDetailView } from "@/server/services/admin-dashboard.service";

type AdminLeadDetailPageProps = {
  params: Promise<{ publicToken: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readAdminKey(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const value = searchParams.admin_key;
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export default async function AdminLeadDetailPage({
  params,
  searchParams,
}: AdminLeadDetailPageProps) {
  const query = await searchParams;
  const hasAccess = await getAdminAccessFromRequest({
    adminKey: readAdminKey(query),
  });
  if (!hasAccess) {
    return <AdminAccessGate />;
  }

  const { publicToken } = await params;
  const detail = await getAdminLeadDetailView(publicToken);
  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          eyebrow="Lead detail"
          title={detail.lead.email}
          description={`Submitted ${new Date(detail.lead.createdAt).toLocaleString()}`}
        />
        <Link
          href="/admin/leads"
          className="text-primary text-sm font-medium hover:underline"
        >
          ← Back to leads
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead summary</CardTitle>
            <CardDescription>
              Contact details and follow-up context.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd>{detail.lead.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Company</dt>
                <dd>{detail.lead.companyName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Role</dt>
                <dd>{detail.lead.role ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Follow-up interest</dt>
                <dd>{formatFollowUpInterest(detail.lead.followUpInterest)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Consent</dt>
                <dd>{detail.lead.consentToFollowUp ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Lead status</dt>
                <dd>
                  <AdminLeadStatusChip status={detail.lead.status} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Assessment reference</dt>
                <dd className="font-mono text-xs break-all">
                  {detail.publicToken}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessment summary</CardTitle>
            <CardDescription>
              Company profile from the assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Company</dt>
                <dd>{detail.assessment.companyName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Industry</dt>
                <dd>{formatAdminIndustry(detail.assessment.industry)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Company size</dt>
                <dd>{formatAdminCompanySize(detail.assessment.companySize)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Country / region</dt>
                <dd>
                  {formatAdminCountryRegion(detail.assessment.countryRegion)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Respondent role</dt>
                <dd>{detail.assessment.respondentRole.replace(/_/g, " ")}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Main AI concerns</dt>
                <dd>
                  {formatAdminConcernList(detail.assessment.mainAiConcerns)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tool context</CardTitle>
          <CardDescription>Selected tools from the assessment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1 font-medium">
              Known tools
            </p>
            <p>
              {detail.tools.knownTools.length > 0
                ? detail.tools.knownTools.join(", ")
                : "None"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 font-medium">
              Unknown tools
            </p>
            <p>
              {detail.tools.unknownTools.length > 0
                ? detail.tools.unknownTools.join(", ")
                : "None"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 font-medium">
              Not sure selected
            </p>
            <p>{detail.tools.hasNotSureSelection ? "Yes" : "No"}</p>
          </div>
        </CardContent>
      </Card>

      <AdminRiskSummaryCard assessment={detail.assessment} />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top findings</CardTitle>
            <CardDescription>
              Summary only — raw answers are not shown.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detail.findings.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No findings available.
              </p>
            ) : (
              detail.findings.map((finding) => (
                <article
                  key={finding.title}
                  className="border-border border-b pb-4 last:border-b-0"
                >
                  <h3 className="font-medium">{finding.title}</h3>
                  <p className="text-muted-foreground text-xs uppercase">
                    {finding.severity}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {finding.summary}
                  </p>
                </article>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top recommendations</CardTitle>
            <CardDescription>
              Priority actions from the assessment engine.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detail.recommendations.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No recommendations available.
              </p>
            ) : (
              detail.recommendations.map((rec) => (
                <article
                  key={rec.title}
                  className="border-border border-b pb-4 last:border-b-0"
                >
                  <h3 className="font-medium">{rec.title}</h3>
                  <p className="text-muted-foreground text-xs">
                    {formatAdminPriority(rec.priority)} · {rec.effort} effort
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {rec.summary}
                  </p>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report status</CardTitle>
          <CardDescription>
            PDF generation and storage status (no storage paths shown).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Report context</dt>
              <dd>
                {detail.report.hasReportContext ? "Available" : "Missing"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">PDF status</dt>
              <dd>{formatReportStatus(detail.report.status)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">PDF stored</dt>
              <dd>{detail.report.hasPdf ? "Yes (private storage)" : "No"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Generated at</dt>
              <dd>
                {detail.report.generatedAt
                  ? new Date(detail.report.generatedAt).toLocaleString()
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email delivery</dt>
              <dd>{formatEmailDeliveryStatus(detail.emailDeliveryStatus)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <AdminEmailEventsTable
        events={detail.emailEvents}
        emailDeliveryStatus={detail.emailDeliveryStatus}
      />

      <AdminLeadActions
        publicToken={detail.publicToken}
        currentStatus={detail.lead.status}
        emailDeliveryStatus={detail.emailDeliveryStatus}
        consentToFollowUp={detail.lead.consentToFollowUp}
        hasPdf={detail.report.hasPdf}
      />
    </div>
  );
}
