/** Entfernt KI-Abschnittsüberschriften und überflüssige Leerzeilen aus dem Brieftext. */
export function normalizeLetterText(text: string): string {
  return text
    .replace(/^6\.\s*Fertig formulierter Antwortbrief\s*/i, "")
    .replace(/^\*\*6\.\s*Fertig formulierter Antwortbrief\*\*\s*/im, "")
    .replace(/\*\*/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function letterPdfFileName(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `Antwortschreiben_${stamp}.pdf`;
}
