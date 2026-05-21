import { readFileSync } from "node:fs";
import { join } from "node:path";

export const COMPLAINT_TEMPLATES_RELATIVE_PATH =
  "config/GA-IV-Beschwerde-Vorlagen.md";

const TEMPLATES_PATH = join(process.cwd(), COMPLAINT_TEMPLATES_RELATIVE_PATH);

export interface ComplaintTemplateSection {
  title: string;
  body: string;
}

let cachedTemplates: ComplaintTemplateSection[] | null = null;

/** Liest alle `## Vorlage GA IV Beschwerde`-Abschnitte aus der Markdown-Datei. */
export function loadComplaintTemplatesFromFile(): ComplaintTemplateSection[] {
  if (cachedTemplates) {
    return cachedTemplates;
  }

  const raw = readFileSync(TEMPLATES_PATH, "utf8");
  const sections = raw.split(/\n(?=## Vorlage GA IV Beschwerde)/u);

  const templates = sections
    .filter((section) => section.startsWith("## Vorlage GA IV Beschwerde"))
    .map((section) => {
      const newlineIndex = section.indexOf("\n");
      const title = section.slice(3, newlineIndex).trim();
      const body = section.slice(newlineIndex + 1).trim();
      return { title, body };
    })
    .filter((section) => section.body.length > 0);

  if (templates.length === 0) {
    throw new Error(
      `${COMPLAINT_TEMPLATES_RELATIVE_PATH}: Keine Beschwerdevorlagen gefunden.`,
    );
  }

  cachedTemplates = templates;
  return templates;
}

export function resetComplaintTemplatesCache(): void {
  cachedTemplates = null;
}
