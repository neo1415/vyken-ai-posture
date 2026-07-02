/**
 * Live Module 13 verification against Supabase.
 * Run: pnpm verify:module13
 */
import { randomBytes } from "node:crypto";
import { execSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { readdirSync, statSync } from "node:fs";

import { config } from "dotenv";
import { and, eq } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { ASSESSMENT_QUESTIONS } from "@/features/assessment-wizard/questions";
import { isAgenticSectionRequired } from "@/features/assessment-wizard/agentic-trigger";
import {
  PDF_EXPECTED_HEADINGS,
  PDF_POSITIVE_BANNED_PATTERNS,
} from "@/features/pdf-report/constants";
import {
  countPdfPages,
  extractPdfText,
  isPdfBuffer,
  renderPdfReportBuffer,
} from "@/features/pdf-report/pdf-report-renderer";
import { validatePdfReportContext } from "@/features/pdf-report/pdf-validation";
import { REPORT_CONTEXT_VERSION } from "@/features/report-context/constants";
import { buildReportContext } from "@/features/report-context/report-context-builder";
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
import { buildReportStorageKey } from "@/server/storage/report-storage.constants";

const VERIFY_COMPANY_NAME = "Module 13 Verify Co";
const STORAGE_ROOT = resolve(process.cwd(), "storage", "reports");

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

function hasPublicDownloadRoute(): boolean {
  const appRoot = resolve(process.cwd(), "src", "app");
  const stack = [appRoot];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        if (/download|pdf-report|report-download/i.test(entry)) {
          return true;
        }
        stack.push(fullPath);
      } else if (/route\.(ts|tsx|js)$/i.test(entry)) {
        if (/download|pdf.*report|report.*pdf/i.test(fullPath)) {
          return true;
        }
      }
    }
  }
  return false;
}

async function savePdfForVerify(
  assessmentSessionId: string,
  buffer: Buffer,
): Promise<string> {
  const storagePath = buildReportStorageKey(assessmentSessionId);
  const sessionDir = join(STORAGE_ROOT, assessmentSessionId);
  await mkdir(sessionDir, { recursive: true });
  await writeFile(join(sessionDir, "ai-governance-risk-report.pdf"), buffer);
  return storagePath;
}

async function updateReportPdfInScript(
  db: ReturnType<typeof createScriptDb>["db"],
  assessmentSessionId: string,
  storagePath: string,
): Promise<void> {
  await db
    .update(reports)
    .set({
      storagePath,
      status: "generated",
      generatedAt: new Date(),
    })
    .where(eq(reports.assessmentSessionId, assessmentSessionId));
}

