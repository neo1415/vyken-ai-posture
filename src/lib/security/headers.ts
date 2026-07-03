/**
 * Security headers applied to all responses via Next.js config.
 * Module 18B — Security Hardening.
 */

export const SECURITY_HEADERS = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/**
 * CSP directives — adjusted for Next.js runtime (inline scripts/styles).
 *
 * `unsafe-inline` for style-src: required by Tailwind CSS runtime and Next.js style injection.
 * `unsafe-inline` for script-src: required by Next.js inline bootstrap scripts.
 * These are the minimum compromises for a Next.js app without nonce infrastructure.
 */
export function buildCspHeader(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ];

  return directives.join("; ");
}

export const CSP_HEADER = {
  key: "Content-Security-Policy",
  value: buildCspHeader(),
};
