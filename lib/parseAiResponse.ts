import { applyNormalizedArticlesToAnalysis } from "@/lib/structuredArticles";
import type { AnalyzeResponse, ParsedAnalysis } from "@/types";

const LETTER_MARKERS = [
  "6. Fertig formulierter Antwortbrief",
  "6. Antwortbrief",
  "## Vorlage GA IV Beschwerde",
] as const;
const ANALYSIS_START = "1. Absender-Identifikation";

export function splitAiResponse(rawContent: string): Pick<AnalyzeResponse, "analysis" | "letter"> {
  const normalized = rawContent.trim();
  const marker = LETTER_MARKERS
    .map((value) => ({ value, index: normalized.indexOf(value) }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index)[0];

  if (!marker) {
    return {
      analysis: normalized,
      letter: "",
    };
  }

  const analysisStart = normalized.indexOf(ANALYSIS_START);
  const analysis =
    analysisStart >= 0
      ? normalized.slice(analysisStart, marker.index).trim()
      : normalized.slice(0, marker.index).trim();

  const letterBody = normalized.slice(marker.index + marker.value.length).trim();

  return {
    analysis,
    letter: letterBody,
  };
}

function normalizeLineStarts(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/^[ \t]*[-*•]\s*/gm, "")
    .trim();
}

function captureField(
  raw: string,
  label: RegExp,
  nextLabels: RegExp[],
): string | undefined {
  const source = normalizeLineStarts(raw);
  const lines = source.split("\n");
  const values: string[] = [];
  let collecting = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (collecting && values.length > 0) {
        continue;
      }
      continue;
    }

    if (collecting) {
      if (/^\d+\.\s/u.test(line) || nextLabels.some((next) => next.test(line))) {
        break;
      }
      values.push(line);
      continue;
    }

    const match = line.match(label);
    if (!match) {
      continue;
    }

    collecting = true;
    const colonIndex = line.indexOf(":");
    if (colonIndex >= 0) {
      const inlineValue = line.slice(colonIndex + 1).trim();
      if (inlineValue) {
        values.push(inlineValue);
      }
    }
  }

  const value = values.join("\n").trim();
  return value.length > 0 ? value : undefined;
}

export function parseAnalysisSections(analysis: string): ParsedAnalysis {
  const { displayAnalysis, articles: normalized, affected } =
    applyNormalizedArticlesToAnalysis(analysis);
  const raw = displayAnalysis.trim();
  const fieldLabels = [
    /Empfaenger|Empfänger/iu,
    /Behoerde\s*\/\s*Institution|Behörde\s*\/\s*Institution/iu,
    /Verantwortlicher Sachbearbeiter/iu,
    /Leiter der Behoerde\s*\/\s*Institution|Leiter der Behörde\s*\/\s*Institution/iu,
    /Aktenzeichen\s*\/\s*Geschaeftszahl|Aktenzeichen\s*\/\s*Geschäftszahl|Aktenzeichen/iu,
    /Datum des Schreibens/iu,
  ];

  const recipient = captureField(
    raw,
    /Empfaenger|Empfänger/iu,
    fieldLabels.filter((next) => next.source !== "Empfaenger|Empfänger"),
  );
  const authority = captureField(
    raw,
    /Behoerde\s*\/\s*Institution|Behörde\s*\/\s*Institution/iu,
    fieldLabels.filter((next) => next.source !== "Behoerde\\s*\\/\\s*Institution|Behörde\\s*\\/\\s*Institution"),
  );
  const clerk = captureField(
    raw,
    /Verantwortlicher Sachbearbeiter/iu,
    fieldLabels.filter((next) => next.source !== "Verantwortlicher Sachbearbeiter"),
  );
  const leader = captureField(
    raw,
    /Leiter der Behoerde\s*\/\s*Institution[^\n]*|Leiter der Behörde\s*\/\s*Institution[^\n]*/iu,
    fieldLabels.filter((next) => !next.source.startsWith("Leiter")),
  );
  const caseNumber = captureField(
    raw,
    /Aktenzeichen\s*\/\s*Geschaeftszahl|Aktenzeichen\s*\/\s*Geschäftszahl|Aktenzeichen/iu,
    fieldLabels.filter((next) => !next.source.startsWith("Aktenzeichen")),
  );
  const documentDate = captureField(
    raw,
    /Datum des Schreibens/iu,
    fieldLabels.filter((next) => next.source !== "Datum des Schreibens"),
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
    recipient,
    authority,
    clerk,
    leader,
    caseNumber,
    documentDate,
    articles,
    affected: affectedView,
    raw,
  };
}
