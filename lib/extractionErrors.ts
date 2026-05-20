import type { ExtractionErrorCode, ExtractionResult } from "@/types";

export function formatExtractionErrorMessage(
  fileName: string,
  extraction: ExtractionResult,
): string {
  switch (extraction.errorCode) {
    case "pdf_parse_failed":
      return `"${fileName}" konnte in diesem Browser nicht gelesen werden. Bitte Safari aktualisieren oder Chrome/Firefox verwenden.`;
    case "docx_parse_failed":
      return `"${fileName}" konnte nicht gelesen werden – bitte erneut hochladen.`;
    case "ocr_failed":
      return `"${fileName}" konnte per Texterkennung nicht gelesen werden – bitte bessere Datei hochladen.`;
    case "unsupported_type":
      return `"${fileName}": Dateityp wird nicht unterstützt.`;
    case "pdf_empty":
    default:
      return `"${fileName}" ist nicht ausreichend lesbar – bitte bessere Datei hochladen oder entfernen.`;
  }
}

export function isTechnicalExtractionError(
  errorCode: ExtractionErrorCode | undefined,
): boolean {
  return (
    errorCode === "pdf_parse_failed" ||
    errorCode === "docx_parse_failed" ||
    errorCode === "ocr_failed"
  );
}