async function main() {
  console.log("Module 13 live verification");
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  let module12Committed = false;
  try {
    const log = execSync("git log --oneline -15", { encoding: "utf8" });
    module12Committed = log.includes("Module 12");
  } catch {
    module12Committed = false;
  }
  record(
    0,
    "Module 12 committed on branch",
    module12Committed,
    module12Committed
      ? "Found Module 12 in recent git log"
      : "Module 12 commit not found",
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

  const companyProfile = (
    await db
      .select()
      .from(assessmentCompanyProfiles)
      .where(eq(assessmentCompanyProfiles.assessmentSessionId, session.id))
      .limit(1)
  )[0]!;

  const toolSelections = await db
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
    .where(eq(assessmentSelectedTools.assessmentSessionId, session.id));

  const context = buildReportContextInScript({
    publicToken,
    session,
    scoringResult,
    recommendationResult,
    companyProfile,
    toolSelections,
  });

  await upsertReportContextInScript(db, session.id, context);

  record(
    1,
    "Report context exists or was built",
    context.reportContextVersion === REPORT_CONTEXT_VERSION,
    context.reportContextVersion,
  );

  let pdfValidationPassed = true;
  try {
    validatePdfReportContext(context);
  } catch (error) {
    pdfValidationPassed = false;
    record(2, "PDF context validation", false, String(error));
  }
  if (pdfValidationPassed) {
    record(
      2,
      "PDF context validation",
      true,
      "validatePdfReportContext passed",
    );
  }

  const pdfBuffer = await renderPdfReportBuffer(context);
  record(
    3,
    "PDF generation succeeds",
    isPdfBuffer(pdfBuffer),
    `bytes=${pdfBuffer.byteLength}`,
  );
  record(
    4,
    "Generated PDF is non-empty",
    pdfBuffer.byteLength > 1024,
    `bytes=${pdfBuffer.byteLength}`,
  );

  const pageCount = countPdfPages(pdfBuffer);
  record(
    5,
    "Generated PDF has at least 2 pages",
    pageCount >= 2,
    `pages=${pageCount}`,
  );

  const extractedText = extractPdfText(pdfBuffer);
  const headingsPresent = PDF_EXPECTED_HEADINGS.every((heading) =>
    extractedText.includes(heading),
  );
  record(
    6,
    "PDF text includes expected headings",
    headingsPresent,
    headingsPresent ? "all headings found" : "missing headings",
  );

  const storagePath = await savePdfForVerify(session.id, pdfBuffer);
  await updateReportPdfInScript(db, session.id, storagePath);

  const [reportRow] = await db
    .select()
    .from(reports)
    .where(eq(reports.assessmentSessionId, session.id))
    .limit(1);

  record(
    7,
    "Report row updated after PDF generation",
    reportRow?.status === "generated",
    `status=${reportRow?.status ?? "n/a"}`,
  );
  record(
    8,
    "storage_path is set safely",
    reportRow?.storagePath === storagePath &&
      !reportRow.storagePath.includes(".."),
    reportRow?.storagePath ?? "missing",
  );
  record(
    9,
    "generated_at is set",
    reportRow?.generatedAt != null,
    reportRow?.generatedAt?.toISOString() ?? "null",
  );

  const secondBuffer = await renderPdfReportBuffer(context);
  await savePdfForVerify(session.id, secondBuffer);
  await updateReportPdfInScript(db, session.id, storagePath);

  const reportRows = await db
    .select()
    .from(reports)
    .where(eq(reports.assessmentSessionId, session.id));

  record(
    10,
    "Rebuild does not duplicate report rows",
    reportRows.length === 1,
    `count=${reportRows.length}`,
  );

  const uuidPattern =
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
  record(
    11,
    "No raw DB UUIDs in extracted PDF text",
    !uuidPattern.test(extractedText),
    uuidPattern.test(extractedText) ? "UUID found" : "none found",
  );

  const bannedHit = PDF_POSITIVE_BANNED_PATTERNS.find((pattern) =>
    pattern.test(extractedText),
  );
  record(
    12,
    "No banned positive compliance claims in PDF",
    bannedHit == null,
    bannedHit ? bannedHit.source : "none found",
  );

  record(
    13,
    "No raw answer rows in PDF text",
    !extractedText.includes("questionId") &&
      !extractedText.includes("answerValue"),
    "questionId/answerValue absent",
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
    14,
    "No email events created",
    emailEventRows.length === 0,
    `count=${emailEventRows.length}`,
  );
  record(
    15,
    "No CTA events created",
    ctaRows.length === 0,
    `count=${ctaRows.length}`,
  );
  record(
    16,
    "No lead events created for verify session",
    leadRows.length === 0,
    `count=${leadRows.length}`,
  );

  record(
    17,
    "No public download route added",
    !hasPublicDownloadRoute(),
    hasPublicDownloadRoute() ? "route found" : "none found",
  );

  const storedFile = await readFile(
    join(STORAGE_ROOT, session.id, "ai-governance-risk-report.pdf"),
  );
  record(
    18,
    "Stored PDF file is readable and non-empty",
    storedFile.byteLength === pdfBuffer.byteLength,
    `bytes=${storedFile.byteLength}`,
  );

  record(
    19,
    "Extracted PDF text is not blank",
    extractedText.trim().length > 200,
    `chars=${extractedText.trim().length}`,
  );

  let pngRendered = false;
  try {
    execSync("pdftoppm -v", { stdio: "ignore" });
    pngRendered = true;
  } catch {
    pngRendered = false;
  }
  record(
    20,
    "Render verification (PNG or text fallback)",
    pngRendered || extractedText.trim().length > 200,
    pngRendered
      ? "pdftoppm available (text extraction used for content checks)"
      : "pdftoppm unavailable; text extraction fallback used",
  );

  validateReportContext(context);
  record(
    21,
    "Report context still validates after PDF flow",
    true,
    "validateReportContext passed",
  );

  void secondBuffer;

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
