import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyLetterLine } from "@/lib/letterLineStyle";
import { normalizeLetterText } from "@/lib/normalizeLetter";

test("normalizeLetterText entfernt Vorlagen-Ueberschrift", () => {
  const raw = `## Vorlage GA IV Beschwerde - linksbuendig - an Leiter der Behoerde

Absender
Max Mustermann`;

  const normalized = normalizeLetterText(raw);
  assert.doesNotMatch(normalized, /Vorlage GA IV Beschwerde/u);
  assert.match(normalized, /^Absender/u);
});

test("classifyLetterLine markiert Betreff und Abschnittslabels fett", () => {
  const betreff = classifyLetterLine("Betreff: Test", {
    beforeAbsender: false,
    previousLine: null,
  });
  assert.equal(betreff.bold, true);
  assert.equal(betreff.kind, "betreff");

  const section = classifyLetterLine("Absender", {
    beforeAbsender: false,
    previousLine: null,
  });
  assert.equal(section.bold, true);
  assert.equal(section.kind, "section");

  const azValue = classifyLetterLine("AZ-123", {
    beforeAbsender: false,
    previousLine: "Geschaeftszahl / Aktenzeichen",
  });
  assert.equal(azValue.bold, true);
  assert.equal(azValue.kind, "az-value");
});
