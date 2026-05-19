import { jsPDF } from "jspdf";
import { PDF_LETTER_PAGINATION, paginateLetterText } from "@/lib/letterPagination";
import { letterPdfFileName, normalizeLetterText } from "@/lib/normalizeLetter";

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const MARGIN_MM = 25;
const LINE_HEIGHT_MM = 5.5;
const FONT_SIZE_PT = 11;

function contentBottomY(): number {
  return PAGE_HEIGHT_MM - MARGIN_MM;
}

function drawPageFooter(
  doc: jsPDF,
  pageIndex: number,
  pageCount: number,
): void {
  if (pageCount <= 1) {
    return;
  }
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Seite ${pageIndex + 1} von ${pageCount}`,
    PAGE_WIDTH_MM - MARGIN_MM,
    PAGE_HEIGHT_MM - 12,
    { align: "right" },
  );
  doc.setFontSize(FONT_SIZE_PT);
  doc.setTextColor(0, 0, 0);
}

function renderLinesOnPage(
  doc: jsPDF,
  pageLines: string[],
  maxWidth: number,
  startNewPage: boolean,
): void {
  if (startNewPage) {
    doc.addPage();
  }

  let y = MARGIN_MM;

  for (const line of pageLines) {
    if (line.length === 0) {
      y += LINE_HEIGHT_MM * 0.35;
      if (y > contentBottomY()) {
        doc.addPage();
        y = MARGIN_MM;
      }
      continue;
    }

    const segments = doc.splitTextToSize(line, maxWidth) as string[];
    for (const segment of segments) {
      if (y + LINE_HEIGHT_MM > contentBottomY()) {
        doc.addPage();
        y = MARGIN_MM;
      }
      doc.text(segment, MARGIN_MM, y);
      y += LINE_HEIGHT_MM;
    }
  }
}

/** Erzeugt eine DIN-A4-PDF aus dem Antwortbrief und startet den Download. */
export function downloadLetterPdf(letterText: string, fileName?: string): void {
  const body = normalizeLetterText(letterText);
  if (!body) {
    throw new Error("Kein Briefinhalt zum Exportieren vorhanden.");
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT_SIZE_PT);

  const maxWidth = PAGE_WIDTH_MM - 2 * MARGIN_MM;
  const pages = paginateLetterText(body, PDF_LETTER_PAGINATION);
  const pageCount = pages.length;

  pages.forEach((pageLines, pageIndex) => {
    renderLinesOnPage(doc, pageLines, maxWidth, pageIndex > 0);
    drawPageFooter(doc, pageIndex, pageCount);
  });

  doc.save(fileName ?? letterPdfFileName());
}
