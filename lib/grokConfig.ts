import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Relativer Pfad zur zentralen Grok-Konfiguration (Single Source of Truth). */
export const GROK_CONFIG_RELATIVE_PATH = "config/Grok-Konfiguration.md";

const GROK_CONFIG_ABSOLUTE_PATH = join(process.cwd(), GROK_CONFIG_RELATIVE_PATH);

export type GrokReasoningEffort = "none" | "low" | "medium" | "high";

export interface GrokFileConfig {
  apiUrl: string;
  model: string;
  reasoningEffort: GrokReasoningEffort;
  temperature: number;
  maxTokens: number;
  requestTimeoutMs: number;
  analysisCacheVersion: string;
  letterTemperature: number;
  letterMaxTokens: number;
  letterReasoningEffort: GrokReasoningEffort;
  retryArticleThreshold: number;
}

export interface GrokRuntimeConfig extends GrokFileConfig {
  apiKey: string;
}

let cachedFileConfig: GrokFileConfig | null = null;

function parseFrontmatterValue(raw: string): string | number {
  const trimmed = raw.trim();
  if (/^-?\d+$/u.test(trimmed)) {
    return Number.parseInt(trimmed, 10);
  }
  if (/^-?\d+\.\d+$/u.test(trimmed)) {
    return Number.parseFloat(trimmed);
  }
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatterBlock(block: string): Record<string, string | number> {
  const result: Record<string, string | number> = {};

  for (const line of block.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const colon = trimmed.indexOf(":");
    if (colon < 0) {
      continue;
    }
    const key = trimmed.slice(0, colon).trim();
    const value = parseFrontmatterValue(trimmed.slice(colon + 1));
    result[key] = value;
  }

  return result;
}

function asReasoningEffort(value: string | number | undefined): GrokReasoningEffort {
  const normalized = String(value ?? "high").trim().toLowerCase();
  if (
    normalized === "none" ||
    normalized === "low" ||
    normalized === "medium" ||
    normalized === "high"
  ) {
    return normalized;
  }
  return "high";
}

function asNumber(value: string | number | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: string | number | undefined, fallback: string): string {
  if (value === undefined || value === null) {
    return fallback;
  }
  return String(value).trim() || fallback;
}

/** Liest und parst `config/Grok-Konfiguration.md` (YAML-Frontmatter). */
export function loadGrokFileConfig(): GrokFileConfig {
  if (cachedFileConfig) {
    return cachedFileConfig;
  }

  const raw = readFileSync(GROK_CONFIG_ABSOLUTE_PATH, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/u);
  if (!match) {
    throw new Error(
      `${GROK_CONFIG_RELATIVE_PATH}: YAML-Frontmatter (--- … ---) fehlt.`,
    );
  }

  const fields = parseFrontmatterBlock(match[1]);

  cachedFileConfig = {
    apiUrl: asString(
      fields.apiUrl,
      "https://api.x.ai/v1/chat/completions",
    ),
    model: asString(fields.model, "grok-4.3"),
    reasoningEffort: asReasoningEffort(fields.reasoning_effort),
    temperature: asNumber(fields.temperature, 0),
    maxTokens: asNumber(fields.max_tokens, 8192),
    requestTimeoutMs: asNumber(fields.requestTimeoutMs, 180_000),
    analysisCacheVersion: asString(fields.analysisCacheVersion, "v9-grok-md-config"),
    letterTemperature: asNumber(fields.letter_temperature, 0.3),
    letterMaxTokens: asNumber(fields.letter_max_tokens, 4096),
    letterReasoningEffort: asReasoningEffort(fields.letter_reasoning_effort),
    retryArticleThreshold: asNumber(fields.retryArticleThreshold, 2),
  };

  return cachedFileConfig;
}

/** Laufzeit: Konfiguration aus Markdown + API-Key aus Umgebung. */
export function getGrokRuntimeConfig(): GrokRuntimeConfig {
  const file = loadGrokFileConfig();
  return {
    ...file,
    apiKey: process.env.GROK_API_KEY?.trim() ?? "",
  };
}

/** Cache leeren (z. B. in Tests nach Änderung der MD-Datei). */
export function resetGrokFileConfigCache(): void {
  cachedFileConfig = null;
}
