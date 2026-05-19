import { GA_IV_KNOWLEDGE } from "@/lib/knowledge/ga-iv-knowledge";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";

const KNOWLEDGE_HEADER = `
---
WISSENSBASIS (GA IV – Prüfregeln und Artikelbedeutungen):
Nutze ausschließlich diese Wissensdatenbank und den Prüfauftrag. Keine Ergänzung aus nationalem Recht.
---

`;

/** Systemnachricht für Grok: Prüfauftrag + Wissensdatenbank. */
export function buildSystemMessage(): string {
  return `${SYSTEM_PROMPT}${KNOWLEDGE_HEADER}${GA_IV_KNOWLEDGE}`;
}
