import { parseAnalysisSections } from "@/lib/parseAiResponse";
import { loadComplaintTemplatesFromFile } from "@/lib/templates/loadComplaintTemplates";
import {
  extractCityFromPostalCity,
  formatComplaintDate,
  parseRecipientAddress,
} from "@/lib/templates/parseRecipientAddress";

export interface ComplaintTemplateData {
  senderName?: string;
  senderStreet?: string;
  senderPostalCity?: string;
  date?: string;
  place?: string;
}

const FALLBACK = "nicht angegeben";

function valueOrFallback(value: string | undefined): string {
  const cleaned = value?.trim();
  return cleaned && cleaned.length > 0 ? cleaned : FALLBACK;
}

function formatArticlesForTemplate(
  articles: Array<{ article: string; reason: string }>,
): string {
  if (articles.length === 0) {
    return "Verletzte Artikel: nicht angegeben";
  }

  return articles
    .map(({ article, reason }) =>
      reason ? `${article} - ${reason}` : article,
    )
    .join("\n");
}

function resolveSenderData(
  parsedRecipient: ReturnType<typeof parseRecipientAddress>,
  overrides: ComplaintTemplateData,
): Required<
  Pick<
    ComplaintTemplateData,
    "senderName" | "senderStreet" | "senderPostalCity" | "date" | "place"
  >
> {
  const postalCity =
    overrides.senderPostalCity ?? parsedRecipient.postalCity ?? undefined;
  const place =
    overrides.place ??
    extractCityFromPostalCity(postalCity) ??
    FALLBACK;

  return {
    senderName: valueOrFallback(
      overrides.senderName ?? parsedRecipient.name,
    ),
    senderStreet: valueOrFallback(
      overrides.senderStreet ?? parsedRecipient.street,
    ),
    senderPostalCity: valueOrFallback(postalCity),
    date: formatComplaintDate(overrides.date),
    place,
  };
}

function fillTemplate(
  template: string,
  analysis: string,
  data: ComplaintTemplateData = {},
): string {
  const parsed = parseAnalysisSections(analysis);
  const sender = resolveSenderData(
    parseRecipientAddress(parsed.recipient),
    data,
  );

  const replacements: Record<string, string> = {
    "{{ABSENDER_NAME}}": sender.senderName,
    "{{ABSENDER_STRASSE}}": sender.senderStreet,
    "{{ABSENDER_PLZ_ORT}}": sender.senderPostalCity,
    "{{BEHOERDE_VOLLER_NAME_UND_ADRESSE}}": valueOrFallback(parsed.authority),
    "{{LEITER_VOLL}}": valueOrFallback(parsed.leader),
    "{{AKTENZEICHEN}}": valueOrFallback(parsed.caseNumber),
    "{{VERLETZTE_ARTIKEL}}": formatArticlesForTemplate(parsed.articles),
    "{{DATUM}}": sender.date,
    "{{ORT}}": sender.place,
  };

  let result = template;
  for (const [placeholder, replacement] of Object.entries(replacements)) {
    result = result.split(placeholder).join(replacement);
  }
  return result.trim();
}

export function generateComplaintLettersFromAnalysis(
  analysis: string,
  data?: ComplaintTemplateData,
): string {
  const templates = loadComplaintTemplatesFromFile();

  return templates
    .map(({ title, body }) => {
      const filled = fillTemplate(body, analysis, data);
      return `## ${title}\n\n${filled}`;
    })
    .join("\n\n---\n\n");
}
