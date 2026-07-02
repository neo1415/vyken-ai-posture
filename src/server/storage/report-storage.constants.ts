export const REPORT_STORAGE_BUCKET_DEFAULT = "assessment-reports";

export const REPORT_PDF_FILENAME = "ai-governance-risk-report.pdf";

export const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const STORAGE_PATH_PATTERN =
  /^reports\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/ai-governance-risk-report\.pdf$/i;

export function buildReportStorageKey(assessmentSessionId: string): string {
  if (!SESSION_ID_PATTERN.test(assessmentSessionId)) {
    throw new Error("Invalid assessment session storage key.");
  }
  return `reports/${assessmentSessionId}/${REPORT_PDF_FILENAME}`;
}

export function isValidReportStorageKey(storagePath: string): boolean {
  return STORAGE_PATH_PATTERN.test(storagePath) && !storagePath.includes("..");
}

export function resolveReportStorageBucket(bucket?: string): string {
  return bucket?.trim() || REPORT_STORAGE_BUCKET_DEFAULT;
}
