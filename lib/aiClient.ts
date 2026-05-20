import {
  ANALYSIS_NOT_CONFIGURED_MESSAGE,
  ANALYSIS_PROMPTS_CONFIGURED,
} from "@/lib/analysisConfig";
import {
  getCachedAnalysis,
  hashDocumentText,
  setCachedAnalysis,
} from "@/lib/analysisCache";
import { getGrokRuntimeConfig } from "@/lib/grokConfig";
import { grokChatFromConfig } from "@/lib/grokChat";
import { createMockAnalyzeResponse } from "@/lib/mockData";
import { buildArticleCheckSystemMessage } from "@/lib/prompts/articleCheckPrompt";
import {
  applyNormalizedArticlesToAnalysis,
  type AnalyzeArticlesResult,
} from "@/lib/structuredArticles";
import type { AnalyzeDiagnostics, AnalyzeResponse } from "@/types";

const RAW_PREVIEW_CHARS = 400;

function isCacheDisabled(): boolean {
  return process.env.DISABLE_ANALYSIS_CACHE === "1";
}

function shouldExposeRawPreview(): boolean {
  return process.env.DEBUG_RAW_RESPONSE === "1";
}

function buildCacheKey(
  documentText: string,
  fileName: string | undefined,
  cacheVersion: string,
): string {
  return `${hashDocumentText(documentText, fileName)}:${cacheVersion}`;
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
  if (!ANALYSIS_PROMPTS_CONFIGURED) {
    throw new Error(ANALYSIS_NOT_CONFIGURED_MESSAGE);
  }

  const grokConfig = getGrokRuntimeConfig();

  if (!grokConfig.apiKey) {
    return createMockAnalyzeResponse(fileName);
  }

  const cacheKey = buildCacheKey(
    documentText,
    fileName,
    grokConfig.analysisCacheVersion,
  );
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
  const timeout = setTimeout(
    () => controller.abort(),
    grokConfig.requestTimeoutMs,
  );

  try {
    const userDocument = `Hochgeladenes Dokument:\n\n${documentText}`;
    const system = buildArticleCheckSystemMessage();

    let analysisRaw = await grokChatFromConfig({
      system,
      user: userDocument,
      profile: "article",
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

    if (parsed.articles.length <= grokConfig.retryArticleThreshold) {
      retried = true;
      retryReason = `nur ${parsed.articles.length} Artikel im ersten Lauf`;

      const retryUser = `${userDocument}

---
Zweiter Prüflauf: Erfasse vollständig alle Checklisten-Artikel (articleReviews für JEDE ID).
Liefere Abschnitt 1, 2, 5.2 inkl. Pflicht-JSON. Kein Antwortbrief.`;

      analysisRaw = await grokChatFromConfig({
        system,
        user: retryUser,
        profile: "article",
        signal: controller.signal,
      });

      parsed = applyNormalizedArticlesToAnalysis(analysisRaw);
      logAnalysisDiagnostics(
        "call1-retry",
        buildDiagnostics(documentText, analysisRaw, parsed, true, retryReason),
        parsed.affected.length,
      );
    }

    const diagnostics = buildDiagnostics(
      documentText,
      analysisRaw,
      parsed,
      retried,
      retryReason,
    );

    const result: AnalyzeResponse = {
      analysis: parsed.displayAnalysis,
      letter: "",
      metadata: {
        model: grokConfig.model,
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
