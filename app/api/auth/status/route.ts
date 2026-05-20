import { getAuthConfigStatus } from "@/lib/auth/config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const status = getAuthConfigStatus();
  return NextResponse.json({
    enabled: status.enabled,
    reason: status.reason ?? null,
  });
}
