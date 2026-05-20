import { applyNormalizedArticlesToAnalysis } from "@/lib/structuredArticles";
import type { AnalyzeResponse } from "@/types";

export function createMockAnalyzeResponse(fileName?: string): AnalyzeResponse {
  const reference = fileName ? ` (${fileName})` : "";

  const rawAnalysis = `1. Absender-Identifikation

Behörde / Institution:
Stadtverwaltung Musterstadt, Amtsstraße 12, 12345 Musterstadt

Verantwortlicher Sachbearbeiter:
Max Mustermann, Sachbearbeiter Ordnungsamt, max.mustermann@musterstadt.de

Leiter der Behörde / Institution:
Dr. Anna Beispiel, Amtsleiterin – recherchiert

2. Verletzte oder berührte Artikel des IV. Genfer Abkommens

Artikel 7 Abs. 2 GA IV – Anrede „Herr …“${reference}
Artikel 27 GA IV – Eingriff in die persönliche Sphäre

5.2. Verletzte Artikel des IV. Genfer Abkommens

Artikel 7 Abs. 2 GA IV – Anrede „Herr …“${reference}
Artikel 27 GA IV – Eingriff in die persönliche Sphäre
<!--GA_IV_ARTICLES-->{"articleReviews":[{"id":"7-2","violated":true,"reason":"Anrede"},{"id":"27","violated":true,"reason":"Eingriff"}]}<!--/GA_IV_ARTICLES-->`;

  const { displayAnalysis } = applyNormalizedArticlesToAnalysis(rawAnalysis);

  return {
    analysis: displayAnalysis,
    letter: "",
    metadata: {
      model: "mock",
      provider: "mock",
      timestamp: new Date().toISOString(),
      mock: true,
    },
  };
}
