import { createHash } from "node:crypto";
import type { AnalyzeResponse } from "@/types";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Stunde

interface CacheEntry {
  expiresAt: number;
  response: AnalyzeResponse;
}

const cache = new Map<string, CacheEntry>();

export function hashDocumentText(documentText: string, fileName?: string): string {
  return createHash("sha256")
    .update(documentText)
    .update("\0")
    .update(fileName ?? "")
    .digest("hex");
}

export function getCachedAnalysis(
  key: string,
): AnalyzeResponse | undefined {
  const entry = cache.get(key);
  if (!entry) {
    return undefined;
  }
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.response;
}

export function setCachedAnalysis(
  key: string,
  response: AnalyzeResponse,
): void {
  cache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    response,
  });
}
