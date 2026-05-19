import {
  getCachedAnalysis,
  hashDocumentText,
  setCachedAnalysis,
} from "@/lib/analysisCache";
import { grokChat } from "@/lib/grokChat";
import { buildArticleCheckSystemMessage } from "@/lib/prompts/articleCheckPrompt";
import { LETTER_ONLY_PROMPT } from "@/lib/prompts/letterOnlyPrompt";
import { createMockAnalyzeResponse } from "@/lib/mockData";
import {
  applyNormalizedArticlesToAnalysis,
  type AnalyzeArticlesResult,
  type NormalizedViolatedArticle,
} from "@/lib/structuredArticles";
import type { AnalyzeDiagnostics, AnalyzeResponse } from "@/types";

const DEFAULT_GROK_MODEL = "grok-3-latest";
const REQUEST_TIMEOUT_MS = 180_000;
/** Cache-Version: erhöht bei jeder Pipeline-Änderung. */
const ANALYSIS_CACHE_VERSION = "v5-affected";
const RAW_PREVIEW_CHARS = 400;

interface GrokConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}

function getGrokConfig(): GrokConfig {
  return {
    apiKey: process.env.GROK_API_KEY?.trim() ?? "",
    apiUrl:
      process.env.GROK_API_URL?.trim() ?? "https://api.x.ai/v1/chat/completions",
    model: process.env.GROK_MODEL?.trim() || DEFAULT_GROK_MODEL,
  };
}

function isCacheDisabled(): boolean {
  return process.env.DISABLE_ANALYSIS_CACHE === "1";
}

function shouldExposeRawPreview(): boolean {
  return process.env.DEBUG_RAW_RESPONSE === "1";
}

function buildCacheKey(documentText: string, fileName?: string): string {
  return `${hashDocumentText(documentText, fileName)}:${ANALYSIS_CACHE_VERSION}`;
}

function formatArticlesForLetter(articles: NormalizedViolatedArticle[]): string {
  if (articles.length === 0) {
    return "Keine Artikel übergeben.";
  }
  return articles.map((a) => `- ${a.article}: ${a.reason}`).join("\n");
}

function buildDiagnostics(
  documentText: string,
  analysisRaw: string,
  parsed: AnalyzeArticlesResult,
  retried: boolean,
  retryReason: string | undefined,
): AnalyzeDiagnostics {
  return {
    rawAnalysisLength: analysisRaw.length,
    rawAnalysisPreview: shouldExposeRawPreview()
      ? analysisRaw.slice(0, RAW_PREVIEW_CHARS)
      : undefined,
    hasJsonStart: parsed.hasJsonStart,
    hasJsonEnd: parsed.hasJsonEnd,
    jsonValid: parsed.jsonValid,
    jsonRecovered: parsed.jsonRecovered || undefined,
    structuredCount: parsed.structuredCount,
    proseCount: parsed.proseCount,
    mergedCount: parsed.articles.length,
    affectedCount: parsed.affected.length,
    retried,
    retryReason,
    documentLength: documentText.length,
  };
}

function logAnalysisDiagnostics(
  step: string,
  diagnostics: AnalyzeDiagnostics,
  affectedCount: number,
): void {
  console.info(
    `[analyzeDocument:${step}]`,
    JSON.stringify({
      rawAnalysisLength: diagnostics.rawAnalysisLength,
      hasJsonStart: diagnostics.hasJsonStart,
      hasJsonEnd: diagnostics.hasJsonEnd,
      jsonValid: diagnostics.jsonValid,
      jsonRecovered: diagnostics.jsonRecovered,
      structuredCount: diagnostics.structuredCount,
      proseCount: diagnostics.proseCount,
      mergedCount: diagnostics.mergedCount,
      affectedCount,
      retried: diagnostics.retried,
      retryReason: diagnostics.retryReason,
      documentLength: diagnostics.documentLength,
    }),
  );
}

export async function analyzeDocument(
  documentText: string,
  fileName?: string,
): Promise<AnalyzeResponse> {
  const { apiKey, apiUrl, model } = getGrokConfig();

  if (!apiKey) {
    return createMockAnalyzeResponse(fileName);
  }

  const cacheKey = buildCacheKey(documentText, fileName);
  if (!isCacheDisabled()) {
    const cached = getCachedAnalysis(cacheKey);
    if (cached) {
      return {
        ...cached,
        metadata: { ...cached.metadata, cached: true },
      };
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const userDocument = `Hochgeladenes Dokument:\n\n${documentText}`;

    let analysisRaw = await grokChat({
      apiKey,
      apiUrl,
      model,
      system: buildArticleCheckSystemMessage(),
      user: userDocument,
      temperature: 0.2,
      maxTokens: 8192,
      signal: controller.signal,
    });

    let parsed = applyNormalizedArticlesToAnalysis(analysisRaw);
    let retried = false;
    let retryReason: string | undefined;

    logAnalysisDiagnostics(
      "call1",
      buildDiagnostics(documentText, analysisRaw, parsed, false, undefined),
      parsed.affected.length,
    );

    if (parsed.articles.length <= 2) {
      retried = true;
      retryReason = `nur ${parsed.articles.length} Artikel im ersten Lauf`;

      const retryUser = `${userDocument}

---
Zweiter Prüflauf: Erfasse jetzt vollständig alle Checklisten-Artikel (articleReviews mit violated:true|false für JEDE ID).
Bei behördlichen Briefen sind oft mehrere Artikel betroffen (z. B. Anrede → 7-2, Fristen/Androhungen → 31-34, Beschwerdeweg → 101).
Liefere Abschnitt 1 (Absender) und 5.2 inkl. Pflicht-JSON.`;

      analysisRaw = await grokChat({
        apiKey,
        apiUrl,
        model,
        system: buildArticleCheckSystemMessage(),
        user: retryUser,
        temperature: 0.2,
        maxTokens: 8192,
        signal: controller.signal,
      });

      parsed = applyNormalizedArticlesToAnalysis(analysisRaw);
      logAnalysisDiagnostics(
        "call1-retry",
        buildDiagnostics(documentText, analysisRaw, parsed, true, retryReason),
        parsed.affected.length,
      );
    }

    const letterUser = `${userDocument}

---
Festgestellte Verstöße gegen das IV. Genfer Abkommen (verbindlich für den Brief):
${formatArticlesForLetter(parsed.articles)}
---`;

    const letter = await grokChat({
      apiKey,
      apiUrl,
      model,
      system: LETTER_ONLY_PROMPT,
      user: letterUser,
      temperature: 0.3,
      maxTokens: 4096,
      signal: controller.signal,
    });

    const diagnostics = buildDiagnostics(
      documentText,
      analysisRaw,
      parsed,
      retried,
      retryReason,
    );

    const result: AnalyzeResponse = {
      analysis: parsed.displayAnalysis,
      letter,
      metadata: {
        model,
        provider: "grok",
        timestamp: new Date().toISOString(),
        mock: false,
        diagnostics,
      },
    };

    if (!isCacheDisabled()) {
      setCachedAnalysis(cacheKey, result);
    }
    return result;
  } finally {
    clearTimeout(timeout);
  }
}
