import type { ProcessingStatus } from "@/types";

export interface ProcessingMessage {
  title: string;
  hint?: string;
}

export function getProcessingMessage(
  status: ProcessingStatus,
): ProcessingMessage | null {
  switch (status) {
    case "reading":
      return {
        title: "Dokument wird gelesen …",
        hint: "Text wird aus der Datei extrahiert",
      };
    case "checking":
      return {
        title: "Lesbarkeit wird geprüft …",
        hint: "Bildqualität und erkennbarer Text",
      };
    case "analyzing":
      return {
        title: "Antwortbrief wird formuliert …",
        hint: "GA-IV-Analyse und Brieftext – kann etwas dauern",
      };
    default:
      return null;
  }
}

export function isBusyStatus(status: ProcessingStatus): boolean {
  return status === "reading" || status === "checking" || status === "analyzing";
}
