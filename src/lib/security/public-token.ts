import { randomBytes } from "node:crypto";

/** High-entropy URL-safe token for public assessment session references. */
export function generatePublicToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Syntactic validation only — does not prove the session exists. */
export function isValidPublicTokenFormat(token: string): boolean {
  return /^[A-Za-z0-9_-]{32,64}$/.test(token);
}
