import {
  GA_IV_CANONICAL_ARTICLE_ORDER,
  getArticleLabel,
} from "@/lib/gaIvArticleCatalog";
import { GA_IV_KNOWLEDGE } from "@/lib/knowledge/ga-iv-knowledge";
import { GA_IV_PRUEFAUFTRAG } from "@/lib/systemPrompt";

const CHECKLIST_LINES = GA_IV_CANONICAL_ARTICLE_ORDER.map(
  (id) => `- ${id}: ${getArticleLabel(id)}`,
).join("\n");

const ARTICLE_CALL_RULES = `SPEZIALISIERUNG – ARTIKEL-CALL (Call 1):
Antworte NUR mit Abschnitt 1 (Absender) und Abschnitt 2 sowie 5.2 inkl. Pflicht-JSON. KEIN Antwortbrief.

Prüfe jeden Artikel der Wissensdatenbank anhand seiner Prüfregel und Stichwörter.

Prüfungsliste (IDs):
${CHECKLIST_LINES}

PFLICHT-JSON nach 5.2:
<!--GA_IV_ARTICLES-->{"articleReviews":[{"id":"1","violated":false,"affected":true,"reason":"…"}]}<!--/GA_IV_ARTICLES-->

- articleReviews: für JEDE ID aus der Liste genau ein Eintrag (${GA_IV_CANONICAL_ARTICLE_ORDER.join(", ")})
- violated / affected: nicht beides true
- bei violated:true: reason mit Zitat/Bezug zum Schreiben`;

export function buildArticleCheckSystemMessage(): string {
  return `${GA_IV_PRUEFAUFTRAG}

---
WISSENSBASIS:
---

${GA_IV_KNOWLEDGE}

${ARTICLE_CALL_RULES}`;
}
