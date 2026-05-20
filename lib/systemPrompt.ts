import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  GA_IV_CANONICAL_ARTICLE_ORDER,
  getArticleLabel,
} from "@/lib/gaIvArticleCatalog";
import { GA_IV_KNOWLEDGE } from "@/lib/knowledge/ga-iv-knowledge";

export const GA_IV_SYSTEM_PROMPT_RELATIVE_PATH = "config/GA-IV-Systemprompt.md";

const SYSTEM_PROMPT_PATH = join(process.cwd(), GA_IV_SYSTEM_PROMPT_RELATIVE_PATH);

let cachedSystemPrompt: string | null = null;

/** Liest den Markdown-Inhalt nach dem YAML-Frontmatter. */
export function loadGaIvSystemPromptFromFile(): string {
  if (cachedSystemPrompt) {
    return cachedSystemPrompt;
  }

  const raw = readFileSync(SYSTEM_PROMPT_PATH, "utf8");
  const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/u);
  if (!match) {
    throw new Error(
      `${GA_IV_SYSTEM_PROMPT_RELATIVE_PATH}: YAML-Frontmatter (--- … ---) fehlt.`,
    );
  }

  cachedSystemPrompt = raw.slice(match[0].length).trim();
  return cachedSystemPrompt;
}

const CHECKLIST_LINES = GA_IV_CANONICAL_ARTICLE_ORDER.map(
  (id) => `- ${id}: ${getArticleLabel(id)}`,
).join("\n");

const ARTICLE_CALL_RULES = `SPEZIALISIERUNG – ANALYSE-CALL (ein Aufruf, kein Antwortbrief):
Antworte NUR mit Abschnitt 1, Abschnitt 2, Abschnitt 5.2 inkl. Pflicht-JSON. KEIN Antwortbrief.

Prüfungsliste (IDs – für articleReviews jede ID bewerten):
${CHECKLIST_LINES}`;

/** Vollständige Systemnachricht für den Grok-Analyse-Call. */
export function buildArticleCheckSystemMessage(): string {
  return `${loadGaIvSystemPromptFromFile()}

---
WISSENSBASIS:
---

${GA_IV_KNOWLEDGE}

${ARTICLE_CALL_RULES}`;
}

export function resetGaIvSystemPromptCache(): void {
  cachedSystemPrompt = null;
}
