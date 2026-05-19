import { writeFileSync } from "node:fs";
import { GA_IV_KNOWLEDGE } from "../lib/knowledge/ga-iv-knowledge";

const header = `# GA-IV-Wissensdatenbank (Referenz)

Maschinelle Quelle: \`lib/knowledge/ga-iv-articles.ts\` – diese Datei wird aus dem TypeScript-Modul erzeugt (\`npm run gen:knowledge-md\`).

`;

writeFileSync("lib/knowledge/ga-iv-wissensdatenbank.md", `${header}${GA_IV_KNOWLEDGE}\n`, "utf8");
