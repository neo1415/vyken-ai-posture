/**
 * Live Module 14 verification — email delivery with PDF attachment.
 * Run: pnpm verify:module14
 */
import { randomBytes } from "node:crypto";
import { execSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { config } from "dotenv";
import { and, eq } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { ASSESSMENT_QUESTIONS } from "@/features/assessment-wizard/questions";
import { isAgenticSectionRequired } from "@/features/assessment-wizard/agentic-trigger";
import {
  PDF_ATTACHMENT_FILENAME,
  UUID_PATTERN,
} from "@/features/email-delivery/constants";
import {
  buildInternalNotificationEmail,
  buildUserReportEmail,
  collectUserEmailVisibleText,
} from "@/features/email-delivery/email-templates";
import {
  INTERNAL_NOTIFICATION_EMAIL_TYPE,
  USER_REPORT_EMAIL_TYPE,
  type EmailDeliveryResult,
} from "@/features/email-delivery/types";
import {
  validateConsentForDelivery,
  validateInternalNotificationEmailContent,
  validateLeadEmailForDelivery,
  validatePdfAttachment,
  validateUserReportEmailContent,
} from "@/features/email-delivery/validation";
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
import {
  generatePublicToken,
  isValidPublicTokenFormat,
} from "@/lib/security/public-token";
import { DevEmailProvider } from "@/server/email/dev-email-provider";
import { resolveReportStorageBucket } from "@/server/storage/report-storage.constants";
import {
  downloadReportPdfFromSupabase,
  saveReportPdfToSupabase,
} from "@/server/storage/supabase-report-storage";

const VERIFY_COMPANY_NAME = "Module 14 Verify Co";
const VERIFY_EMAIL = "module14.verify@vyken-test.example";

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

function resolveInternalRecipientEmail(): string {
  return (
    process.env.VYKEN_INTERNAL_LEAD_EMAIL?.trim() ||
    process.env.INTERNAL_NOTIFICATION_EMAIL?.trim() ||
    "internal-leads@vyken.security"
  );
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

async function hasSuccessfulReportEmailForAssessment(
  db: ReturnType<typeof createScriptDb>["db"],
  assessmentSessionId: string,
): Promise<boolean> {
  const rows = await db
    .select()
    .from(emailEvents)
    .where(
      and(
        eq(emailEvents.assessmentSessionId, assessmentSessionId),
        eq(emailEvents.emailType, USER_REPORT_EMAIL_TYPE),
        eq(emailEvents.status, "sent"),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

async function insertEmailEvent(
  db: ReturnType<typeof createScriptDb>["db"],
  input: {
    assessmentSessionId: string;
    leadId: string | null;
    reportId: string | null;
    emailType: string;
    status: "pending" | "sent" | "failed" | "bounced";
    provider: string | null;
    providerMessageId: string | null;
    errorMessage: string | null;
    sentAt: Date | null;
  },
) {
  const [created] = await db
    .insert(emailEvents)
    .values({
      assessmentSessionId: input.assessmentSessionId,
      leadId: input.leadId,
      reportId: input.reportId,
      emailType: input.emailType,
      status: input.status,
      provider: input.provider,
      providerMessageId: input.providerMessageId,
      errorMessage: input.errorMessage,
      sentAt: input.sentAt,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create email event.");
  }

  return created;
}

async function sendAssessmentReportEmailInline(input: {
  db: ReturnType<typeof createScriptDb>["db"];
  publicToken: string;
  force?: boolean;
  bucket: string;
  supabaseUrl: string;
  serviceRoleKey: string;
  internalRecipient: string;
  provider: DevEmailProvider;
}): Promise<EmailDeliveryResult> {
  const tokenValue = input.publicToken.trim();
  const force = input.force ?? false;

  if (!isValidPublicTokenFormat(tokenValue)) {
    throw new Error("This assessment session could not be verified.");
  }

  const [session] = await input.db
    .select()
    .from(assessmentSessions)
    .where(eq(assessmentSessions.publicToken, tokenValue))
    .limit(1);

  if (!session) {
    throw new Error("Assessment session not found.");
  }

  const [lead] = await input.db
    .select()
    .from(leads)
    .where(eq(leads.assessmentSessionId, session.id))
    .limit(1);

  if (!lead) {
    throw new Error(
      "A captured lead is required before sending the report email.",
    );
  }

  validateLeadEmailForDelivery(lead.email);
  validateConsentForDelivery(lead.consentToFollowUp);

  if (!force) {
    const alreadySent = await hasSuccessfulReportEmailForAssessment(
      input.db,
      session.id,
    );
    if (alreadySent) {
      return {
        outcome: "already_sent",
        userEmailSent: false,
        internalEmailSent: false,
        userEmailStatus: "already_sent",
        internalEmailStatus: "skipped",
        provider: "none",
      };
    }
  }

  const [report] = await input.db
    .select()
    .from(reports)
    .where(eq(reports.assessmentSessionId, session.id))
    .limit(1);

  if (!report?.storagePath || report.status !== "generated") {
    throw new Error("Report PDF is unavailable.");
  }

  const reportContext = report.reportContext as ReportContext | null;
  if (!reportContext) {
    throw new Error("Report context is unavailable.");
  }

  const pdfBuffer = await downloadReportPdfFromSupabase({
    storagePath: report.storagePath,
    bucket: input.bucket,
    supabaseUrl: input.supabaseUrl,
    serviceRoleKey: input.serviceRoleKey,
  });

  validatePdfAttachment({
    buffer: pdfBuffer,
    filename: PDF_ATTACHMENT_FILENAME,
  });

  const userEmail = buildUserReportEmail({ leadName: lead.name });
  validateUserReportEmailContent(userEmail);

  const internalEmail = buildInternalNotificationEmail({
    leadEmail: lead.email,
    leadName: lead.name,
    companyName: lead.companyName,
    role: lead.role,
    followUpInterest: lead.mainAiConcern,
    reportContext,
    reportStatus: report.status,
    publicToken: tokenValue,
  });
  validateInternalNotificationEmailContent(internalEmail);

  let userEmailSent = false;
  let internalEmailSent = false;
  let userEmailStatus: EmailDeliveryResult["userEmailStatus"] = "failed";
  let internalEmailStatus: EmailDeliveryResult["internalEmailStatus"] =
    "failed";

  const userResult = await input.provider.sendEmail({
    to: lead.email,
    subject: userEmail.subject,
    html: userEmail.html,
    text: userEmail.text,
    attachments: [
      {
        filename: PDF_ATTACHMENT_FILENAME,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  userEmailSent = userResult.accepted;
  userEmailStatus = userEmailSent ? "sent" : "failed";

  await insertEmailEvent(input.db, {
    assessmentSessionId: session.id,
    leadId: lead.id,
    reportId: report.id,
    emailType: USER_REPORT_EMAIL_TYPE,
    status: userEmailSent ? "sent" : "failed",
    provider: userResult.provider,
    providerMessageId: userResult.providerMessageId,
    errorMessage: userEmailSent ? null : "User report email was not accepted.",
    sentAt: userEmailSent ? new Date() : null,
  });

  if (!userEmailSent) {
    throw new Error("User report email was not accepted.");
  }

  const internalResult = await input.provider.sendEmail({
    to: input.internalRecipient,
    subject: internalEmail.subject,
    html: internalEmail.html,
    text: internalEmail.text,
  });

  internalEmailSent = internalResult.accepted;
  internalEmailStatus = internalEmailSent ? "sent" : "failed";

  await insertEmailEvent(input.db, {
    assessmentSessionId: session.id,
    leadId: lead.id,
    reportId: report.id,
    emailType: INTERNAL_NOTIFICATION_EMAIL_TYPE,
    status: internalEmailSent ? "sent" : "failed",
    provider: internalResult.provider,
    providerMessageId: internalResult.providerMessageId,
    errorMessage: internalEmailSent
      ? null
      : "Internal notification email was not accepted.",
    sentAt: internalEmailSent ? new Date() : null,
  });

  return {
    outcome: userEmailSent && internalEmailSent ? "sent" : "partial_failure",
    userEmailSent,
    internalEmailSent,
    userEmailStatus,
    internalEmailStatus,
    provider: input.provider.name,
  };
}

async function main() {
  console.log("Module 14 live verification (email delivery)");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = resolveReportStorageBucket(process.env.REPORT_STORAGE_BUCKET);

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Module 14 verification.",
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
      : "Module 13 commit not found (expected before Module 14 approval)",
  );

  record(
    1,
    "Supabase env vars present",
    Boolean(supabaseUrl && serviceRoleKey),
    `bucket=${bucket}`,
  );

  const { db, client } = createScriptDb();
  const publicToken = token();
  const provider = new DevEmailProvider();
  const internalRecipient = resolveInternalRecipientEmail();

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
    2,
    "PDF generation succeeds",
    isPdfBuffer(pdfBuffer) && pdfBuffer.byteLength > 1024,
    `bytes=${pdfBuffer.byteLength}, pages=${countPdfPages(pdfBuffer)}`,
  );

  const uploaded = await saveReportPdfToSupabase({
    assessmentSessionId: session.id,
    pdfBuffer,
    bucket,
    supabaseUrl,
    serviceRoleKey,
  });

  record(
    3,
    "PDF uploads to Supabase Storage",
    uploaded.storageProvider === "supabase",
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

  const downloaded = await downloadReportPdfFromSupabase({
    storagePath: uploaded.storagePath,
    bucket,
    supabaseUrl,
    serviceRoleKey,
  });
  record(
    4,
    "Uploaded PDF can be downloaded server-side",
    downloaded.byteLength === pdfBuffer.byteLength,
    `bytes=${downloaded.byteLength}`,
  );

  const [lead] = await db
    .insert(leads)
    .values({
      assessmentSessionId: session.id,
      email: VERIFY_EMAIL,
      name: "Module 14 Verify",
      companyName: VERIFY_COMPANY_NAME,
      role: "Security lead",
      mainAiConcern: "policy_gaps",
      consentToFollowUp: true,
      leadScore: scoringResult.overallScore,
      status: "new",
    })
    .returning();

  record(
    5,
    "Lead captured with consent",
    lead != null &&
      lead.consentToFollowUp === true &&
      lead.email === VERIFY_EMAIL,
    lead ? `email=${lead.email}, consent=${lead.consentToFollowUp}` : "missing",
  );

  const userEmailPreview = buildUserReportEmail({
    leadName: lead?.name ?? null,
  });
  let userEmailValid = false;
  try {
    validateUserReportEmailContent(userEmailPreview);
    userEmailValid = true;
  } catch (error) {
    record(
      6,
      "User report email content validates",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }
  if (userEmailValid) {
    record(6, "User report email content validates", true, "passed validation");
  }

  const internalEmailPreview = buildInternalNotificationEmail({
    leadEmail: VERIFY_EMAIL,
    leadName: lead?.name ?? null,
    companyName: VERIFY_COMPANY_NAME,
    role: lead?.role ?? null,
    followUpInterest: lead?.mainAiConcern ?? null,
    reportContext: context,
    reportStatus: "generated",
    publicToken,
  });
  let internalEmailValid = false;
  try {
    validateInternalNotificationEmailContent(internalEmailPreview);
    internalEmailValid = true;
  } catch (error) {
    record(
      7,
      "Internal notification email content validates",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }
  if (internalEmailValid) {
    record(
      7,
      "Internal notification email content validates",
      true,
      "passed validation",
    );
  }

  let pdfAttachmentValid = false;
  try {
    validatePdfAttachment({
      buffer: downloaded,
      filename: PDF_ATTACHMENT_FILENAME,
    });
    pdfAttachmentValid = true;
  } catch (error) {
    record(
      8,
      "PDF attachment validates",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }
  if (pdfAttachmentValid) {
    record(8, "PDF attachment validates", true, PDF_ATTACHMENT_FILENAME);
  }

  const deliveryResult = await sendAssessmentReportEmailInline({
    db,
    publicToken,
    bucket,
    supabaseUrl,
    serviceRoleKey,
    internalRecipient,
    provider,
  });

  record(
    9,
    "User report email sent via DevEmailProvider",
    deliveryResult.userEmailSent,
    `status=${deliveryResult.userEmailStatus}, provider=${deliveryResult.provider}`,
  );
  record(
    10,
    "Internal notification email sent",
    deliveryResult.internalEmailSent,
    `status=${deliveryResult.internalEmailStatus}`,
  );

  const emailEventRows = await db
    .select()
    .from(emailEvents)
    .where(eq(emailEvents.assessmentSessionId, session.id));

  const userSentEvents = emailEventRows.filter(
    (event) =>
      event.emailType === USER_REPORT_EMAIL_TYPE && event.status === "sent",
  );
  const internalSentEvents = emailEventRows.filter(
    (event) =>
      event.emailType === INTERNAL_NOTIFICATION_EMAIL_TYPE &&
      event.status === "sent",
  );

  record(
    11,
    "User report email_events row recorded",
    userSentEvents.length === 1 && userSentEvents[0]?.provider === "dev",
    `count=${userSentEvents.length}, provider=${userSentEvents[0]?.provider ?? "n/a"}`,
  );
  record(
    12,
    "Internal notification email_events row recorded",
    internalSentEvents.length === 1,
    `count=${internalSentEvents.length}`,
  );

  const userVisibleText = collectUserEmailVisibleText(userEmailPreview);
  record(
    13,
    "PDF attachment filename is safe",
    PDF_ATTACHMENT_FILENAME === "ai-governance-risk-report.pdf" &&
      deliveryResult.userEmailSent,
    PDF_ATTACHMENT_FILENAME,
  );
  record(
    14,
    "User email has no storage path",
    !userVisibleText.includes("storage/reports") &&
      !userVisibleText.includes("assessment-reports") &&
      !userVisibleText.includes(uploaded.storagePath),
    "no storage paths in visible text",
  );
  record(
    15,
    "User email has no raw UUID",
    !UUID_PATTERN.test(userVisibleText),
    "no UUIDs in user email body",
  );
  record(
    16,
    "User email has no URLs",
    !userVisibleText.includes("http://") &&
      !userVisibleText.includes("https://"),
    "no URLs in user email",
  );
  record(
    17,
    "User email includes approved disclaimer",
    userVisibleText
      .toLowerCase()
      .includes(
        "not a legal opinion, audit, certification, or live technical scan",
      ),
    "disclaimer present",
  );

  const duplicateResult = await sendAssessmentReportEmailInline({
    db,
    publicToken,
    bucket,
    supabaseUrl,
    serviceRoleKey,
    internalRecipient,
    provider,
  });

  const userSentAfterDuplicate = (
    await db
      .select()
      .from(emailEvents)
      .where(
        and(
          eq(emailEvents.assessmentSessionId, session.id),
          eq(emailEvents.emailType, USER_REPORT_EMAIL_TYPE),
          eq(emailEvents.status, "sent"),
        ),
      )
  ).length;

  record(
    18,
    "Duplicate send blocked without force",
    duplicateResult.outcome === "already_sent" && userSentAfterDuplicate === 1,
    `outcome=${duplicateResult.outcome}, user_sent_count=${userSentAfterDuplicate}`,
  );

  const ctaRows = await db
    .select()
    .from(ctaEvents)
    .where(eq(ctaEvents.assessmentSessionId, session.id));

  record(
    19,
    "No CTA events created",
    ctaRows.length === 0,
    `count=${ctaRows.length}`,
  );

  let consentBlocks = false;
  try {
    validateConsentForDelivery(false);
  } catch {
    consentBlocks = true;
  }
  record(
    20,
    "Consent=false blocks delivery",
    consentBlocks,
    consentBlocks ? "validation rejected missing consent" : "validation failed",
  );

  const noLeadToken = token();
  await db.insert(assessmentSessions).values({
    publicToken: noLeadToken,
    status: "started",
  });

  let missingLeadBlocks = false;
  try {
    await sendAssessmentReportEmailInline({
      db,
      publicToken: noLeadToken,
      bucket,
      supabaseUrl,
      serviceRoleKey,
      internalRecipient,
      provider,
    });
  } catch (error) {
    missingLeadBlocks =
      error instanceof Error &&
      error.message.includes("captured lead is required");
  }
  record(
    21,
    "Missing lead blocks delivery",
    missingLeadBlocks,
    missingLeadBlocks ? "send rejected without lead" : "send did not reject",
  );

  let invalidTokenBlocks = false;
  try {
    await sendAssessmentReportEmailInline({
      db,
      publicToken: "not-a-valid-token",
      bucket,
      supabaseUrl,
      serviceRoleKey,
      internalRecipient,
      provider,
    });
  } catch (error) {
    invalidTokenBlocks =
      error instanceof Error && error.message.includes("could not be verified");
  }
  record(
    22,
    "Invalid token blocks delivery",
    invalidTokenBlocks && !isValidPublicTokenFormat("not-a-valid-token"),
    invalidTokenBlocks ? "invalid token rejected" : "invalid token accepted",
  );

  record(
    23,
    "No public download route added",
    !hasPublicDownloadRoute(),
    hasPublicDownloadRoute() ? "route found" : "none found",
  );

  await client.end();
  printSummary();
  process.exit(results.some((r) => !r.pass) ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Helpers duplicated from verify-module13b to avoid importing server-only services.

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
      hasLead: true,
      email: VERIFY_EMAIL,
      name: "Module 14 Verify",
      companyName: VERIFY_COMPANY_NAME,
      role: "Security lead",
      followUpInterest: "policy_gaps",
      consentToFollowUp: true,
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
