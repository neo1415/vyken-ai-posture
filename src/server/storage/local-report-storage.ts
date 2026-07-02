import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import {
  buildReportStorageKey,
  isValidReportStorageKey,
} from "@/server/storage/report-storage.constants";

const STORAGE_ROOT = resolve(process.cwd(), "storage", "reports");

export class LocalReportStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocalReportStorageError";
  }
}

export async function saveReportPdfLocally(input: {
  assessmentSessionId: string;
  pdfBuffer: Buffer;
}): Promise<{ storagePath: string; storageProvider: "local" }> {
  if (!input.pdfBuffer.length) {
    throw new LocalReportStorageError("Cannot store an empty PDF buffer.");
  }

  const storagePath = buildReportStorageKey(input.assessmentSessionId);
  if (!isValidReportStorageKey(storagePath)) {
    throw new LocalReportStorageError("Invalid report storage key.");
  }

  const sessionDir = join(
    STORAGE_ROOT,
    input.assessmentSessionId.replace(/[^a-f0-9-]/gi, ""),
  );
  await mkdir(sessionDir, { recursive: true });
  await writeFile(
    join(sessionDir, "ai-governance-risk-report.pdf"),
    input.pdfBuffer,
  );

  return {
    storagePath,
    storageProvider: "local",
  };
}
