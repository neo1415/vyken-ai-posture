/**
 * Live Module 12 verification against Supabase.
 * Run: pnpm verify:module12
 */
import { randomBytes } from "node:crypto";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

import { config } from "dotenv";
import { and, eq } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { ASSESSMENT_QUESTIONS } from "@/features/assessment-wizard/questions";
import { isAgenticSectionRequired } from "@/features/assessment-wizard/agentic-trigger";
import { REPORT_CONTEXT_VERSION } from "@/features/report-context/constants";
import { buildReportContext } from "@/features/report-context/report-context-builder";
import { getReportSections } from "@/features/report-context/sections";
import type { ReportContext } from "@/features/report-context/types";
import { validateReportContext } from "@/features/report-context/validation";
import { findingSeverityRank } from "@/features/results/formatters";
import { RECOMMENDATION_MODEL_VERSION } from "@/features/recommendations/constants";
import { generateFindings } from "@/features/recommendations/finding-engine";
import {
  buildRecommendationResult,
  generateRecommendations,
} from "@/features/recommendations/recommendation-engine";
import type { AssessmentRecommendation } from "@/features/recommendations/types";
import { validateRecommendationResult } from "@/features/recommendations/validation";
import { scoreAssessment } from "@/features/scoring/scoring-engine";
import type {
  AssessmentScoringInput,
  RiskSignal,
} from "@/features/scoring/types";
import { createScriptDb } from "@/lib/db/script-db";
import {
  aiToolCategories,
  aiToolProfileVersions,
  aiTools,
} from "@/lib/db/schema/ai-tools";
import {
  assessmentAnswers,
  assessmentCompanyProfiles,
  assessmentFindings,
  assessmentRecommendations,
  assessmentRiskSignals,
  assessmentScores,
  assessmentSelectedTools,
  assessmentSessions,
} from "@/lib/db/schema/assessments";
import { ctaEvents, emailEvents } from "@/lib/db/schema/events";
import { leads } from "@/lib/db/schema/leads";
import { reports } from "@/lib/db/schema/reports";
import { generatePublicToken } from "@/lib/security/public-token";

const VERIFY_COMPANY_NAME = "Module 12 Verify Co";

type Check = { id: number; name: string; pass: boolean; detail: string };
const results: Check[] = [];

