import { z } from "zod";

/**
 * Client-safe environment variables.
 * Only NEXT_PUBLIC_* values belong here — never import server secrets in Client Components.
 */
const clientEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

function parseClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid client environment configuration:\n${message}`);
  }

  return parsed.data;
}

export const clientEnv = parseClientEnv();

export type ClientEnv = z.infer<typeof clientEnvSchema>;
