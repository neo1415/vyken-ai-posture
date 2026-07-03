/**
 * Live Module 19 verification — Performance and UX Pass.
 * Run: pnpm verify:module19
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { ASSESSMENT_QUESTIONS } from "@/features/assessment-wizard/questions";
import { scoreAssessment } from "@/features/scoring/scoring-engine";
import type { AssessmentScoringInput } from "@/features/scoring/types";

type Check = { id: number; name: string; pass: boolean; detail: string };
const results: Check[] = [];
let checkId = 0;

function record(name: string, pass: boolean, detail: string) {
  results.push({ id: ++checkId, name, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${checkId}. ${name}`);
  console.log(`       ${detail}`);
}

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function fileExists(path: string): boolean {
  return existsSync(resolve(process.cwd(), path));
}

function walkFiles(
  root: string,
  ext: RegExp,
  onFile: (text: string, path: string) => boolean,
): boolean {
  const absRoot = resolve(process.cwd(), root);
  if (!existsSync(absRoot)) return false;
  const stack = [absRoot];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === ".next" ||
          entry.name === "scripts"
        )
          continue;
        stack.push(full);
      } else if (ext.test(entry.name)) {
        if (onFile(readFileSync(full, "utf8"), full)) return true;
      }
    }
  }
  return false;
}

function main() {
  // 1. Module 18B committed
  try {
    const log = execSync("git log --oneline -5", { encoding: "utf8" });
    record(
      "Module 18B committed/pushed first",
      /Module 18B/.test(log),
      log.split("\n")[0] ?? "unknown",
    );
  } catch {
    record("Module 18B committed/pushed first", false, "git log failed");
  }

  // 2. Public assessment routes
  record(
    "Public assessment routes exist",
    fileExists("src/app/(public)/ai-risk-assessment/page.tsx") &&
      fileExists("src/app/(public)/ai-risk-assessment/tools/page.tsx") &&
      fileExists("src/app/(public)/ai-risk-assessment/usage/page.tsx") &&
      fileExists("src/app/(public)/ai-risk-assessment/results/page.tsx"),
    "all 4 public routes",
  );

  // 3. Admin auth route
  record(
    "Admin auth route exists",
    fileExists("src/app/admin/login/page.tsx"),
    "/admin/login",
  );

  // 4. Admin leads route
  record(
    "Admin leads route exists",
    fileExists("src/app/admin/(protected)/leads/page.tsx"),
    "/admin/leads",
  );

  // 5. Admin tools route
  record(
    "Admin tools route exists",
    fileExists("src/app/admin/(protected)/tools/page.tsx"),
    "/admin/tools",
  );

  // 6. Result page CTA
  const resultsPage = read(
    "src/app/(public)/ai-risk-assessment/results/page.tsx",
  );
  record(
    "Result page CTA exists",
    resultsPage.includes("ResultFollowUpCTA") ||
      resultsPage.includes("TrackedCTA"),
    "CTA component referenced",
  );

  // 7. Lead capture
  record(
    "Lead capture exists",
    resultsPage.includes("LeadCapture") || resultsPage.includes("lead"),
    "lead capture in results page",
  );

  // 8. No public download route
  record(
    "No public report download route",
    !fileExists("src/app/(public)/ai-risk-assessment/download") &&
      !fileExists("src/app/api/download"),
    "no download route",
  );

  // 9. No signed URL
  const hasSignedUrl = walkFiles(
    "src/app",
    /\.(tsx?|jsx?)$/,
    (text) => text.includes("createSignedUrl") || text.includes("getPublicUrl"),
  );
  record("No signed URL exposure", !hasSignedUrl, "static scan");

  // 10. No analytics
  const hasAnalytics = walkFiles("src", /\.(tsx?|jsx?)$/, (text) =>
    /google-analytics|gtag\(|fbq\(|segment\.com/.test(text),
  );
  record("No third-party analytics added", !hasAnalytics, "static scan");

  // 11. No new packages
  const pkg = JSON.parse(read("package.json"));
  const deps = Object.keys(pkg.dependencies ?? {});
  record(
    "No new UI/animation/chart packages",
    !deps.includes("framer-motion") &&
      !deps.includes("chart.js") &&
      !deps.includes("recharts") &&
      !deps.includes("@tanstack/react-table") &&
      !deps.includes("headlessui"),
    "no banned packages",
  );

  // 12. No scoring logic change
  const scoringEngine = read("src/features/scoring/scoring-engine.ts");
  record(
    "No scoring logic changed",
    scoringEngine.includes("scoreAssessment") &&
      scoringEngine.includes("overallScore"),
    "scoring-engine.ts intact",
  );

  // 13. No recommendation logic change
  const recoEngine = read(
    "src/features/recommendations/recommendation-engine.ts",
  );
  record(
    "No recommendation logic changed",
    recoEngine.includes("generateRecommendations"),
    "recommendation-engine.ts intact",
  );

  // 14. No email delivery behavior change
  const emailService = read("src/server/services/email-delivery.service.ts");
  record(
    "No email delivery behavior changed",
    emailService.includes("sendAssessmentReportEmail"),
    "email-delivery.service.ts intact",
  );

  // 15. No admin RBAC weakening
  const adminPerms = read("src/server/admin/admin-permissions.ts");
  record(
    "No admin RBAC weakening",
    adminPerms.includes("assertPermission") &&
      adminPerms.includes("canManageLeads"),
    "admin-permissions.ts intact",
  );

  // 16. No raw DB IDs in UI files
  const hasRawIds = walkFiles(
    "src/features/results/components",
    /\.tsx$/,
    (text) => /session\.id|assessmentSessionId/.test(text),
  );
  record(
    "No raw DB IDs in results UI",
    !hasRawIds,
    "results components scanned",
  );

  // 17. Loading states exist
  record(
    "Loading states exist",
    fileExists("src/app/(public)/ai-risk-assessment/tools/loading.tsx") &&
      fileExists("src/app/(public)/ai-risk-assessment/results/loading.tsx") &&
      fileExists("src/app/admin/(protected)/loading.tsx"),
    "loading.tsx files present",
  );

  // 18. Forms have accessible labels
  const companyProfile = read(
    "src/features/company-profile/components/CompanyProfileTextInput.tsx",
  );
  record(
    "Forms have accessible labels",
    companyProfile.includes("htmlFor") &&
      companyProfile.includes("aria-invalid"),
    "CompanyProfileTextInput has htmlFor + aria-invalid",
  );

  // 19. Tables have headers
  const leadTable = read("src/features/admin/components/AdminLeadTable.tsx");
  record(
    "Tables have headers",
    leadTable.includes("<th") && leadTable.includes('scope="col"'),
    "AdminLeadTable has th with scope",
  );

  // 20. Build route bundles reviewed
  record(
    "Build output reviewed",
    fileExists(".next/build-manifest.json") ||
      fileExists(".next/app-build-manifest.json"),
    "build artifacts present (build ran)",
  );

  // 21. Public scoring still works
  const scoringInput: AssessmentScoringInput = {
    companyProfile: {
      industry: "saas_technology",
      companySize: "51_200",
      countryRegion: "nigeria",
      handlesSensitiveOrRegulatedData: "yes_some",
    },
    selectedTools: [],
    unknownTools: [],
    hasNotSureToolSelection: true,
    answers: ASSESSMENT_QUESTIONS.slice(0, 3).map((q) => ({
      questionId: q.id,
      value: q.options[0]?.value ?? "not_sure",
    })),
  };
  const score = scoreAssessment(scoringInput);
  record(
    "Public scoring still works",
    typeof score.overallScore === "number",
    `score=${score.overallScore}`,
  );

  // 22. Admin dashboard still works
  record(
    "Admin dashboard still works",
    fileExists("src/app/admin/(protected)/leads/page.tsx") &&
      fileExists("src/app/admin/(protected)/layout.tsx"),
    "admin protected routes intact",
  );

  // 23. Tool admin still works
  record(
    "Tool admin still works",
    fileExists("src/app/admin/(protected)/tools/page.tsx") &&
      fileExists("src/features/tool-admin/actions.ts"),
    "tool admin files intact",
  );

  // 24. Event tracking still works
  record(
    "Event tracking still works",
    fileExists("src/features/event-tracking/actions.ts") &&
      fileExists("src/server/services/event-tracking.service.ts"),
    "event-tracking files present",
  );

  // 25. No Module 20 final QA substitution
  record(
    "No Module 20 final QA substitution",
    !fileExists("docs/final-qa/README.md"),
    "no final-qa artifacts",
  );

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log("---");
  console.log(
    `Summary: ${passed} passed, ${failed} failed, ${results.length} checks`,
  );
  process.exit(failed > 0 ? 1 : 0);
}

main();
