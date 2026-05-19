import { NextResponse } from "next/server";
import { isAuthEnabled } from "@/lib/auth/config";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ enabled: isAuthEnabled() });
}
