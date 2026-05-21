export type LetterLineKind =
  | "title-tight"
  | "section"
  | "az-label"
  | "az-value"
  | "betreff"
  | "grundlage"
  | "body";

export interface StyledLetterLine {
  text: string;
  kind: LetterLineKind;
  bold: boolean;
}

const SECTION_LABELS = new Set([
  "Absender",
  "Uebermittlung",
  "Adressat",
  "Geschaeftszahl / Aktenzeichen",
  "Voelkerrechtliche Signatur ohne Recht-Verlust",
  "Signierung (ohne Rechteverlust)",
]);

export function cssClassForLetterLineKind(kind: LetterLineKind): string {
  switch (kind) {
    case "title-tight":
      return "letter-title-line";
    case "section":
      return "letter-section";
    case "az-label":
      return "letter-az-label";
    case "az-value":
      return "letter-az-value";
    case "betreff":
      return "letter-betreff";
    case "grundlage":
      return "letter-grundlage";
    default:
      return "letter-body";
  }
}

export function classifyLetterLine(
  line: string,
  context: { beforeAbsender: boolean; previousLine: string | null },
): StyledLetterLine {
  const trimmed = line.trim();

  if (trimmed.length === 0) {
    return { text: "", kind: "body", bold: false };
  }

  if (SECTION_LABELS.has(trimmed)) {
    const isAz = trimmed === "Geschaeftszahl / Aktenzeichen";
    return {
      text: trimmed,
      kind: isAz ? "az-label" : "section",
      bold: true,
    };
  }

  if (trimmed.startsWith("Betreff:")) {
    return { text: trimmed, kind: "betreff", bold: true };
  }

  if (trimmed.startsWith("Voelkerrechtliche Grundlage:")) {
    return { text: trimmed, kind: "grundlage", bold: true };
  }

  if (context.previousLine?.trim() === "Geschaeftszahl / Aktenzeichen") {
    return { text: trimmed, kind: "az-value", bold: true };
  }

  if (context.beforeAbsender) {
    return { text: trimmed, kind: "title-tight", bold: false };
  }

  return { text: trimmed, kind: "body", bold: false };
}

/** Klassifiziert alle Zeilen des Brieftexts fuer Vorschau und PDF. */
export function styledLetterLines(body: string): StyledLetterLine[] {
  const lines = body.split("\n");
  const styled: StyledLetterLine[] = [];
  let beforeAbsender = true;
  let previousLine: string | null = null;

  for (const line of lines) {
    if (line.trim() === "Absender") {
      beforeAbsender = false;
    }

    const entry = classifyLetterLine(line, { beforeAbsender, previousLine });
    styled.push(entry);
    previousLine = line.trim().length > 0 ? line : previousLine;
  }

  return styled;
}
