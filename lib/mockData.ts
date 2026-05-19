import type { AnalyzeResponse } from "@/types";

export function createMockAnalyzeResponse(fileName?: string): AnalyzeResponse {
  const reference = fileName ? ` (${fileName})` : "";

  return {
    analysis: `1. Absender-Identifikation
Behörde / Institution: Stadtverwaltung Musterstadt, Amtsstraße 12, 12345 Musterstadt
Verantwortlicher Sachbearbeiter: Max Mustermann, Sachbearbeiter Ordnungsamt, max.mustermann@musterstadt.de, Tel. 0123/456-789
Leiter der Behörde / Institution (Gesamtverantwortung): Dr. Anna Beispiel, Amtsleiterin Ordnungsamt – (recherchiert)

5.2. Verletzte Artikel des IV. Genfer Abkommens
Artikel 7 Abs. 2 GA IV – Die Anrede „Herr …“ im Schreiben${reference} qualifiziert die angeschriebene Person als juristische Entität und widerspricht dem Schutzstatus als Zivilperson.
Artikel 27 GA IV – Der Inhalt des Schreibens greift in die persönliche Sphäre ein, ohne dass eine neutrale, schutzgerechte Kommunikation gewahrt wurde.
Artikel 31 GA IV – Die Fristsetzung und Androhung weiterer Maßnahmen wirken einschüchternd und nicht sachlich ausgewogen.
Artikel 101 GA IV – Es fehlt ein klarer, wirksamer Beschwerdeweg im Sinne des Abkommens.`,
    letter: `Max Mustermann
Musterweg 1
12345 Musterstadt

Stadtverwaltung Musterstadt
Amtsstraße 12
12345 Musterstadt

Musterstadt, ${new Date().toLocaleDateString("de-DE")}

Betreff: Stellungnahme zu Ihrem Schreiben vom [Datum] – Aktenzeichen [Az.]

Sehr geehrte Damen und Herren,

mit Bezug auf Ihr Schreiben nehme ich wie folgt Stellung:

Die verwendete Anrede „Herr …“ widerspricht Artikel 7 Absatz 2 GA IV, da sie die angesprochene Person entrechtet. Ferner sind die im Schreiben enthaltenen Fristsetzungen und Androhungen im Licht der Artikel 27 und 31 GA IV als unverhältnismäßig und einschüchternd zu werten.

Ich fordere Sie auf, das Schreiben unter Beachtung des IV. Genfer Abkommens IV unverzüglich zu überprüfen, die festgestellten Verstöße zu beseitigen und mir eine schriftliche Stellungnahme zukommen zu lassen.

Mit freundlichen Grüßen

Max Mustermann`,
    metadata: {
      model: "mock",
      provider: "mock",
      timestamp: new Date().toISOString(),
      mock: true,
    },
  };
}
