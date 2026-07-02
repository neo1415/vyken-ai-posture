import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { inflateSync } from "node:zlib";
import React, { type ReactElement } from "react";

import type { ReportContext } from "@/features/report-context/types";

import { PdfReportDocument } from "./pdf-report-document";
import {
  PdfReportValidationError,
  validatePdfReportContext,
} from "./pdf-validation";

export async function renderPdfReportBuffer(
  context: ReportContext,
): Promise<Buffer> {
  validatePdfReportContext(context);

  const buffer = await renderToBuffer(
    (<PdfReportDocument context={context} />) as ReactElement<DocumentProps>,
  );

  if (!buffer || buffer.byteLength === 0) {
    throw new PdfReportValidationError(
      "PDF generation produced an empty buffer.",
    );
  }

  return Buffer.from(buffer);
}

export function countPdfPages(buffer: Buffer): number {
  const content = buffer.toString("latin1");
  const matches = content.match(/\/Type\s*\/Page\b/g);
  return matches?.length ?? 0;
}

function collectLiteralPdfStrings(content: string): string[] {
  const parts: string[] = [];
  const pattern = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
  let match: RegExpExecArray | null = pattern.exec(content);
  while (match !== null) {
    const text = match[1]?.replace(/\\n/g, " ").replace(/\\r/g, " ").trim();
    if (text && text.length > 1 && /^[\x20-\x7E\s]+$/.test(text)) {
      parts.push(text);
    }
    match = pattern.exec(content);
  }
  return parts;
}

function decodePdfHexChar(code: string): string {
  const value = Number.parseInt(code, 16);
  if (Number.isNaN(value)) return "";
  return String.fromCharCode(value);
}

function collectTjArrayStrings(content: string): string[] {
  const parts: string[] = [];
  const pattern = /\[(.*?)\]\s*TJ/g;
  let match: RegExpExecArray | null = pattern.exec(content);
  while (match !== null) {
    const arrayContent = match[1] ?? "";
    let text = "";

    const hexTokens = arrayContent.match(/<([0-9A-Fa-f]+)>/g) ?? [];
    for (const token of hexTokens) {
      const hex = token.slice(1, -1);
      if (hex.length <= 2) {
        text += decodePdfHexChar(hex);
      } else {
        for (let i = 0; i < hex.length; i += 2) {
          text += decodePdfHexChar(hex.slice(i, i + 2));
        }
      }
    }

    const literalTokens =
      arrayContent.match(/\(([^)\\]*(?:\\.[^)\\]*)*)\)/g) ?? [];
    for (const token of literalTokens) {
      text += token.slice(1, -1);
    }

    if (text.trim().length > 0) {
      parts.push(text.trim());
    }

    match = pattern.exec(content);
  }

  return parts;
}

function collectTjLiteralStrings(content: string): string[] {
  const parts: string[] = [];
  const pattern = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
  let match: RegExpExecArray | null = pattern.exec(content);
  while (match !== null) {
    const text = match[1]?.replace(/\\n/g, " ").replace(/\\r/g, " ").trim();
    if (text && text.length > 1) {
      parts.push(text);
    }
    match = pattern.exec(content);
  }
  return parts;
}

function extractFlateStreamBuffers(content: string): Buffer[] {
  const buffers: Buffer[] = [];
  let searchFrom = 0;

  while (searchFrom < content.length) {
    const filterIdx = content.indexOf("/Filter /FlateDecode", searchFrom);
    if (filterIdx === -1) break;

    const streamMarker = content.indexOf("stream", filterIdx);
    if (streamMarker === -1) break;

    let dataStart = streamMarker + "stream".length;
    if (content[dataStart] === "\r") dataStart += 1;
    if (content[dataStart] === "\n") dataStart += 1;

    const endIdx = content.indexOf("endstream", dataStart);
    if (endIdx === -1) break;

    buffers.push(Buffer.from(content.slice(dataStart, endIdx), "binary"));
    searchFrom = endIdx + "endstream".length;
  }

  return buffers;
}

export function extractPdfText(buffer: Buffer): string {
  const content = buffer.toString("latin1");
  const parts = [
    ...collectLiteralPdfStrings(content),
    ...collectTjLiteralStrings(content),
    ...collectTjArrayStrings(content),
  ];

  for (const compressed of extractFlateStreamBuffers(content)) {
    try {
      const decompressed = inflateSync(compressed).toString("latin1");
      parts.push(...collectLiteralPdfStrings(decompressed));
      parts.push(...collectTjLiteralStrings(decompressed));
      parts.push(...collectTjArrayStrings(decompressed));
    } catch {
      // Ignore malformed stream segments.
    }
  }

  return parts.join(" ");
}

export function isPdfBuffer(buffer: Buffer): boolean {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString() === "%PDF-";
}
