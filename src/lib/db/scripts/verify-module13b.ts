/**
 * Live Module 13B verification — Supabase Storage for report PDFs.
 * Run: pnpm verify:module13b
 */
import { randomBytes } from "node:crypto";
import { execSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { config } from "dotenv";
import { and, eq } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { ASSESSMENT_QUESTIONS } from "@/features/assessment-wizard/questions";
import { isAgenticSectionRequired } from "@/features/assessment-wizard/agentic-trigger";
import {
  countPdfPages,
  isPdfBuffer,
  renderPdfReportBuffer,
} from "@/features/pdf-report/pdf-report-renderer";
import { validatePdfReportContext } from "@/features/pdf-report/pdf-validation";
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
import {
  buildReportStorageKey,
  isValidReportStorageKey,
  resolveReportStorageBucket,
} from "@/server/storage/report-storage.constants";
import { createSupabaseServiceClient } from "@/lib/supabase/create-service-client";
import {
  downloadReportPdfFromSupabase,
  getReportBucketVisibility,
  saveReportPdfToSupabase,
} from "@/server/storage/supabase-report-storage";

const VERIFY_COMPANY_NAME = "Module 13B Verify Co";

async function ensurePrivateReportBucketForVerify(input: {
  bucket: string;
  supabaseUrl: string;
  serviceRoleKey: string;
}): Promise<void> {
  const client = createSupabaseServiceClient({
    supabaseUrl: input.supabaseUrl,
    serviceRoleKey: input.serviceRoleKey,
  });

  const existing = await client.storage.getBucket(input.bucket);
  if (existing.data) {
    return;
  }

  const { error } = await client.storage.createBucket(input.bucket, {
    public: false,
  });

  if (error) {
    throw new Error(
      `Storage bucket "${input.bucket}" is not available and could not be created automatically. Create a private bucket manually. See docs/pdf-report/storage-notes.md`,
    );
  }
}

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

function serviceRoleKeyExposedInClientBundle(): boolean {
  const roots = [
    resolve(process.cwd(), "src", "app"),
    resolve(process.cwd(), "src", "features"),
    resolve(process.cwd(), "src", "components"),
  ];
  const stack = [...roots];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        stack.push(fullPath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
        const content = readFileSync(fullPath, "utf8");
        if (content.includes("SUPABASE_SERVICE_ROLE_KEY")) {
          return true;
        }
      }
    }
  }
  return false;
}

