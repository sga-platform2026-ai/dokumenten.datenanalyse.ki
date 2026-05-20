import assert from "node:assert/strict";
import { test } from "node:test";
import { detectContactKind, splitContactParts, toTelHref } from "@/lib/contactText";
import { parseAnalysisSections } from "@/lib/parseAiResponse";

test("splitContactParts erkennt E-Mail und Telefon", () => {
  const parts = splitContactParts(
    "Herr Max Muster, Musterweg 1, max@example.com, +49 (89) 1234-5678",
  );

  assert.equal(parts.length, 4);
  assert.equal(parts[2]?.kind, "email");
  assert.equal(parts[3]?.kind, "phone");
});

test("toTelHref normalisiert Telefonnummern", () => {
  assert.equal(toTelHref("+49 (89) 1234-5678"), "tel:+498912345678");
});

test("detectContactKind erkennt E-Mail", () => {
  assert.equal(detectContactKind("test@example.com"), "email");
});

test("parseAnalysisSections extrahiert Empfänger", () => {
  const parsed = parseAnalysisSections(`1. Absender-Identifikation

Empfänger:
Frau Beispiel, Hauptstraße 2, beispiel@mail.de, +49 171 1234567

Behörde / Institution:
Stadt Muster

Verantwortlicher Sachbearbeiter:
Max Mustermann

Leiter der Behörde / Institution:
Dr. Anna Beispiel – recherchiert

5.2. Verletzte Artikel des IV. Genfer Abkommens

Artikel 7 Abs. 2 GA IV – Test
<!--GA_IV_ARTICLES-->{"articleReviews":[{"id":"7-2","violated":true,"reason":"Test"}]}<!--/GA_IV_ARTICLES-->`);

  assert.match(parsed.recipient ?? "", /Frau Beispiel/);
  assert.match(parsed.recipient ?? "", /beispiel@mail.de/);
});
