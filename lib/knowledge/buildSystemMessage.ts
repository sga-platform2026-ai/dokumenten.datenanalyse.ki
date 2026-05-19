import { SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { GA_IV_KNOWLEDGE } from "@/lib/knowledge/ga-iv-knowledge";

const KNOWLEDGE_HEADER = `
---
WISSENSBASIS (lex scripta – vollständiger Wortlaut Genfer Abkommen IV, SR 0.518.51):
Nutze ausschließlich diese Vorschriften und den obigen Prüfauftrag. Keine Ergänzung aus anderen Abkommen oder Zusatzprotokollen.
---

`;

/** Systemnachricht für Grok: Prüfauftrag + GA-IV-Volltext aus Wissensdatenbank. */
export function buildSystemMessage(): string {
  return `${SYSTEM_PROMPT}${KNOWLEDGE_HEADER}${GA_IV_KNOWLEDGE}`;
}
