import { GA_IV_KNOWLEDGE_ARTICLES } from "@/lib/knowledge/ga-iv-articles";

/** Serialisiert die Wissensdatenbank für Grok-Systemnachrichten. */
export function formatGaIvKnowledgeForPrompt(): string {
  const blocks = GA_IV_KNOWLEDGE_ARTICLES.map((entry) => {
    const keywords = entry.keywords.join(", ");
    return `${entry.article} – ${entry.title}
Bedeutung: ${entry.meaning}
Prüfregel: ${entry.check_rule}
Stichwörter: ${keywords}`;
  });

  return `GA-IV-WISSENSDATENBANK (verbindlich für die Prüfung – nur diese Artikel und Prüfregeln):

${blocks.join("\n\n")}`;
}
