import type { ReportContext } from "@/features/report-context/types";

export const PDF_REPORT_MODULE_VERSION = "pdf-report-v1" as const;

export type PdfReportResult = {
  generated: true;
  status: "generated";
  generatedAt: string;
  reportContextVersion: ReportContext["reportContextVersion"];
};

export type PdfReportStatus = {
  status: "pending" | "generated" | "failed" | "expired";
  hasPdf: boolean;
  generatedAt: string | null;
  reportContextVersion: ReportContext["reportContextVersion"] | null;
};

export class PdfReportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfReportError";
  }
}
