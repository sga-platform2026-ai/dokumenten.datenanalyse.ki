import { requireSession } from "@/lib/auth/session";
import { generateComplaintLettersFromAnalysis } from "@/lib/templates/complaintTemplates";
import { NextResponse } from "next/server";

interface GenerateLetterRequest {
  analysis?: string;
}

export async function POST(request: Request) {
  const authError = await requireSession(request);
  if (authError) {
    return authError;
  }

  try {
    const body = (await request.json()) as GenerateLetterRequest;
    const analysis = body.analysis?.trim() ?? "";

    if (!analysis) {
      return NextResponse.json(
        { error: "Analyse fehlt oder ist leer." },
        { status: 400 },
      );
    }

    const letter = generateComplaintLettersFromAnalysis(analysis);
    return NextResponse.json({ letter });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Brief konnte nicht erstellt werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
