import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServiceClient } from "@/lib/supabase/create-service-client";
import {
  buildReportStorageKey,
  isValidReportStorageKey,
  resolveReportStorageBucket,
} from "@/server/storage/report-storage.constants";

export class SupabaseReportStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseReportStorageError";
  }
}

export type SaveReportPdfToSupabaseInput = {
  assessmentSessionId: string;
  pdfBuffer: Buffer;
  bucket?: string;
  supabaseUrl: string;
  serviceRoleKey: string;
};

export type SaveReportPdfToSupabaseResult = {
  storagePath: string;
  storageProvider: "supabase";
  bucket: string;
};

export async function assertPrivateReportBucket(
  client: SupabaseClient,
  bucket: string,
): Promise<void> {
  const { data, error } = await client.storage.getBucket(bucket);

  if (error || !data) {
    throw new SupabaseReportStorageError(
      `Storage bucket "${bucket}" is not available. Create a private bucket in Supabase Dashboard. See docs/pdf-report/storage-notes.md`,
    );
  }

  if (data.public) {
    throw new SupabaseReportStorageError(
      `Storage bucket "${bucket}" must remain private.`,
    );
  }
}

export async function saveReportPdfToSupabase(
  input: SaveReportPdfToSupabaseInput,
): Promise<SaveReportPdfToSupabaseResult> {
  if (!input.pdfBuffer.length) {
    throw new SupabaseReportStorageError("Cannot store an empty PDF buffer.");
  }

  const bucket = resolveReportStorageBucket(input.bucket);
  const storagePath = buildReportStorageKey(input.assessmentSessionId);

  if (!isValidReportStorageKey(storagePath)) {
    throw new SupabaseReportStorageError("Invalid report storage key.");
  }

  const client = createSupabaseServiceClient({
    supabaseUrl: input.supabaseUrl,
    serviceRoleKey: input.serviceRoleKey,
  });

  await assertPrivateReportBucket(client, bucket);

  const { error } = await client.storage
    .from(bucket)
    .upload(storagePath, input.pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
      cacheControl: "3600",
    });

  if (error) {
    throw new SupabaseReportStorageError(
      `Failed to upload report PDF: ${error.message}`,
    );
  }

  return {
    storagePath,
    storageProvider: "supabase",
    bucket,
  };
}

export async function downloadReportPdfFromSupabase(input: {
  storagePath: string;
  bucket?: string;
  supabaseUrl: string;
  serviceRoleKey: string;
}): Promise<Buffer> {
  if (!isValidReportStorageKey(input.storagePath)) {
    throw new SupabaseReportStorageError("Invalid report storage key.");
  }

  const bucket = resolveReportStorageBucket(input.bucket);
  const client = createSupabaseServiceClient({
    supabaseUrl: input.supabaseUrl,
    serviceRoleKey: input.serviceRoleKey,
  });

  const { data, error } = await client.storage
    .from(bucket)
    .download(input.storagePath);

  if (error || !data) {
    throw new SupabaseReportStorageError(
      `Failed to download report PDF: ${error?.message ?? "missing object"}`,
    );
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function getReportBucketVisibility(input: {
  bucket?: string;
  supabaseUrl: string;
  serviceRoleKey: string;
}): Promise<{ bucket: string; isPublic: boolean }> {
  const bucket = resolveReportStorageBucket(input.bucket);
  const client = createSupabaseServiceClient({
    supabaseUrl: input.supabaseUrl,
    serviceRoleKey: input.serviceRoleKey,
  });

  const { data, error } = await client.storage.getBucket(bucket);
  if (error || !data) {
    throw new SupabaseReportStorageError(
      `Storage bucket "${bucket}" is not available.`,
    );
  }

  return { bucket, isPublic: data.public };
}
