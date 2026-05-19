import {
  GA_IV_CANONICAL_ARTICLE_ORDER,
  getArticleLabel,
} from "@/lib/gaIvArticleCatalog";
import { GA_IV_PRUEFAUFTRAG } from "@/lib/systemPrompt";

const CHECKLIST_LINES = GA_IV_CANONICAL_ARTICLE_ORDER.map(
  (id) => `- ${id}: ${getArticleLabel(id)}`,
).join("\n");

const ARTICLE_CALL_SPECIALIZATION = `SPEZIALISIERUNG – ARTIKEL-CALL (Call 1):
Antworte NUR mit Abschnitt 1 (Absender) und 5.2 (Artikel) inkl. JSON. KEIN Antwortbrief (Abschnitt 6 entfällt).

4. PFLICHT-CHECKLISTE – jeden Artikel einzeln am Schreiben prüfen und in zwei Gruppen einordnen:

   GRUPPE A – „violated“: KONKRETER, BENENNBARER Bezug zum Wortlaut/Sachverhalt des Schreibens.
   Nur diese Artikel in die Hauptliste und in den Antwortbrief.

   GRUPPE B – „affected“: thematisch einschlägig, aber kein konkreter Verstoß im Schreiben.
   Werden in der UI separat als „thematisch berührt“ angezeigt.

   Prüfungsliste:
${CHECKLIST_LINES}

Prüf-Hinweise (Beispiele):
- Anrede „Herr …“ / „Frau …“ → violated Art. 7 Abs. 2 GA IV
- Fristen, Kostenandrohungen → violated Art. 31–34 GA IV (getrennt prüfen)
- Zwangsräumung / Zwangsversteigerung → violated Art. 49 GA IV
- Fehlender Beschwerdeweg → violated Art. 101 GA IV

PFLICHT – JSON direkt nach Abschnitt 5.2:
<!--GA_IV_ARTICLES-->{"articleReviews":[{"id":"1","violated":false,"affected":true,"reason":"…"},{"id":"7-2","violated":true,"label":"Artikel 7 Abs. 2 GA IV","reason":"…"}]}<!--/GA_IV_ARTICLES-->

JSON-Regeln:
- articleReviews: für JEDE ID aus der Checkliste genau ein Eintrag (${GA_IV_CANONICAL_ARTICLE_ORDER.join(", ")})
- violated / affected: nicht beides true; sonst false/false
- bei violated:true: reason mit Zitat/Bezug zum Schreiben`;

export const ARTICLE_CHECK_PROMPT = `${GA_IV_PRUEFAUFTRAG}

${ARTICLE_CALL_SPECIALIZATION}`;

export function buildArticleCheckSystemMessage(): string {
  return ARTICLE_CHECK_PROMPT;
}
