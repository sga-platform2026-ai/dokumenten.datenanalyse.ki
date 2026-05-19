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
  const raw = analysis.trim();
  const authorityMatch = raw.match(
    /Behörde\s*\/\s*Institution:\s*([\s\S]*?)(?=\nVerantwortlicher|$)/i,
  );
  const clerkMatch = raw.match(
    /Verantwortlicher Sachbearbeiter:\s*([\s\S]*?)(?=\nLeiter|$)/i,
  );
  const leaderMatch = raw.match(
    /Leiter der Behörde\s*\/\s*Institution[^:]*:\s*([\s\S]*?)(?=\n\n|5\.2\.|$)/i,
  );

  const articlesSection = raw.split(/5\.2\.\s*Verletzte Artikel/i)[1] ?? "";
  const articleLines = articlesSection
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^Artikel\s+\d+/i.test(line));

  const articles = articleLines.map((line) => {
    const dashIndex = line.indexOf("–");
    const hyphenIndex = line.indexOf("-");
    const splitIndex =
      dashIndex > -1 ? dashIndex : hyphenIndex > -1 ? hyphenIndex : -1;

    if (splitIndex === -1) {
      return { article: line, reason: "" };
    }

    return {
      article: line.slice(0, splitIndex).trim(),
      reason: line.slice(splitIndex + 1).trim(),
    };
  });

  return {
    authority: authorityMatch?.[1]?.trim(),
    clerk: clerkMatch?.[1]?.trim(),
    leader: leaderMatch?.[1]?.trim(),
    articles,
    raw,
  };
}
