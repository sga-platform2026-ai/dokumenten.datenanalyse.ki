import assert from "node:assert/strict";
import { test } from "node:test";
import { createMockAnalyzeResponse } from "@/lib/mockData";
import { normalizeLetterText } from "@/lib/normalizeLetter";
import {
  PREVIEW_LETTER_PAGINATION,
  estimateVisualLineCost,
  paginateLetterText,
} from "@/lib/letterPagination";
import { generateComplaintLettersFromAnalysis } from "@/lib/templates/complaintTemplates";

test("estimateVisualLineCost gewichtet Titelzeilen niedriger", () => {
  const titleCost = estimateVisualLineCost("Diplomatische, zivilrechtliche", {
    beforeAbsender: true,
    previousLine: null,
  });
  const bodyCost = estimateVisualLineCost("Normaler Fliesstext.", {
    beforeAbsender: false,
    previousLine: "Absender",
  });

  assert.ok(titleCost < bodyCost);
});

test("paginateLetterText nutzt DIN-A4 Flaeche fuer Standardbrief kompakt", () => {
  const letter = normalizeLetterText(createMockAnalyzeResponse().letter);
  const pages = paginateLetterText(letter, PREVIEW_LETTER_PAGINATION);

  assert.ok(pages.length <= 2);
});

test("paginateLetterText haelt Brief mit vielen Artikeln auf wenigen Seiten", () => {
  const articles = ["1", "7-2", "27", "31", "33", "47", "53", "101", "131"];
  const artBlock = articles
    .map(
      (id) =>
        `Artikel ${id} GA IV - Kurzbezeichnung - Begruendung mit konkretem Bezug zum Schreiben.`,
    )
    .join("\n");

  const analysis = `1. Absender-Identifikation

Empfaenger:
Silke Guenzel, Kirchstrasse 1, 82008 Unterhaching

Behoerde / Institution:
Regierung von Oberbayern, Maximilianstrasse 39, 80538 Muenchen

Leiter der Behoerde / Institution (Gesamtverantwortung):
Dr. Christoph Hillenbrand, Regierungspraesident - recherchiert

Aktenzeichen / Geschaeftszahl:
ROB-55Pb-2676.Ph_6-394-1

2. Verletzte Artikel

${artBlock}`;

  const letter = normalizeLetterText(generateComplaintLettersFromAnalysis(analysis));
  const pages = paginateLetterText(letter, PREVIEW_LETTER_PAGINATION);

  assert.ok(
    pages.length <= 3,
    `Erwartet hoechstens 3 Seiten, erhalten: ${pages.length}`,
  );
});
