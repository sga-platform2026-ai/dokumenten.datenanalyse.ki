import {
  getCachedAnalysis,
  hashDocumentText,
  setCachedAnalysis,
} from "@/lib/analysisCache";
import { buildSystemMessage } from "@/lib/knowledge/buildSystemMessage";
import { createMockAnalyzeResponse } from "@/lib/mockData";
import { splitAiResponse } from "@/lib/parseAiResponse";
import { applyNormalizedArticlesToAnalysis } from "@/lib/structuredArticles";
import type { AnalyzeResponse } from "@/types";

const DEFAULT_GROK_URL = "https://api.x.ai/v1/chat/completions";
const DEFAULT_GROK_MODEL = "grok-3-latest";
const REQUEST_TIMEOUT_MS = 120_000;

interface GrokChoice {
  message?: {
    content?: string;
  };
}

interface GrokApiResponse {
  choices?: GrokChoice[];
}

function getGrokConfig() {
  return {
    apiKey: process.env.GROK_API_KEY?.trim() ?? "",
    apiUrl: process.env.GROK_API_URL?.trim() || DEFAULT_GROK_URL,
    model: process.env.GROK_MODEL?.trim() || DEFAULT_GROK_MODEL,
  };
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

export async function analyzeDocument(
  documentText: string,
  fileName?: string,
): Promise<AnalyzeResponse> {
  const { apiKey, apiUrl, model } = getGrokConfig();

  if (!apiKey) {
    return createMockAnalyzeResponse(fileName);
  }

  const cacheKey = hashDocumentText(documentText, fileName);
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
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildSystemMessage() },
          {
            role: "user",
            content: `Hochgeladenes Dokument:\n\n${documentText}`,
          },
        ],
        temperature: 0,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `GROK API Fehler (${response.status}): ${errorBody.slice(0, 300)}`,
      );
    }

    const data = (await response.json()) as GrokApiResponse;
    const rawContent = data.choices?.[0]?.message?.content?.trim();

    if (!rawContent) {
      throw new Error("GROK API lieferte keine Inhalte.");
    }

    const { analysis, letter } = splitAiResponse(rawContent);

    const result = finalizeAnalysisResponse(
      analysis || rawContent,
      letter,
      {
        model,
        provider: "grok",
        timestamp: new Date().toISOString(),
        mock: false,
      },
    );

    setCachedAnalysis(cacheKey, result);
    return result;
  } finally {
    clearTimeout(timeout);
  }
}
