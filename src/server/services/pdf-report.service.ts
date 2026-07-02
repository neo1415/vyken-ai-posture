import "server-only";

import { validatePdfReportContext } from "@/features/pdf-report/pdf-validation";
import {
  countPdfPages,
  renderPdfReportBuffer,
} from "@/features/pdf-report/pdf-report-renderer";
import type { ReportContext } from "@/features/report-context/types";
import type {
  PdfReportResult,
  PdfReportStatus,
} from "@/features/pdf-report/types";
import { PdfReportError } from "@/features/pdf-report/types";
import { isValidPublicTokenFormat } from "@/lib/security/public-token";
import {
  getReportByPublicToken,
  updateReportPdfGenerated,
} from "@/server/repositories/reports.repository";
import { buildReportContextForAssessment } from "@/server/services/report-context.service";
import { saveReportPdf } from "@/server/storage/report-storage";

export class PdfReportServiceError extends PdfReportError {}

export async function generatePdfReportForAssessment(
  publicToken: string,
): Promise<PdfReportResult> {
  const token = publicToken.trim();
  if (!isValidPublicTokenFormat(token)) {
    throw new PdfReportServiceError(
      "This assessment session could not be verified.",
    );
  }

  let report = await getReportByPublicToken(token);
  let context = (report?.reportContext ?? null) as ReportContext | null;

  if (!context) {
    const built = await buildReportContextForAssessment(token);
    context = built.context;
    report = await getReportByPublicToken(token);
  }

  if (!context || !report) {
    throw new PdfReportServiceError("Report context is unavailable.");
  }

  validatePdfReportContext(context);

  const buffer = await renderPdfReportBuffer(context);
  const pageCount = countPdfPages(buffer);
  if (pageCount < 2) {
    throw new PdfReportServiceError(
      `PDF generation produced insufficient pages (${pageCount}).`,
    );
  }

  const { storagePath } = await saveReportPdf({
    assessmentSessionId: report.assessmentSessionId,
    buffer,
  });

  const generatedAt = new Date();
  await updateReportPdfGenerated({
    assessmentSessionId: report.assessmentSessionId,
    storagePath,
    generatedAt,
  });

  return {
    generated: true,
    status: "generated",
    generatedAt: generatedAt.toISOString(),
    reportContextVersion: context.reportContextVersion,
  };
}

export async function getPdfReportStatus(
  publicToken: string,
): Promise<PdfReportStatus | null> {
  const token = publicToken.trim();
  if (!isValidPublicTokenFormat(token)) {
    return null;
  }

  const report = await getReportByPublicToken(token);
  if (!report) {
    return null;
  }

  const context = report.reportContext as ReportContext | null;

  return {
    status: report.status,
    hasPdf: Boolean(report.storagePath),
    generatedAt: report.generatedAt?.toISOString() ?? null,
    reportContextVersion: context?.reportContextVersion ?? null,
  };
}
