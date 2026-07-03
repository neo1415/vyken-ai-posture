import "server-only";

import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

import type { ReportContext } from "@/features/report-context/types";
import {
  ADMIN_DEFAULT_LIMIT,
  ADMIN_DEFAULT_PAGE,
  ADMIN_INTERNAL_RECIPIENT_LABEL,
} from "@/features/admin/constants";
import type {
  AdminLeadDetail,
  AdminLeadListFilters,
  AdminLeadListItem,
  AdminLeadListResult,
} from "@/features/admin/types";
import {
  INTERNAL_NOTIFICATION_EMAIL_TYPE,
  USER_REPORT_EMAIL_TYPE,
} from "@/features/email-delivery/types";
import { getDb } from "@/lib/db/client";
import {
  assessmentCompanyProfiles,
  assessmentFindings,
  assessmentRecommendations,
  assessmentScores,
  assessmentSelectedTools,
  assessmentSessions,
} from "@/lib/db/schema/assessments";
import { aiTools } from "@/lib/db/schema/ai-tools";
import { emailEvents } from "@/lib/db/schema/events";
import { leads } from "@/lib/db/schema/leads";
import { reports } from "@/lib/db/schema/reports";
import { parseScoringResultFromBreakdown } from "@/server/repositories/assessment-recommendations.repository";

export type AdminLeadStatusUpdateInput = {
  publicToken: string;
  status: (typeof leads.$inferSelect)["status"];
};

type LeadListRow = {
  lead: typeof leads.$inferSelect;
  publicToken: string;
  reportStatus: string | null;
  reportContext: unknown;
  storagePath: string | null;
  generatedAt: Date | null;
  scoreBreakdown: unknown;
  overallRiskLevel: string | null;
};

function resolveEmailDeliveryStatus(
  events: (typeof emailEvents.$inferSelect)[],
): string {
  const userEvents = events.filter(
    (event) => event.emailType === USER_REPORT_EMAIL_TYPE,
  );
  const internalEvents = events.filter(
    (event) => event.emailType === INTERNAL_NOTIFICATION_EMAIL_TYPE,
  );

  const userSent = userEvents.some((event) => event.status === "sent");
  const internalSent = internalEvents.some((event) => event.status === "sent");
  const userFailed = userEvents.some((event) => event.status === "failed");

  if (userSent && internalSent) return "sent";
  if (userSent && !internalSent) return "partial";
  if (userFailed) return "failed";
  if (userEvents.length === 0) return "not_sent";
  return "pending";
}

function extractRiskFromRow(row: LeadListRow): {
  overallScore: number | null;
  riskLevel: string | null;
  confidenceLevel: string | null;
} {
  const reportContext = row.reportContext as ReportContext | null;
  if (reportContext?.riskSummary) {
    return {
      overallScore: reportContext.riskSummary.overallScore,
      riskLevel: reportContext.riskSummary.overallRiskLevel,
      confidenceLevel: reportContext.riskSummary.confidenceLevel,
    };
  }

  const parsedScore = parseScoringResultFromBreakdown(row.scoreBreakdown);
  if (parsedScore) {
    return {
      overallScore: parsedScore.overallScore,
      riskLevel: parsedScore.overallRiskLevel,
      confidenceLevel: parsedScore.confidenceLevel,
    };
  }

  return {
    overallScore: row.lead.leadScore,
    riskLevel: row.overallRiskLevel,
    confidenceLevel: null,
  };
}

function mapLeadListItem(
  row: LeadListRow,
  emailDeliveryStatus: string,
): AdminLeadListItem {
  const risk = extractRiskFromRow(row);

  return {
    publicToken: row.publicToken,
    submittedAt: row.lead.createdAt.toISOString(),
    email: row.lead.email,
    name: row.lead.name,
    companyName: row.lead.companyName,
    role: row.lead.role,
    followUpInterest: row.lead.mainAiConcern,
    leadStatus: row.lead.status,
    overallScore: risk.overallScore,
    riskLevel: risk.riskLevel,
    confidenceLevel: risk.confidenceLevel,
    reportStatus: row.reportStatus,
    emailDeliveryStatus,
  };
}

