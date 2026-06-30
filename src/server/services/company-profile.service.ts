import "server-only";

import type { CompanyProfileInput } from "@/features/company-profile/types";
import { generatePublicToken } from "@/lib/security/public-token";
import { createAssessmentSession } from "@/server/repositories/assessment-sessions.repository";
import { upsertCompanyProfile } from "@/server/repositories/company-profiles.repository";

const MAX_TOKEN_COLLISION_RETRIES = 5;

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("unique") ||
      error.message.includes("duplicate key"))
  );
}

async function createSessionWithToken(): Promise<{
  sessionId: string;
  publicToken: string;
}> {
  for (let attempt = 0; attempt < MAX_TOKEN_COLLISION_RETRIES; attempt += 1) {
    const publicToken = generatePublicToken();

    try {
      const session = await createAssessmentSession({
        publicToken,
        status: "started",
      });

      return { sessionId: session.id, publicToken };
    } catch (error) {
      if (
        isUniqueViolation(error) &&
        attempt < MAX_TOKEN_COLLISION_RETRIES - 1
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Unable to create assessment session after token retries.");
}

export async function createCompanyProfileAssessment(
  input: CompanyProfileInput,
): Promise<{ publicToken: string }> {
  const { sessionId, publicToken } = await createSessionWithToken();

  await upsertCompanyProfile({
    assessmentSessionId: sessionId,
    ...input,
  });

  return { publicToken };
}
