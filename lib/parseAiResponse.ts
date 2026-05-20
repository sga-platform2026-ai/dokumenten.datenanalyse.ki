import { applyNormalizedArticlesToAnalysis } from "@/lib/structuredArticles";
import type { AnalyzeResponse, ParsedAnalysis } from "@/types";

const LETTER_MARKER = "6. Fertig formulierter Antwortbrief";
const ANALYSIS_START = "1. Absender-Identifikation";

export function splitAiResponse(rawContent: string): Pick<AnalyzeResponse, "analysis" | "letter"> {
  const normalized = rawContent.trim();
  const letterIndex = normalized.indexOf(LETTER_MARKER);

  if (letterIndex === -1) {
    return {
      analysis: normalized,
      letter: "",
    };
  }

  const analysisStart = normalized.indexOf(ANALYSIS_START);
  const analysis =
    analysisStart >= 0
      ? normalized.slice(analysisStart, letterIndex).trim()
      : normalized.slice(0, letterIndex).trim();

  const letterBody = normalized.slice(letterIndex + LETTER_MARKER.length).trim();

  return {
    analysis,
    letter: letterBody,
  };
}

export function parseAnalysisSections(analysis: string): ParsedAnalysis {
  const { displayAnalysis, articles: normalized, affected } =
    applyNormalizedArticlesToAnalysis(analysis);
  const raw = displayAnalysis.trim();
  const recipientMatch = raw.match(
    /Empfänger:\s*([\s\S]*?)(?=\nBehörde\s*\/\s*Institution:|$)/i,
  );
  const authorityMatch = raw.match(
    /Behörde\s*\/\s*Institution:\s*([\s\S]*?)(?=\nVerantwortlicher|$)/i,
  );
  const clerkMatch = raw.match(
    /Verantwortlicher Sachbearbeiter:\s*([\s\S]*?)(?=\nLeiter|$)/i,
  );
  const leaderMatch = raw.match(
    /Leiter der Behörde\s*\/\s*Institution[^:]*:\s*([\s\S]*?)(?=\n\n|5\.2\.|$)/i,
  );

  const articles = normalized.map(({ article, reason }) => ({
    article,
    reason,
  }));

  const affectedView = affected.map(({ article, note }) => ({
    article,
    note,
  }));

  return {
    recipient: recipientMatch?.[1]?.trim(),
    authority: authorityMatch?.[1]?.trim(),
    clerk: clerkMatch?.[1]?.trim(),
    leader: leaderMatch?.[1]?.trim(),
    articles,
    affected: affectedView,
    raw,
  };
}
