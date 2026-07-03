/**
 * Lightweight server-side rate limiter (in-memory, per-instance).
 * Suitable for single-server deployments. For production multi-instance
 * scaling, replace with Redis/Upstash.
 *
 * Module 18B — Security Hardening.
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(namespace: string): Map<string, RateLimitEntry> {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

export type RateLimitConfig = {
  namespace: string;
  maxAttempts: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function checkRateLimit(
  config: RateLimitConfig,
  key: string,
): RateLimitResult {
  const store = getStore(config.namespace);
  const now = Date.now();

  const existing = store.get(key);
  if (!existing || now >= existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (existing.count >= config.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: config.maxAttempts - existing.count,
    resetAt: existing.resetAt,
  };
}

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

export function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const store of stores.values()) {
    for (const [key, entry] of store.entries()) {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    }
  }
}

export const ADMIN_LOGIN_RATE_LIMIT: RateLimitConfig = {
  namespace: "admin_login",
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
};

export const LEAD_CAPTURE_RATE_LIMIT: RateLimitConfig = {
  namespace: "lead_capture",
  maxAttempts: 10,
  windowMs: 60 * 1000,
};

export const CTA_EVENT_RATE_LIMIT: RateLimitConfig = {
  namespace: "cta_event",
  maxAttempts: 20,
  windowMs: 60 * 1000,
};

export const EMAIL_SEND_RATE_LIMIT: RateLimitConfig = {
  namespace: "email_send",
  maxAttempts: 3,
  windowMs: 60 * 1000,
};
