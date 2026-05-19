/** Zeilenbasierte Paginierung für DIN-A4-Briefe (Vorschau und PDF). */

export interface LetterPaginationConfig {
  /** Maximale Zeichen pro Zeile (ungefähr, nach Silbentrennung/Wortumbruch). */
  maxCharsPerLine: number;
  /** Maximale Textzeilen pro Seite (Leerzeilen zählen halb). */
  maxLinesPerPage: number;
}

/** Entspricht etwa jsPDF Helvetica 11pt auf 160 mm Textbreite. */
export const PDF_LETTER_PAGINATION: LetterPaginationConfig = {
  maxCharsPerLine: 88,
  maxLinesPerPage: 44,
};

/** Entspricht der `.sheet`-Vorschau (Newsreader 14.5px, Innenabstand). */
export const PREVIEW_LETTER_PAGINATION: LetterPaginationConfig = {
  maxCharsPerLine: 72,
  maxLinesPerPage: 38,
};

/** Bricht einen Absatz an Wortgrenzen um. */
export function wrapParagraph(paragraph: string, maxCharsPerLine: number): string[] {
  const trimmed = paragraph.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current.length > 0 ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
      continue;
    }

    if (current.length > 0) {
      lines.push(current);
    }

    if (word.length > maxCharsPerLine) {
      let rest = word;
      while (rest.length > maxCharsPerLine) {
        lines.push(rest.slice(0, maxCharsPerLine));
        rest = rest.slice(maxCharsPerLine);
      }
      current = rest;
    } else {
      current = word;
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}

/** Flacht den Brieftext in Zeilen und teilt ihn in Seiten auf. */
export function paginateLetterText(
  body: string,
  config: LetterPaginationConfig,
): string[][] {
  const paragraphs = body.split("\n");
  const logicalLines: string[] = [];

  for (const paragraph of paragraphs) {
    const wrapped = wrapParagraph(paragraph, config.maxCharsPerLine);
    if (wrapped.length === 0) {
      logicalLines.push("");
    } else {
      logicalLines.push(...wrapped);
    }
  }

  if (logicalLines.length === 0) {
    return [[""]];
  }

  const pages: string[][] = [];
  let currentPage: string[] = [];
  let usedLines = 0;

  const flushPage = () => {
    if (currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      usedLines = 0;
    }
  };

  for (const line of logicalLines) {
    const lineCost = line.length === 0 ? 0.5 : 1;

    if (usedLines + lineCost > config.maxLinesPerPage && currentPage.length > 0) {
      flushPage();
    }

    currentPage.push(line);
    usedLines += lineCost;
  }

  flushPage();

  return pages.length > 0 ? pages : [[""]];
}