async function main() {
  console.log("Module 13B live verification (Supabase Storage)");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = resolveReportStorageBucket(process.env.REPORT_STORAGE_BUCKET);

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Module 13B verification.",
    );
    process.exit(1);
  }

  let module13Committed = false;
  try {
    const log = execSync("git log --oneline -20", { encoding: "utf8" });
    module13Committed = log.includes("Module 13");
  } catch {
    module13Committed = false;
  }
  record(
    0,
    "Module 13 committed on branch",
    module13Committed,
    module13Committed
      ? "Found Module 13 in recent git log"
      : "Module 13 commit not found (expected before 13B approval)",
  );

  record(
    1,
    "Supabase env vars present",
    Boolean(supabaseUrl && serviceRoleKey),
    `bucket=${bucket}`,
  );

  let bucketIsPrivate = false;
  try {
    await ensurePrivateReportBucketForVerify({
      bucket,
      supabaseUrl,
      serviceRoleKey,
    });
    const visibility = await getReportBucketVisibility({
      bucket,
      supabaseUrl,
      serviceRoleKey,
    });
    bucketIsPrivate = !visibility.isPublic;
    record(
      2,
      "Report bucket exists and is private",
      bucketIsPrivate,
      `${visibility.bucket} public=${visibility.isPublic}`,
    );
  } catch (error) {
    record(
      2,
      "Report bucket exists and is private",
      false,
      error instanceof Error ? error.message : String(error),
    );
    printSummary();
    process.exit(1);
  }

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
  validatePdfReportContext(context);

  const pdfBuffer = await renderPdfReportBuffer(context);
  record(
    3,
    "PDF generation still succeeds",
    isPdfBuffer(pdfBuffer) && pdfBuffer.byteLength > 1024,
    `bytes=${pdfBuffer.byteLength}`,
  );
  record(
    4,
    "PDF buffer is non-empty",
    pdfBuffer.byteLength > 1024,
    `bytes=${pdfBuffer.byteLength}`,
  );
  record(
    5,
    "PDF has at least 2 pages",
    countPdfPages(pdfBuffer) >= 2,
    `pages=${countPdfPages(pdfBuffer)}`,
  );

  const uploaded = await saveReportPdfToSupabase({
    assessmentSessionId: session.id,
    pdfBuffer,
    bucket,
    supabaseUrl,
    serviceRoleKey,
  });

  record(
    6,
    "PDF uploads to Supabase Storage",
    uploaded.storageProvider === "supabase",
    uploaded.storagePath,
  );
  record(
    7,
    "Upload returns storage key not public URL",
    !uploaded.storagePath.startsWith("http"),
    uploaded.storagePath,
  );
  record(
    8,
    "Storage path uses approved format",
    isValidReportStorageKey(uploaded.storagePath) &&
      uploaded.storagePath === buildReportStorageKey(session.id),
    uploaded.storagePath,
  );

  await db
    .update(reports)
    .set({
      storagePath: uploaded.storagePath,
      status: "generated",
      generatedAt: new Date(),
    })
    .where(eq(reports.assessmentSessionId, session.id));

  const [reportRow] = await db
    .select()
    .from(reports)
    .where(eq(reports.assessmentSessionId, session.id))
    .limit(1);

  record(
    9,
    "reports.storage_path is set",
    reportRow?.storagePath === uploaded.storagePath,
    reportRow?.storagePath ?? "missing",
  );
  record(
    10,
    "Report status is generated",
    reportRow?.status === "generated",
    reportRow?.status ?? "n/a",
  );
  record(
    11,
    "generated_at is set",
    reportRow?.generatedAt != null,
    reportRow?.generatedAt?.toISOString() ?? "null",
  );

  const downloaded = await downloadReportPdfFromSupabase({
    storagePath: uploaded.storagePath,
    bucket,
    supabaseUrl,
    serviceRoleKey,
  });
  record(
    12,
    "Uploaded PDF can be downloaded server-side",
    downloaded.byteLength === pdfBuffer.byteLength,
    `bytes=${downloaded.byteLength}`,
  );

  const secondBuffer = await renderPdfReportBuffer(context);
  await saveReportPdfToSupabase({
    assessmentSessionId: session.id,
    pdfBuffer: secondBuffer,
    bucket,
    supabaseUrl,
    serviceRoleKey,
  });

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
    "Regeneration keeps same storage key",
    reportRows[0]?.storagePath === uploaded.storagePath,
    reportRows[0]?.storagePath ?? "missing",
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
    15,
    "No email events created",
    emailEventRows.length === 0,
    `count=${emailEventRows.length}`,
  );
  record(
    16,
    "No CTA events created",
    ctaRows.length === 0,
    `count=${ctaRows.length}`,
  );
  record(
    17,
    "No lead events created for verify session",
    leadRows.length === 0,
    `count=${leadRows.length}`,
  );
  record(
    18,
    "No public download route added",
    !hasPublicDownloadRoute(),
    hasPublicDownloadRoute() ? "route found" : "none found",
  );
  record(
    19,
    "Service role key not referenced in client bundle paths",
    !serviceRoleKeyExposedInClientBundle(),
    serviceRoleKeyExposedInClientBundle()
      ? "found in client path"
      : "not found",
  );

  await client.end();
  printSummary();
  process.exit(results.some((r) => !r.pass) ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Helpers duplicated from verify-module13 to avoid importing server-only services.

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