function record(id: number, name: string, pass: boolean, detail: string) {
  results.push({ id, name, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${id}. ${name}`);
  console.log(`       ${detail}`);
}

function printSummary() {
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log("---");
  console.log(
    `Summary: ${passed} passed, ${failed} failed, ${results.length} checks`,
  );
}

function token() {
  return randomBytes(32).toString("base64url");
}

function contextHasEmailOutsideLead(context: ReportContext): boolean {
  const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
  const clone = structuredClone(context);
  clone.lead.email = null;
  return emailPattern.test(JSON.stringify(clone));
}

async function main() {
  console.log("Module 12 live verification");
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  let module11Committed = false;
  try {
    const log = execSync("git log --oneline -10", { encoding: "utf8" });
    module11Committed = log.includes("Module 11");
  } catch {
    module11Committed = false;
  }
  record(
    0,
    "Module 11 committed on branch",
    module11Committed,
    module11Committed
      ? "Found Module 11 in recent git log"
      : "Module 11 commit not found",
  );

  const { db, client } = createScriptDb();
  const publicToken = token();

  const [session] = await db
    .insert(assessmentSessions)
    .values({ publicToken, status: "started" })
    .returning();
  if (!session) throw new Error("session create failed");

  await db.insert(assessmentCompanyProfiles).values({
    assessmentSessionId: session.id,
    companyName: VERIFY_COMPANY_NAME,
    industry: "saas_technology",
    companySize: "51_200",
    countryRegion: "nigeria",
    respondentRole: "ciso_security_leader",
    mainAiConcerns: ["lack_of_ai_policy"],
  });

  const tools = await db
    .select({ id: aiTools.id, profileId: aiToolProfileVersions.id })
    .from(aiToolProfileVersions)
    .innerJoin(aiTools, eq(aiToolProfileVersions.toolId, aiTools.id))
    .where(
      and(
        eq(aiTools.isActive, true),
        eq(aiToolProfileVersions.publishedStatus, "published"),
      ),
    )
    .limit(1);
  if (tools.length < 1) throw new Error("No published tools");

  await db.insert(assessmentSelectedTools).values({
    assessmentSessionId: session.id,
    toolId: tools[0].id,
    toolProfileVersionId: tools[0].profileId,
    selectionType: "known_tool",
  });

  await db.insert(assessmentAnswers).values(
    ASSESSMENT_QUESTIONS.map((q) => ({
      assessmentSessionId: session.id,
      questionId: q.id,
      sectionId: q.sectionId,
      answerType: q.answerType,
      answerValue:
        q.answerType === "multi_select"
          ? [q.options[0]?.value ?? "not_sure"]
          : (q.options[0]?.value ?? "not_sure"),
    })),
  );

  const scoringInput = await buildScoringInput(db, session.id);
  const scoringResult = scoreAssessment(scoringInput);
  await persistScoreAndSignals(db, session.id, scoringInput, scoringResult);

  const findings = generateFindings(scoringResult);
  const recommendations = generateRecommendations({ scoringResult, findings });
  const recommendationResult = buildRecommendationResult(
    scoringResult,
    findings,
    recommendations,
  );
  validateRecommendationResult(
    recommendationResult,
    scoringResult.signals.map((s) => s.signalId),
  );
  await persistFindingsAndRecommendations(
    db,
    session.id,
    findings,
    recommendations,
  );

  const built = buildReportContextInScript({
    publicToken,
    session,
    scoringResult,
    recommendationResult,
    companyProfile: (
      await db
        .select()
        .from(assessmentCompanyProfiles)
        .where(eq(assessmentCompanyProfiles.assessmentSessionId, session.id))
        .limit(1)
    )[0]!,
    toolSelections: await db
      .select({
        selectionType: assessmentSelectedTools.selectionType,
        unknownToolName: assessmentSelectedTools.unknownToolName,
        unknownToolUrl: assessmentSelectedTools.unknownToolUrl,
        tool: aiTools,
        profile: aiToolProfileVersions,
        category: aiToolCategories,
      })
      .from(assessmentSelectedTools)
      .leftJoin(aiTools, eq(assessmentSelectedTools.toolId, aiTools.id))
      .leftJoin(aiToolCategories, eq(aiTools.categoryId, aiToolCategories.id))
      .leftJoin(
        aiToolProfileVersions,
        eq(
          assessmentSelectedTools.toolProfileVersionId,
          aiToolProfileVersions.id,
        ),
      )
      .where(eq(assessmentSelectedTools.assessmentSessionId, session.id)),
  });

  await upsertReportContextInScript(db, session.id, built);
  const context = built;

  record(
    1,
    "Report context builds successfully",
    context.reportContextVersion === REPORT_CONTEXT_VERSION,
    context.reportContextVersion,
  );
  record(
    2,
    "Company context present",
    context.company.companyName === VERIFY_COMPANY_NAME &&
      context.company.industry.length > 0,
    context.company.industry,
  );
  record(
    3,
    "Tool context present",
    context.tools.knownTools.length >= 1 && context.tools.toolCount >= 1,
    `toolCount=${context.tools.toolCount}`,
  );
  record(
    4,
    "Risk summary present",
    context.riskSummary.overallScore >= 0,
    `score=${context.riskSummary.overallScore}`,
  );
  record(
    5,
    "Exactly 6 category scores",
    context.categoryScores.length === 6,
    `count=${context.categoryScores.length}`,
  );
  record(
    6,
    "Findings present",
    context.findings.length >= 1,
    `count=${context.findings.length}`,
  );
  record(
    7,
    "Recommendations present",
    context.recommendations.length >= 1 && context.recommendations.length <= 8,
    `count=${context.recommendations.length}`,
  );
  record(
    8,
    "Methodology present",
    context.appendix.methodology.length >= 1,
    `count=${context.appendix.methodology.length}`,
  );
  record(
    9,
    "Limitations present",
    context.appendix.limitations.length >= 1,
    `count=${context.appendix.limitations.length}`,
  );

  let validationPassed = true;
  try {
    validateReportContext(context);
  } catch {
    validationPassed = false;
  }
  record(
    10,
    "Report context validates",
    validationPassed,
    validationPassed ? "validateReportContext passed" : "validation failed",
  );

  const sections = getReportSections();
  record(
    11,
    "Report sections defined",
    sections.length === 10,
    `count=${sections.length}`,
  );

  const [reportRowsAfterFirst] = await db
    .select()
    .from(reports)
    .where(eq(reports.assessmentSessionId, session.id));

  record(
    12,
    "Report record created",
    reportRowsAfterFirst != null,
    reportRowsAfterFirst ? `status=${reportRowsAfterFirst.status}` : "missing",
  );

  await upsertReportContextInScript(db, session.id, context);

  const reportRows = await db
    .select()
    .from(reports)
    .where(eq(reports.assessmentSessionId, session.id));

  record(
    13,
    "Rebuild does not duplicate report rows",
    reportRows.length === 1,
    `count=${reportRows.length}`,
  );
  record(
    14,
    "No PDF URL or storage path set",
    reportRows[0]?.storagePath == null &&
      !JSON.stringify(reportRows[0]?.reportContext).includes("pdf_url"),
    `storagePath=${reportRows[0]?.storagePath ?? "null"}`,
  );
  record(
    15,
    "Report status not generated/delivered",
    reportRows[0]?.status === "pending",
    `status=${reportRows[0]?.status ?? "n/a"}`,
  );

  const [emailEventRows, ctaRows, leadRows] = await Promise.all([
    db
      .select()
      .from(emailEvents)
      .where(eq(emailEvents.assessmentSessionId, session.id)),
    db
      .select()
      .from(ctaEvents)
      .where(eq(ctaEvents.assessmentSessionId, session.id)),
    db.select().from(leads).where(eq(leads.assessmentSessionId, session.id)),
  ]);

  record(
    16,
    "No email events created",
    emailEventRows.length === 0,
    `count=${emailEventRows.length}`,
  );
  record(
    17,
    "No CTA events created",
    ctaRows.length === 0,
    `count=${ctaRows.length}`,
  );

  const uuidPattern =
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
  record(
    18,
    "No raw DB UUIDs in report context",
    !uuidPattern.test(JSON.stringify(context)),
    uuidPattern.test(JSON.stringify(context)) ? "UUID found" : "none found",
  );
  record(
    19,
    "Lead email only inside lead object when present",
    !contextHasEmailOutsideLead(context),
    context.lead.hasLead ? "no lead in this test" : "no lead email in context",
  );
  record(
    20,
    "No raw answer rows in report context",
    !JSON.stringify(context).includes("questionId"),
    "questionId absent",
  );

  void leadRows;

  await client.end();
  printSummary();
  process.exit(results.some((r) => !r.pass) ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function buildScoringInput(
  db: ReturnType<typeof createScriptDb>["db"],
  assessmentSessionId: string,
): Promise<AssessmentScoringInput> {
  const [companyProfile] = await db
    .select()
    .from(assessmentCompanyProfiles)
    .where(
      eq(assessmentCompanyProfiles.assessmentSessionId, assessmentSessionId),
    )
    .limit(1);
  if (!companyProfile) throw new Error("Company profile missing");

  const answers = await db
    .select()
    .from(assessmentAnswers)
    .where(eq(assessmentAnswers.assessmentSessionId, assessmentSessionId));

  const selections = await db
    .select({
      selectionType: assessmentSelectedTools.selectionType,
      unknownToolName: assessmentSelectedTools.unknownToolName,
      unknownToolUrl: assessmentSelectedTools.unknownToolUrl,
      tool: aiTools,
      profile: aiToolProfileVersions,
      category: aiToolCategories,
    })
    .from(assessmentSelectedTools)
    .leftJoin(aiTools, eq(assessmentSelectedTools.toolId, aiTools.id))
    .leftJoin(aiToolCategories, eq(aiTools.categoryId, aiToolCategories.id))
    .leftJoin(
      aiToolProfileVersions,
      eq(
        assessmentSelectedTools.toolProfileVersionId,
        aiToolProfileVersions.id,
      ),
    )
    .where(
      eq(assessmentSelectedTools.assessmentSessionId, assessmentSessionId),
    );

  const knownTools = selections.filter(
    (s) =>
      s.selectionType === "known_tool" &&
      s.tool != null &&
      s.profile != null &&
      s.category != null,
  );

  return {
    companyProfile: {
      industry: companyProfile.industry,
      companySize: companyProfile.companySize,
      countryRegion: companyProfile.countryRegion ?? null,
      handlesSensitiveOrRegulatedData:
        companyProfile.handlesSensitiveOrRegulatedData ?? null,
    },
    selectedTools: knownTools.map((s) => ({
      toolSlug: s.tool!.slug,
      toolName: s.tool!.name,
      categorySlug: s.category!.slug,
      supportsFileUploads: s.profile!.supportsFileUploads ?? null,
      supportsMeetingTranscripts: s.profile!.supportsMeetingTranscripts ?? null,
      codingAssistantRelevance: s.profile!.codingAssistantRelevance ?? null,
      agenticOrConnectedToolRelevance:
        s.profile!.agenticOrConnectedToolRelevance ?? null,
      publicInfoConfidenceLevel: s.profile!.publicInfoConfidenceLevel,
    })),
    unknownTools: selections
      .filter((s) => s.selectionType === "unknown_tool")
      .map((s) => ({
        name: s.unknownToolName ?? "Unknown tool",
        url: s.unknownToolUrl ?? null,
      })),
    hasNotSureToolSelection: selections.some(
      (s) => s.selectionType === "not_sure",
    ),
    answers: answers.map((a) => ({
      questionId: a.questionId,
      value: a.answerValue as string | string[],
    })),
  };
}

function toRiskLevelEnum(level: "low" | "moderate" | "high" | "critical") {
  return level;
}

function toSignalSeverityEnum(sev: RiskSignal["severity"]) {
  return sev === "medium" ? "moderate" : sev;
}

function toDbSeverityFromFinding(
  severity: string,
): "low" | "moderate" | "high" | "critical" {
  return severity === "medium"
    ? "moderate"
    : (severity as "low" | "high" | "critical");
}

function toDbSeverityFromPriority(
  priority: AssessmentRecommendation["priority"],
): "low" | "moderate" | "high" | "critical" {
  if (priority === "urgent") return "critical";
  if (priority === "medium") return "moderate";
  return priority;
}

async function persistScoreAndSignals(
  db: ReturnType<typeof createScriptDb>["db"],
  assessmentSessionId: string,
  scoringInput: AssessmentScoringInput,
  result: ReturnType<typeof scoreAssessment>,
): Promise<void> {
  const answerMap: Record<string, string | string[]> = {};
  for (const row of scoringInput.answers) {
    answerMap[row.questionId] = row.value;
  }

  const agenticRequired = isAgenticSectionRequired(
    {
      hasNotSure: scoringInput.hasNotSureToolSelection,
      categorySlugs: scoringInput.selectedTools.map((t) => t.categorySlug),
      codingAssistantRelevance: scoringInput.selectedTools.some(
        (t) => t.codingAssistantRelevance === true,
      ),
      agenticOrConnectedRelevance: scoringInput.selectedTools.some(
        (t) => t.agenticOrConnectedToolRelevance === true,
      ),
    },
    answerMap,
  );

  const dimensionLevel = (categoryId: string) => {
    const category = result.categoryScores.find(
      (c) => c.categoryId === categoryId,
    );
    return category ? toRiskLevelEnum(category.riskLevel) : "low";
  };

  await db.transaction(async (tx) => {
    await tx
      .delete(assessmentRiskSignals)
      .where(
        eq(assessmentRiskSignals.assessmentSessionId, assessmentSessionId),
      );
    await tx
      .delete(assessmentScores)
      .where(eq(assessmentScores.assessmentSessionId, assessmentSessionId));

    await tx.insert(assessmentScores).values({
      assessmentSessionId,
      overallRiskLevel: toRiskLevelEnum(result.overallRiskLevel),
      toolStackRiskLevel: dimensionLevel("vendor_and_tool_risk"),
      dataExposureRiskLevel: dimensionLevel("data_exposure"),
      governanceMaturityGapLevel: dimensionLevel("governance_controls"),
      auditabilityEnforcementGapLevel: dimensionLevel(
        "visibility_and_inventory",
      ),
      agenticCodingRiskLevel: agenticRequired
        ? dimensionLevel("agentic_and_coding_risk")
        : "unknown",
      leadQualificationScore: null,
      scoreBreakdown: {
        ...result,
        persistedAt: new Date().toISOString(),
      },
    });

    if (result.signals.length > 0) {
      await tx.insert(assessmentRiskSignals).values(
        result.signals.map((s) => ({
          assessmentSessionId,
          signalKey: s.signalId,
          severity: toRiskLevelEnum(toSignalSeverityEnum(s.severity)),
          sourceAnswerIds: s.sourceAnswerIds,
        })),
      );
    }
  });
}

async function persistFindingsAndRecommendations(
  db: ReturnType<typeof createScriptDb>["db"],
  assessmentSessionId: string,
  findings: ReturnType<typeof generateFindings>,
  recommendations: AssessmentRecommendation[],
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .delete(assessmentFindings)
      .where(eq(assessmentFindings.assessmentSessionId, assessmentSessionId));
    await tx
      .delete(assessmentRecommendations)
      .where(
        eq(assessmentRecommendations.assessmentSessionId, assessmentSessionId),
      );

    if (findings.length > 0) {
      await tx.insert(assessmentFindings).values(
        findings.map((finding) => ({
          assessmentSessionId,
          findingKey: finding.findingId,
          title: finding.title,
          summary: finding.summary,
          severity: toDbSeverityFromFinding(finding.severity),
          frameworkMapping: {
            categoryId: finding.categoryId,
            sourceSignalIds: finding.sourceSignalIds,
            evidence: finding.evidence,
            confidence: finding.confidence,
            modelVersion: RECOMMENDATION_MODEL_VERSION,
          } as unknown as string[],
        })),
      );
    }

    if (recommendations.length > 0) {
      await tx.insert(assessmentRecommendations).values(
        recommendations.map((rec, index) => ({
          assessmentSessionId,
          recommendationKey: rec.recommendationId,
          title: rec.title,
          severity: toDbSeverityFromPriority(rec.priority),
          recommendedActions: rec.implementationSteps,
          frameworkMapping: {
            summary: rec.summary,
            effort: rec.effort,
            priority: rec.priority,
            categoryId: rec.categoryId,
            sourceFindingIds: rec.sourceFindingIds,
            sourceSignalIds: rec.sourceSignalIds,
            relatedRiskCategories: rec.relatedRiskCategories,
            vykenGuardRelevance: rec.vykenGuardRelevance,
            caveats: rec.caveats,
            whyThisMatters: rec.whyThisMatters,
            modelVersion: RECOMMENDATION_MODEL_VERSION,
          } as unknown as string[],
          ctaType: null,
          sortOrder: index,
        })),
      );
    }
  });
}

function buildReportContextInScript(input: {
  publicToken: string;
  session: typeof assessmentSessions.$inferSelect;
  scoringResult: ReturnType<typeof scoreAssessment>;
  recommendationResult: ReturnType<typeof buildRecommendationResult>;
  companyProfile: typeof assessmentCompanyProfiles.$inferSelect;
  toolSelections: Array<{
    selectionType: (typeof assessmentSelectedTools.$inferSelect)["selectionType"];
    unknownToolName: string | null;
    unknownToolUrl: string | null;
    tool: typeof aiTools.$inferSelect | null;
    profile: typeof aiToolProfileVersions.$inferSelect | null;
    category: typeof aiToolCategories.$inferSelect | null;
  }>;
}): ReportContext {
  const knownTools = input.toolSelections
    .filter(
      (selection) =>
        selection.selectionType === "known_tool" &&
        selection.tool != null &&
        selection.category != null &&
        selection.profile != null,
    )
    .map((selection) => ({
      name: selection.tool!.name,
      slug: selection.tool!.slug,
      category: selection.category!.name,
      profileConfidence: (
        selection.profile!.publicInfoConfidenceLevel ?? "unknown"
      ).replace(/_/g, " "),
    }));

  const unknownTools = input.toolSelections
    .filter((selection) => selection.selectionType === "unknown_tool")
    .map((selection) => ({
      name: selection.unknownToolName ?? "Unknown tool",
      url: selection.unknownToolUrl ?? null,
    }));

  const sortedFindings = [...input.recommendationResult.findings].sort(
    (a, b) => findingSeverityRank(b.severity) - findingSeverityRank(a.severity),
  );

  const context = buildReportContext({
    generatedAt: new Date().toISOString(),
    publicToken: input.publicToken,
    sessionStatus: input.session.status,
    completedAt: input.session.completedAt?.toISOString() ?? null,
    companyProfile: {
      companyName: input.companyProfile.companyName,
      industry: input.companyProfile.industry,
      companySize: input.companyProfile.companySize,
      countryRegion: input.companyProfile.countryRegion,
      respondentRole: input.companyProfile.respondentRole,
      departmentFunction: input.companyProfile.departmentFunction,
      handlesSensitiveOrRegulatedData:
        input.companyProfile.handlesSensitiveOrRegulatedData,
      mainAiConcerns: input.companyProfile.mainAiConcerns ?? [],
    },
    lead: {
      hasLead: false,
      email: null,
      name: null,
      companyName: null,
      role: null,
      followUpInterest: null,
      consentToFollowUp: null,
    },
    tools: {
      knownTools,
      unknownTools,
      hasNotSureSelection: input.toolSelections.some(
        (selection) => selection.selectionType === "not_sure",
      ),
    },
    scoringResult: {
      overallScore: input.scoringResult.overallScore,
      overallRiskLevel: input.scoringResult.overallRiskLevel,
      confidenceLevel: input.scoringResult.confidenceLevel,
      headline: input.scoringResult.scoringSummary.headline,
      explanation: input.scoringResult.scoringSummary.explanation,
      caveats: input.scoringResult.scoringSummary.caveats,
      categoryScores: input.scoringResult.categoryScores.map((category) => ({
        categoryId: category.categoryId,
        label: category.label,
        score: category.score,
        riskLevel: category.riskLevel,
        explanation: category.explanation,
      })),
    },
    findings: sortedFindings.map((finding) => ({
      findingId: finding.findingId,
      categoryId: finding.categoryId,
      severity: finding.severity,
      title: finding.title,
      summary: finding.summary,
      confidence: finding.confidence,
    })),
    recommendations: input.recommendationResult.recommendations.map(
      (recommendation) => ({
        recommendationId: recommendation.recommendationId,
        title: recommendation.title,
        summary: recommendation.summary,
        priority: recommendation.priority,
        effort: recommendation.effort,
        categoryId: recommendation.categoryId,
        implementationSteps: recommendation.implementationSteps,
        whyThisMatters: recommendation.whyThisMatters,
        caveats: recommendation.caveats,
      }),
    ),
  });

  validateReportContext(context);
  return context;
}

async function upsertReportContextInScript(
  db: ReturnType<typeof createScriptDb>["db"],
  assessmentSessionId: string,
  reportContext: ReportContext,
): Promise<void> {
  const [existing] = await db
    .select()
    .from(reports)
    .where(eq(reports.assessmentSessionId, assessmentSessionId))
    .limit(1);

  if (existing) {
    await db
      .update(reports)
      .set({
        reportContext,
        status: "pending",
        storagePath: null,
      })
      .where(eq(reports.id, existing.id));
    return;
  }

  await db.insert(reports).values({
    assessmentSessionId,
    reportToken: generatePublicToken(),
    status: "pending",
    reportContext,
    storagePath: null,
    generatedAt: null,
    expiresAt: null,
  });
}
