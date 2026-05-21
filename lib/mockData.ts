import { applyNormalizedArticlesToAnalysis } from "@/lib/structuredArticles";
import { generateComplaintLettersFromAnalysis } from "@/lib/templates/complaintTemplates";
import type { AnalyzeResponse } from "@/types";

export function createMockAnalyzeResponse(fileName?: string): AnalyzeResponse {
  const reference = fileName ? ` (${fileName})` : "";

  const rawAnalysis = `1. Absender-Identifikation

Empfaenger:
Herr Max Empfaenger, Beispielweg 5, 80331 Muenchen, empfaenger@example.com, +49 (89) 1234-5678

Behoerde / Institution:
Stadtverwaltung Musterstadt, Amtsstrasse 12, 12345 Musterstadt

Verantwortlicher Sachbearbeiter:
Max Mustermann, Sachbearbeiter Ordnungsamt, max.mustermann@musterstadt.de

Leiter der Behoerde / Institution (Gesamtverantwortung):
Dr. Anna Beispiel, Amtsleiterin - recherchiert

Aktenzeichen / Geschaeftszahl:
AZ-2026-4711

Datum des Schreibens:
12.05.2026

2. Verletzte Artikel des IV. Genfer Abkommens

Artikel 7 Abs. 2 GA IV - Verbot der Entrechtung - Anrede "Herr ..."${reference}
Artikel 27 GA IV - Schutz der Ehre - Eingriff in die persoenliche Sphaere${reference}
<!--GA_IV_ARTICLES-->{"articleReviews":[{"id":"7-2","violated":true,"reason":"Anrede"},{"id":"27","violated":true,"reason":"Eingriff"}]}<!--/GA_IV_ARTICLES-->`;

  const { displayAnalysis } = applyNormalizedArticlesToAnalysis(rawAnalysis);

  return {
    analysis: displayAnalysis,
    letter: generateComplaintLettersFromAnalysis(displayAnalysis),
    metadata: {
      model: "mock",
      provider: "mock",
      timestamp: new Date().toISOString(),
      mock: true,
    },
  };
}
