import { writeFileSync } from "node:fs";
import { GA_IV_KNOWLEDGE_ARTICLES } from "../lib/knowledge/ga-iv-articles";

const OUTPUT_PATH = "config/GA-IV-Wissensdatenbank.md";

const overview = GA_IV_KNOWLEDGE_ARTICLES.map(
  (entry) => `- ${entry.article} – ${entry.title}`,
).join("\n");

const details = GA_IV_KNOWLEDGE_ARTICLES.map((entry) => {
  const keywords = entry.keywords.join(", ");
  return `## ${entry.article} – ${entry.title}

**Bedeutung:** ${entry.meaning}

**Prüfregel:** ${entry.check_rule}

**Stichwörter:** ${keywords}`;
}).join("\n\n");

const content = `# GA-IV-Wissensdatenbank

Maschinelle Quelle: \`lib/knowledge/ga-iv-articles.ts\` – diese Datei wird erzeugt mit \`npm run gen:knowledge-md\`.

Die KI-Analyse kann erst laufen, wenn zusätzlich Prüfauftrag und Prompts konfiguriert sind (\`ANALYSIS_PROMPTS_CONFIGURED = true\`).

---

## Einzelne Artikel des IV. Genfer Abkommens

${overview}

---

${details}
`;

writeFileSync(OUTPUT_PATH, `${content}\n`, "utf8");
console.log(`Geschrieben: ${OUTPUT_PATH}`);
