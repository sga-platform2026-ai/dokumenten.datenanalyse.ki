import { jsPDF } from "jspdf";
import { PDF_LETTER_PAGINATION, paginateLetterText } from "@/lib/letterPagination";
import { classifyLetterLine } from "@/lib/letterLineStyle";
import { letterPdfFileName, normalizeLetterText } from "@/lib/normalizeLetter";

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const MARGIN_MM = 25;
const BOTTOM_MARGIN_MM = 32;
const LINE_HEIGHT_MM = 5.5;
const FONT_SIZE_PT = 11;

function contentBottomY(): number {
  return PAGE_HEIGHT_MM - BOTTOM_MARGIN_MM;
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
  context: { beforeAbsender: boolean; previousLine: string | null },
): { beforeAbsender: boolean; previousLine: string | null } {
  if (startNewPage) {
    doc.addPage();
  }

  let y = MARGIN_MM;
  let { beforeAbsender, previousLine } = context;

  for (const line of pageLines) {
    if (line.length === 0) {
      y += LINE_HEIGHT_MM * 0.35;
      if (y > contentBottomY()) {
        doc.addPage();
        y = MARGIN_MM;
      }
      continue;
    }

    const style = classifyLetterLine(line, { beforeAbsender, previousLine });
    if (line.trim() === "Absender") {
      beforeAbsender = false;
    }
    previousLine = line;

    doc.setFont("helvetica", style.bold ? "bold" : "normal");

    const segments = doc.splitTextToSize(line, maxWidth) as string[];
    for (const segment of segments) {
      if (y + LINE_HEIGHT_MM > contentBottomY()) {
        doc.addPage();
        y = MARGIN_MM;
      }
      doc.text(segment, MARGIN_MM, y);
      y += style.kind === "title-tight" ? LINE_HEIGHT_MM * 0.85 : LINE_HEIGHT_MM;
    }
  }

  doc.setFont("helvetica", "normal");
  return { beforeAbsender, previousLine };
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
  let renderContext = {
    beforeAbsender: true,
    previousLine: null as string | null,
  };

  pages.forEach((pageLines, pageIndex) => {
    renderContext = renderLinesOnPage(
      doc,
      pageLines,
      maxWidth,
      pageIndex > 0,
      renderContext,
    );
    drawPageFooter(doc, pageIndex, pageCount);
  });

  doc.save(fileName ?? letterPdfFileName());
}
