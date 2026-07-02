import "server-only";

import { serverEnv } from "@/lib/config/env.server";
import { getSupabaseServiceClient } from "@/lib/supabase/server-client";
import { saveReportPdfLocally } from "@/server/storage/local-report-storage";
import {
  isValidReportStorageKey,
  resolveReportStorageBucket,
} from "@/server/storage/report-storage.constants";
import {
  saveReportPdfToSupabase,
  type SaveReportPdfToSupabaseResult,
} from "@/server/storage/supabase-report-storage";

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
