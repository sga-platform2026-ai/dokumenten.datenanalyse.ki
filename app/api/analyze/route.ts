import { analyzeDocument } from "@/lib/aiClient";
import { ANALYSIS_NOT_CONFIGURED_MESSAGE } from "@/lib/analysisConfig";
import { requireSession } from "@/lib/auth/session";
import type { AnalyzeRequest } from "@/types";
import { NextResponse } from "next/server";

const MAX_DOCUMENT_LENGTH = 100_000;

export async function POST(request: Request) {
  const authError = await requireSession(request);
  if (authError) {
    return authError;
  }

  try {
    const body = (await request.json()) as AnalyzeRequest;
    const documentText = body.documentText?.trim() ?? "";

    if (!documentText) {
      return NextResponse.json(
        { error: "Dokumenttext fehlt oder ist leer." },
        { status: 400 },
      );
    }

    if (documentText.length > MAX_DOCUMENT_LENGTH) {
      return NextResponse.json(
        { error: "Dokumenttext überschreitet die maximale Länge." },
        { status: 400 },
      );
    }

    const result = await analyzeDocument(documentText, body.fileName);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unbekannter Serverfehler.";

    const status =
      message === ANALYSIS_NOT_CONFIGURED_MESSAGE ? 503 : 502;

    return NextResponse.json({ error: message }, { status });
  }
}
