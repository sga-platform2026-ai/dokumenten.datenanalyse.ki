import { jsPDF } from "jspdf";
import { letterPdfFileName, normalizeLetterText } from "@/lib/normalizeLetter";

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const MARGIN_MM = 25;
const LINE_HEIGHT_MM = 5.5;
const FONT_SIZE_PT = 11;

function addWrappedLines(
  doc: jsPDF,
  paragraphs: string[],
  startY: number,
): number {
  const maxWidth = PAGE_WIDTH_MM - 2 * MARGIN_MM;
  let y = startY;

  for (const paragraph of paragraphs) {
    const wrapped = doc.splitTextToSize(paragraph, maxWidth) as string[];

    for (const line of wrapped) {
      if (y > PAGE_HEIGHT_MM - MARGIN_MM) {
        doc.addPage();
        y = MARGIN_MM;
      }
      doc.text(line, MARGIN_MM, y);
      y += LINE_HEIGHT_MM;
    }

    y += LINE_HEIGHT_MM * 0.35;
  }

  return y;
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

  const paragraphs = body.split("\n").map((line) => line.trimEnd());
  addWrappedLines(doc, paragraphs, MARGIN_MM);

  doc.save(fileName ?? letterPdfFileName());
}
