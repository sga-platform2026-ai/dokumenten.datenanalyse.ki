import assert from "node:assert/strict";
import { test } from "node:test";
import { formatExtractionErrorMessage } from "@/lib/extractionErrors";

test("formatExtractionErrorMessage unterscheidet technische PDF-Fehler", () => {
  const message = formatExtractionErrorMessage("test.pdf", {
    text: "",
    charCount: 0,
    readable: false,
    method: "pdf",
    errorCode: "pdf_parse_failed",
  });

  assert.match(message, /konnte in diesem Browser nicht gelesen werden/i);
});

test("formatExtractionErrorMessage behält Lesbarkeits-Hinweis bei leerem Text", () => {
  const message = formatExtractionErrorMessage("scan.pdf", {
    text: "abc",
    charCount: 3,
    readable: false,
    method: "pdf",
    errorCode: "pdf_empty",
  });

  assert.match(message, /nicht ausreichend lesbar/i);
});
