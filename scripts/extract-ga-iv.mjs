import fs from "node:fs";
import path from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const PDF_PATH =
  process.argv[2] ??
  "c:/Users/Barny/Downloads/Voelkerrechtvorschriften.pdf";

/** Volltext beginnt auf PDF-Seite ~155 (TOC), nicht bei frühen Erwähnungen. */
function isGaIvConventionStart(text) {
  return (
    text.includes("Genfer Abkommen IV") &&
    text.includes("SR 0.518.51") &&
    (text.includes("über den Schutz von Zivilpersonen") ||
      text.includes("Schutz von Zivilpersonen in Kriegszeiten"))
  );
}

function isGaIvConventionEnd(text) {
  return text.includes("Zusatzprotokoll I zu den Genfer Abkommen");
}

async function extractAllPages(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await getDocument({ data, useSystemFonts: true }).promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push({ pageNumber: i, text });
  }

  return pages;
}

function findStartPage(pages) {
  for (let i = 0; i < pages.length; i += 1) {
    if (isGaIvConventionStart(pages[i].text)) {
      return i;
    }
  }
  return -1;
}

function findEndPage(pages, startIdx) {
  for (let i = startIdx + 1; i < pages.length; i += 1) {
    if (isGaIvConventionEnd(pages[i].text)) {
      return i;
    }
  }
  return -1;
}

function normalizeText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/(\d+)\s+–\s+GAIA AKADEMIE/g, "\n\n$&")
    .replace(/–\s+Völkerrechtvorschriften\s+–\s+\d+/g, "")
    .trim();
}

async function main() {
  console.error("Lese PDF:", PDF_PATH);
  const pages = await extractAllPages(PDF_PATH);
  console.error("Seiten gesamt:", pages.length);

  const startIdx = findStartPage(pages);
  if (startIdx < 0) {
    console.error("GA IV Start nicht gefunden.");
    process.exit(1);
  }

  const endIdx = findEndPage(pages, startIdx);
  if (endIdx < 0) {
    console.error("GA IV Ende nicht gefunden.");
    process.exit(1);
  }

  const slice = pages.slice(startIdx, endIdx);
  const combined = slice.map((p) => p.text).join("\n\n");
  const normalized = normalizeText(combined);

  console.error(
    `GA IV: Seiten ${slice[0].pageNumber}–${pages[endIdx - 1]?.pageNumber ?? "?"} (${slice.length} Seiten)`,
  );
  console.error("Zeichen:", normalized.length);

  const outDir = path.join(process.cwd(), "lib", "knowledge");
  fs.mkdirSync(outDir, { recursive: true });

  const mdPath = path.join(outDir, "ga-iv-voelkerrecht.md");
  const header = `# Genfer Abkommen IV (Auszug aus GAIA Völkerrechtvorschriften)

Quelle: Voelkerrechtvorschriften.pdf (GAIA Akademie, Auflage 8.1)
SR 0.518.51 – Nur Teil IV (Zivilistenschutz), ohne Zusatzprotokolle.

---

`;
  fs.writeFileSync(mdPath, header + normalized, "utf8");
  console.error("Geschrieben:", mdPath);

  const tsPath = path.join(outDir, "ga-iv-knowledge.ts");
  const escaped = normalized
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
  const tsContent = `/**
 * Automatisch generiert – scripts/extract-ga-iv.mjs
 * Nur Genfer Abkommen IV (SR 0.518.51), keine Zusatzprotokolle.
 */
export const GA_IV_KNOWLEDGE = \`${escaped}\`;

export const GA_IV_KNOWLEDGE_META = {
  source: "Voelkerrechtvorschriften.pdf (GAIA Akademie)",
  convention: "Genfer Abkommen IV",
  srNumber: "0.518.51",
  pdfStartPage: ${slice[0].pageNumber},
  pdfEndPage: ${pages[endIdx - 1]?.pageNumber ?? slice[slice.length - 1].pageNumber},
  charCount: ${normalized.length},
} as const;
`;
  fs.writeFileSync(tsPath, tsContent, "utf8");
  console.error("Geschrieben:", tsPath);

  // Kurzinfo für Konsole
  process.stdout.write(
    JSON.stringify({
      startPage: slice[0].pageNumber,
      endPage: pages[endIdx - 1]?.pageNumber,
      pageCount: slice.length,
      charCount: normalized.length,
      mdPath,
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
