import "server-only";

import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { serverEnv } from "@/lib/config/env.server";
import { getSupabaseServiceClient } from "@/lib/supabase/server-client";
import { saveReportPdfLocally } from "@/server/storage/local-report-storage";
import {
  isValidReportStorageKey,
  REPORT_PDF_FILENAME,
  resolveReportStorageBucket,
} from "@/server/storage/report-storage.constants";
import {
  downloadReportPdfFromSupabase,
  saveReportPdfToSupabase,
  type SaveReportPdfToSupabaseResult,
} from "@/server/storage/supabase-report-storage";

const LOCAL_STORAGE_ROOT = resolve(process.cwd(), "storage", "reports");

export class ReportStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportStorageError";
  }
}

export type SaveReportPdfInput = {
  assessmentSessionId: string;
  buffer: Buffer;
};

export type SaveReportPdfResult = {
  storagePath: string;
  storageProvider: "supabase" | "local";
};

function hasSupabaseStorageConfig(): boolean {
  return Boolean(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL && serverEnv.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function saveReportPdf(
  input: SaveReportPdfInput,
): Promise<SaveReportPdfResult> {
  if (hasSupabaseStorageConfig()) {
    try {
      getSupabaseServiceClient();
      const uploaded: SaveReportPdfToSupabaseResult =
        await saveReportPdfToSupabase({
          assessmentSessionId: input.assessmentSessionId,
          pdfBuffer: input.buffer,
          bucket: serverEnv.REPORT_STORAGE_BUCKET,
          supabaseUrl: serverEnv.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey: serverEnv.SUPABASE_SERVICE_ROLE_KEY!,
        });

      return {
        storagePath: uploaded.storagePath,
        storageProvider: uploaded.storageProvider,
      };
    } catch (error) {
      if (serverEnv.NODE_ENV === "development") {
        console.warn(
          "[report-storage] Supabase upload failed; falling back to local storage for development.",
          error,
        );
        const local = await saveReportPdfLocally({
          assessmentSessionId: input.assessmentSessionId,
          pdfBuffer: input.buffer,
        });
        return local;
      }

      throw error instanceof Error
        ? new ReportStorageError(error.message)
        : new ReportStorageError("Supabase report upload failed.");
    }
  }

  if (serverEnv.NODE_ENV === "development") {
    return saveReportPdfLocally({
      assessmentSessionId: input.assessmentSessionId,
      pdfBuffer: input.buffer,
    });
  }

  throw new ReportStorageError(
    "Supabase storage is required in non-development environments.",
  );
}

export function assertValidReportStoragePath(storagePath: string): void {
  if (!isValidReportStorageKey(storagePath)) {
    throw new ReportStorageError("Invalid report storage path.");
  }
}

export function getConfiguredReportStorageBucket(): string {
  return resolveReportStorageBucket(serverEnv.REPORT_STORAGE_BUCKET);
}

function extractSessionIdFromStoragePath(storagePath: string): string {
  const match = storagePath.match(
    /^reports\/([0-9a-f-]{36})\/ai-governance-risk-report\.pdf$/i,
  );
  if (!match?.[1]) {
    throw new ReportStorageError("Invalid report storage path.");
  }
  return match[1];
}

export async function downloadReportPdf(storagePath: string): Promise<Buffer> {
  assertValidReportStoragePath(storagePath);

  if (hasSupabaseStorageConfig()) {
    try {
      return await downloadReportPdfFromSupabase({
        storagePath,
        bucket: serverEnv.REPORT_STORAGE_BUCKET,
        supabaseUrl: serverEnv.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey: serverEnv.SUPABASE_SERVICE_ROLE_KEY!,
      });
    } catch (error) {
      if (serverEnv.NODE_ENV === "development") {
        const sessionId = extractSessionIdFromStoragePath(storagePath);
        const localPath = join(
          LOCAL_STORAGE_ROOT,
          sessionId,
          REPORT_PDF_FILENAME,
        );
        return readFile(localPath);
      }
      throw error instanceof Error
        ? new ReportStorageError(error.message)
        : new ReportStorageError("Failed to download report PDF.");
    }
  }

  if (serverEnv.NODE_ENV === "development") {
    const sessionId = extractSessionIdFromStoragePath(storagePath);
    const localPath = join(LOCAL_STORAGE_ROOT, sessionId, REPORT_PDF_FILENAME);
    return readFile(localPath);
  }

  throw new ReportStorageError(
    "Supabase storage is required to download report PDFs in non-development environments.",
  );
}
