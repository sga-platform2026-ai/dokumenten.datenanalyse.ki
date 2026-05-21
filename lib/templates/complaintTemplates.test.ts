import assert from "node:assert/strict";
import { test } from "node:test";
import { generateComplaintLettersFromAnalysis } from "@/lib/templates/complaintTemplates";
import { loadComplaintTemplatesFromFile } from "@/lib/templates/loadComplaintTemplates";
import {
  extractCityFromPostalCity,
  parseRecipientAddress,
} from "@/lib/templates/parseRecipientAddress";

const SAMPLE_ANALYSIS = `1. Absender-Identifikation

Empfaenger:
Frau Beate Beispiel, Musterstrasse 1, 10115 Berlin

Behoerde / Institution:
Beispielamt Berlin

Verantwortlicher Sachbearbeiter:
Max Mustermann, Sachbearbeiter

Leiter der Behoerde / Institution (Gesamtverantwortung):
Dr. Anna Leiterin - recherchiert

Aktenzeichen / Geschaeftszahl:
AZ-99/2026

Datum des Schreibens:
01.01.2026

2. Verletzte Artikel des IV. Genfer Abkommens

Artikel 7 Abs. 2 GA IV - Verbot der Entrechtung - Anrede
<!--GA_IV_ARTICLES-->{"articleReviews":[{"id":"7-2","violated":true,"reason":"Anrede"}]}<!--/GA_IV_ARTICLES-->`;

test("loadComplaintTemplatesFromFile liefert die Leiter-Vorlage aus Markdown", () => {
  const templates = loadComplaintTemplatesFromFile();
  assert.equal(templates.length, 1);
  assert.match(templates[0]?.title ?? "", /Leiter/u);
  assert.match(templates[0]?.body ?? "", /\{\{ABSENDER_NAME\}\}/u);
});

test("parseRecipientAddress zerlegt kommagetrennte Adresse", () => {
  const parsed = parseRecipientAddress(
    "Frau Beate Beispiel, Musterstrasse 1, 10115 Berlin, beate@example.com",
  );
  assert.equal(parsed.name, "Frau Beate Beispiel");
  assert.equal(parsed.street, "Musterstrasse 1");
  assert.equal(parsed.postalCity, "10115 Berlin");
});

test("extractCityFromPostalCity liest Ort aus PLZ-Zeile", () => {
  assert.equal(extractCityFromPostalCity("80331 Muenchen"), "Muenchen");
});

test("generateComplaintLettersFromAnalysis befuellt Absender und Behoerde", () => {
  const letters = generateComplaintLettersFromAnalysis(SAMPLE_ANALYSIS, {
    date: "21.05.2026",
    place: "Berlin",
  });

  assert.match(letters, /Frau Beate Beispiel/u);
  assert.match(letters, /Musterstrasse 1/u);
  assert.match(letters, /10115 Berlin/u);
  assert.match(letters, /Beispielamt Berlin/u);
  assert.match(letters, /Dr\. Anna Leiterin/u);
  assert.doesNotMatch(letters, /Max Mustermann/u);
  assert.match(letters, /AZ-99\/2026/u);
  assert.match(letters, /Artikel 7 Abs\. 2 GA IV/u);
  assert.doesNotMatch(letters, /\{\{ABSENDER_NAME\}\}/u);
  assert.doesNotMatch(letters, /\{\{DATUM\}\}/u);
  assert.match(letters, /21\.05\.2026/u);
  assert.match(letters, /Berlin/u);
});
