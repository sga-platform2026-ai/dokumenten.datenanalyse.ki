import {
  compareArticleIds,
  getArticleLabel,
  normalizeArticleId,
} from "@/lib/gaIvArticleCatalog";

export const ARTICLES_JSON_START = "<!--GA_IV_ARTICLES-->";
export const ARTICLES_JSON_END = "<!--/GA_IV_ARTICLES-->";

export interface ViolatedArticleInput {
  id: string;
  label?: string;
  reason: string;
}

export interface NormalizedViolatedArticle {
  id: string;
  article: string;
  reason: string;
}

interface ArticlesJsonPayload {
  violatedArticles?: ViolatedArticleInput[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseArticlesPayload(raw: string): ArticlesJsonPayload | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return null;
    }
    return parsed as ArticlesJsonPayload;
  } catch {
    return null;
  }
}

export function extractStructuredArticles(
  text: string,
): ViolatedArticleInput[] | null {
  const start = text.indexOf(ARTICLES_JSON_START);
  const end = text.indexOf(ARTICLES_JSON_END);
  if (start < 0 || end < 0 || end <= start) {
    return null;
  }

  const jsonRaw = text
    .slice(start + ARTICLES_JSON_START.length, end)
    .trim();
  const payload = parseArticlesPayload(jsonRaw);
  if (!payload?.violatedArticles || !Array.isArray(payload.violatedArticles)) {
    return null;
  }

  return payload.violatedArticles;
}

export function stripArticlesJsonBlock(text: string): string {
  const start = text.indexOf(ARTICLES_JSON_START);
  if (start < 0) {
    return text;
  }
  const end = text.indexOf(ARTICLES_JSON_END);
  if (end < 0) {
    return text.slice(0, start).trimEnd();
  }
  return `${text.slice(0, start)}${text.slice(end + ARTICLES_JSON_END.length)}`
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeViolatedArticles(
  items: ViolatedArticleInput[],
): NormalizedViolatedArticle[] {
  const byId = new Map<string, NormalizedViolatedArticle>();

  for (const item of items) {
    const id = normalizeArticleId(item.id) ?? normalizeArticleId(item.label ?? "");
    const reason = item.reason?.trim() ?? "";
    if (!id || !reason) {
      continue;
    }

    const article = item.label?.trim() || getArticleLabel(id);
    const existing = byId.get(id);
    if (!existing || reason.length > existing.reason.length) {
      byId.set(id, { id, article, reason });
    }
  }

  return [...byId.values()].sort((a, b) => compareArticleIds(a.id, b.id));
}

export function formatArticlesSection(
  articles: NormalizedViolatedArticle[],
): string {
  if (articles.length === 0) {
    return "5.2. Verletzte Artikel des IV. Genfer Abkommens\nKeine Verstöße nach gegenwärtiger Auswertung.";
  }

  const lines = articles.map((a) => `${a.article} – ${a.reason}`);
  return `5.2. Verletzte Artikel des IV. Genfer Abkommens\n${lines.join("\n")}`;
}

export function buildArticlesJsonBlock(
  articles: NormalizedViolatedArticle[],
): string {
  const payload = {
    violatedArticles: articles.map((a) => ({
      id: a.id,
      label: a.article,
      reason: a.reason,
    })),
  };
  return `${ARTICLES_JSON_START}${JSON.stringify(payload)}${ARTICLES_JSON_END}`;
}

/** Ersetzt Abschnitt 5.2 durch normalisierte Liste und entfernt JSON-Marker aus dem Anzeigetext. */
export function applyNormalizedArticlesToAnalysis(analysis: string): {
  displayAnalysis: string;
  articles: NormalizedViolatedArticle[];
} {
  const structured = extractStructuredArticles(analysis);
  const stripped = stripArticlesJsonBlock(analysis);

  let articles: NormalizedViolatedArticle[];
  if (structured) {
    articles = normalizeViolatedArticles(structured);
  } else {
    articles = normalizeViolatedArticles(
      parseArticlesFromLegacyText(stripped),
    );
  }

  const section = formatArticlesSection(articles);
  const displayAnalysis = replaceArticlesSection(stripped, section);

  return { displayAnalysis, articles };
}

function parseArticlesFromLegacyText(
  analysis: string,
): ViolatedArticleInput[] {
  const articlesSection = analysis.split(/5\.2\.\s*Verletzte Artikel/i)[1] ?? "";
  const endMarkers = ["6. Fertig formulierter Antwortbrief", "6. Antwortbrief"];
  let sectionBody = articlesSection;
  for (const marker of endMarkers) {
    const idx = sectionBody.indexOf(marker);
    if (idx >= 0) {
      sectionBody = sectionBody.slice(0, idx);
    }
  }

  return sectionBody
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^Artikel\s+\d+/iu.test(line))
    .map((line) => {
      const dashIndex = line.indexOf("–");
      const hyphenIndex = line.indexOf("-");
      const splitIndex =
        dashIndex > -1 ? dashIndex : hyphenIndex > -1 ? hyphenIndex : -1;

      if (splitIndex < 0) {
        return { id: line, reason: "" };
      }

      const label = line.slice(0, splitIndex).trim();
      const reason = line.slice(splitIndex + 1).trim();
      const id = normalizeArticleId(label) ?? label;
      return { id, label, reason };
    });
}

function replaceArticlesSection(analysis: string, section: string): string {
  const marker = /5\.2\.\s*Verletzte Artikel[^\n]*/iu;
  if (!marker.test(analysis)) {
    return `${analysis.trim()}\n\n${section}`;
  }

  const parts = analysis.split(/5\.2\.\s*Verletzte Artikel[^\n]*\n?/iu);
  if (parts.length < 2) {
    return analysis;
  }

  const tail = parts[1];
  const endMarkers = ["6. Fertig formulierter Antwortbrief", "6. Antwortbrief"];
  let tailStart = tail.length;
  for (const endMarker of endMarkers) {
    const idx = tail.indexOf(endMarker);
    if (idx >= 0 && idx < tailStart) {
      tailStart = idx;
    }
  }

  const rest = tail.slice(tailStart);
  return `${parts[0].trimEnd()}\n\n${section}${rest ? `\n\n${rest.trim()}` : ""}`.trim();
}
