import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/config/env.server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "vyken-ai-risk-assessment",
    environment: serverEnv.NODE_ENV,
  });
}
