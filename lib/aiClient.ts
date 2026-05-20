import {
  ANALYSIS_NOT_CONFIGURED_MESSAGE,
  ANALYSIS_PROMPTS_CONFIGURED,
} from "@/lib/analysisConfig";
import type { AnalyzeResponse } from "@/types";

export async function analyzeDocument(
  _documentText: string,
  _fileName?: string,
): Promise<AnalyzeResponse> {
  if (!ANALYSIS_PROMPTS_CONFIGURED) {
    throw new Error(ANALYSIS_NOT_CONFIGURED_MESSAGE);
  }

  throw new Error(
    "KI-Analyse ist aktiviert, aber die Grok-Pipeline ist noch nicht implementiert.",
  );
}
