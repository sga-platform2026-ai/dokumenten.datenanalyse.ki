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
  type NormalizedViolatedArticle,
} from "@/lib/structuredArticles";
import type { AnalyzeResponse } from "@/types";

const DEFAULT_GROK_MODEL = "grok-3-latest";
const REQUEST_TIMEOUT_MS = 180_000;
/** Cache-Version: Zwei-Call-Analyse + Artikel-Union */
const ANALYSIS_CACHE_VERSION = "v2-two-call";

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

function buildCacheKey(documentText: string, fileName?: string): string {
  return `${hashDocumentText(documentText, fileName)}:${ANALYSIS_CACHE_VERSION}`;
}

function finalizeAnalysisResponse(
  analysis: string,
  letter: string,
  metadata: AnalyzeResponse["metadata"],
): AnalyzeResponse {
  const { displayAnalysis } = applyNormalizedArticlesToAnalysis(analysis);
  return {
    analysis: displayAnalysis,
    letter,
    metadata,
  };
}

function formatArticlesForLetter(articles: NormalizedViolatedArticle[]): string {
  if (articles.length === 0) {
    return "Keine Artikel übergeben.";
  }
  return articles
    .map((a) => `- ${a.article}: ${a.reason}`)
    .join("\n");
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
  const cached = getCachedAnalysis(cacheKey);
  if (cached) {
    return {
      ...cached,
      metadata: { ...cached.metadata, cached: true },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const userDocument = `Hochgeladenes Dokument:\n\n${documentText}`;

    const analysisRaw = await grokChat({
      apiKey,
      apiUrl,
      model,
      system: buildArticleCheckSystemMessage(),
      user: userDocument,
      temperature: 0.1,
      maxTokens: 8192,
      signal: controller.signal,
    });

    const { articles } = applyNormalizedArticlesToAnalysis(analysisRaw);

    const letterUser = `${userDocument}

---
Festgestellte Verstöße gegen das IV. Genfer Abkommen (verbindlich für den Brief):
${formatArticlesForLetter(articles)}
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

    const result = finalizeAnalysisResponse(analysisRaw, letter, {
      model,
      provider: "grok",
      timestamp: new Date().toISOString(),
      mock: false,
    });

    setCachedAnalysis(cacheKey, result);
    return result;
  } finally {
    clearTimeout(timeout);
  }
}
