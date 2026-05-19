import { SYSTEM_PROMPT } from "@/lib/systemPrompt";

/** Systemnachricht für Grok: Prüfauftrag + technische Ausgaberegeln. */
export function buildSystemMessage(): string {
  return SYSTEM_PROMPT;
}