export async function getAdminLeadList(
  filters: AdminLeadListFilters,
): Promise<AdminLeadListResult> {
  const db = getDb();
  const page = filters.page ?? ADMIN_DEFAULT_PAGE;
  const limit = filters.limit ?? ADMIN_DEFAULT_LIMIT;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(leads.email, pattern),
        ilike(leads.companyName, pattern),
        ilike(leads.name, pattern),
      ),
    );
  }

  if (filters.leadStatus) {
    conditions.push(
      eq(
        leads.status,
        filters.leadStatus as (typeof leads.$inferSelect)["status"],
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const baseQuery = db
    .select({
      lead: leads,
      publicToken: assessmentSessions.publicToken,
      reportStatus: reports.status,
      reportContext: reports.reportContext,
      storagePath: reports.storagePath,
      generatedAt: reports.generatedAt,
      scoreBreakdown: assessmentScores.scoreBreakdown,
      overallRiskLevel: assessmentScores.overallRiskLevel,
    })
    .from(leads)
    .innerJoin(
      assessmentSessions,
      eq(leads.assessmentSessionId, assessmentSessions.id),
    )
    .leftJoin(reports, eq(reports.assessmentSessionId, assessmentSessions.id))
    .leftJoin(
      assessmentScores,
      eq(assessmentScores.assessmentSessionId, assessmentSessions.id),
    )
    .where(whereClause)
    .orderBy(desc(leads.createdAt))
    .limit(limit)
    .offset(offset);

  const rows = await baseQuery;

  const [totalRow] = await db
    .select({ value: count() })
    .from(leads)
    .where(whereClause);

  const sessionIds = rows
    .map((row) => row.lead.assessmentSessionId)
    .filter((id): id is string => Boolean(id));

  const eventRows =
    sessionIds.length > 0
      ? await db
          .select()
          .from(emailEvents)
          .where(inArray(emailEvents.assessmentSessionId, sessionIds))
      : [];

  const eventsBySession = new Map<
    string,
    (typeof emailEvents.$inferSelect)[]
  >();
  for (const event of eventRows) {
    if (!event.assessmentSessionId) continue;
    const existing = eventsBySession.get(event.assessmentSessionId) ?? [];
    existing.push(event);
    eventsBySession.set(event.assessmentSessionId, existing);
  }

  let items = rows.map((row) => {
    const sessionId = row.lead.assessmentSessionId ?? "";
    const events = eventsBySession.get(sessionId) ?? [];
    const emailDeliveryStatus = resolveEmailDeliveryStatus(events);
    return mapLeadListItem(row, emailDeliveryStatus);
  });

  if (filters.riskLevel) {
    items = items.filter((item) => item.riskLevel === filters.riskLevel);
  }

  if (filters.emailStatus) {
    items = items.filter(
      (item) => item.emailDeliveryStatus === filters.emailStatus,
    );
  }

  return {
    items,
    total: Number(totalRow?.value ?? 0),
    page,
    limit,
  };
}

export async function getAdminLeadDetailByPublicToken(
  publicToken: string,
): Promise<AdminLeadDetail | null> {
  const db = getDb();

  const [row] = await db
    .select({
      lead: leads,
      publicToken: assessmentSessions.publicToken,
      reportStatus: reports.status,
      reportContext: reports.reportContext,
      storagePath: reports.storagePath,
      generatedAt: reports.generatedAt,
      scoreBreakdown: assessmentScores.scoreBreakdown,
      overallRiskLevel: assessmentScores.overallRiskLevel,
    })
    .from(assessmentSessions)
    .innerJoin(leads, eq(leads.assessmentSessionId, assessmentSessions.id))
    .leftJoin(reports, eq(reports.assessmentSessionId, assessmentSessions.id))
    .leftJoin(
      assessmentScores,
      eq(assessmentScores.assessmentSessionId, assessmentSessions.id),
    )
    .where(eq(assessmentSessions.publicToken, publicToken))
    .orderBy(desc(leads.updatedAt))
    .limit(1);

  if (!row) {
    return null;
  }

  const sessionId = row.lead.assessmentSessionId;
  if (!sessionId) {
    return null;
  }

  const [companyProfile, toolRows, findingRows, recommendationRows, events] =
    await Promise.all([
      db
        .select()
        .from(assessmentCompanyProfiles)
        .where(eq(assessmentCompanyProfiles.assessmentSessionId, sessionId))
        .limit(1),
      db
        .select({
          selectionType: assessmentSelectedTools.selectionType,
          unknownToolName: assessmentSelectedTools.unknownToolName,
          toolName: aiTools.name,
        })
        .from(assessmentSelectedTools)
        .leftJoin(aiTools, eq(assessmentSelectedTools.toolId, aiTools.id))
        .where(eq(assessmentSelectedTools.assessmentSessionId, sessionId)),
      db
        .select({
          title: assessmentFindings.title,
          severity: assessmentFindings.severity,
          summary: assessmentFindings.summary,
        })
        .from(assessmentFindings)
        .where(eq(assessmentFindings.assessmentSessionId, sessionId))
        .limit(5),
      db
        .select({
          title: assessmentRecommendations.title,
          severity: assessmentRecommendations.severity,
          recommendedActions: assessmentRecommendations.recommendedActions,
          sortOrder: assessmentRecommendations.sortOrder,
        })
        .from(assessmentRecommendations)
        .where(eq(assessmentRecommendations.assessmentSessionId, sessionId))
        .orderBy(assessmentRecommendations.sortOrder)
        .limit(5),
      db
        .select()
        .from(emailEvents)
        .where(eq(emailEvents.assessmentSessionId, sessionId))
        .orderBy(desc(emailEvents.createdAt)),
    ]);

  const reportContext = row.reportContext as ReportContext | null;
  const parsedScore = parseScoringResultFromBreakdown(row.scoreBreakdown);
  const risk = extractRiskFromRow(row);

  const knownTools: string[] = [];
  const unknownTools: string[] = [];
  let hasNotSureSelection = false;

  if (reportContext?.tools) {
    knownTools.push(...reportContext.tools.knownTools.map((tool) => tool.name));
    unknownTools.push(
      ...reportContext.tools.unknownTools.map((tool) => tool.name),
    );
    hasNotSureSelection = reportContext.tools.hasNotSureSelection;
  } else {
    for (const tool of toolRows) {
      if (tool.selectionType === "known_tool" && tool.toolName) {
        knownTools.push(tool.toolName);
      } else if (
        tool.selectionType === "unknown_tool" &&
        tool.unknownToolName
      ) {
        unknownTools.push(tool.unknownToolName);
      } else if (tool.selectionType === "not_sure") {
        hasNotSureSelection = true;
      }
    }
  }

  const findings =
    reportContext?.findings.slice(0, 5).map((finding) => ({
      title: finding.title,
      severity: finding.severity,
      summary: finding.summary,
    })) ??
    findingRows.map((finding) => ({
      title: finding.title,
      severity: finding.severity,
      summary: finding.summary,
    }));

  const recommendations =
    reportContext?.recommendations.slice(0, 5).map((rec) => ({
      title: rec.title,
      priority: rec.priority,
      effort: rec.effort,
      summary: rec.summary,
    })) ??
    recommendationRows.map((rec) => ({
      title: rec.title,
      priority: rec.severity,
      effort: "medium",
      summary: Array.isArray(rec.recommendedActions)
        ? rec.recommendedActions.join(" ")
        : rec.title,
    }));

  const categoryScores =
    reportContext?.categoryScores.map((category) => ({
      label: category.label,
      score: category.score,
      riskLevel: category.riskLevel,
    })) ??
    parsedScore?.categoryScores.map((category) => ({
      label: category.label,
      score: category.score,
      riskLevel: category.riskLevel,
    })) ??
    [];

  const emailDeliveryStatus = resolveEmailDeliveryStatus(events);

  return {
    publicToken: row.publicToken,
    lead: {
      email: row.lead.email,
      name: row.lead.name,
      companyName: row.lead.companyName,
      role: row.lead.role,
      followUpInterest: row.lead.mainAiConcern,
      consentToFollowUp: row.lead.consentToFollowUp,
      status: row.lead.status,
      createdAt: row.lead.createdAt.toISOString(),
    },
    assessment: {
      companyName:
        companyProfile[0]?.companyName ??
        reportContext?.company.companyName ??
        null,
      industry:
        companyProfile[0]?.industry ??
        reportContext?.company.industry ??
        "unknown",
      companySize:
        companyProfile[0]?.companySize ??
        reportContext?.company.companySize ??
        "unknown",
      countryRegion:
        companyProfile[0]?.countryRegion ??
        reportContext?.company.countryRegion ??
        "unknown",
      respondentRole:
        companyProfile[0]?.respondentRole ??
        reportContext?.company.respondentRole ??
        "unknown",
      mainAiConcerns:
        companyProfile[0]?.mainAiConcerns ??
        reportContext?.company.mainAiConcerns ??
        [],
      overallScore: risk.overallScore,
      riskLevel: risk.riskLevel,
      confidenceLevel: risk.confidenceLevel,
      categoryScores,
    },
    tools: {
      knownTools,
      unknownTools,
      hasNotSureSelection,
    },
    findings,
    recommendations,
    report: {
      status: row.reportStatus,
      generatedAt: row.generatedAt?.toISOString() ?? null,
      hasPdf: Boolean(row.storagePath),
      hasReportContext: Boolean(reportContext),
    },
    emailEvents: events.map((event) => ({
      type: event.emailType,
      recipient:
        event.emailType === USER_REPORT_EMAIL_TYPE
          ? row.lead.email
          : ADMIN_INTERNAL_RECIPIENT_LABEL,
      status: event.status,
      provider: event.provider,
      sentAt: event.sentAt?.toISOString() ?? null,
      errorMessage: event.errorMessage,
    })),
    emailDeliveryStatus,
  };
}

export async function updateLeadStatusForAdmin(
  input: AdminLeadStatusUpdateInput,
): Promise<{ publicToken: string; status: string } | null> {
  const db = getDb();

  const [session] = await db
    .select({
      id: assessmentSessions.id,
      publicToken: assessmentSessions.publicToken,
    })
    .from(assessmentSessions)
    .where(eq(assessmentSessions.publicToken, input.publicToken))
    .limit(1);

  if (!session) {
    return null;
  }

  const [updated] = await db
    .update(leads)
    .set({ status: input.status, updatedAt: sql`now()` })
    .where(eq(leads.assessmentSessionId, session.id))
    .returning({ status: leads.status });

  if (!updated) {
    return null;
  }

  return {
    publicToken: session.publicToken,
    status: updated.status,
  };
}
