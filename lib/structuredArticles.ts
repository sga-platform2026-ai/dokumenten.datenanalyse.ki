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

interface ArticleReviewInput {
  id: string;
  violated?: boolean;
  affected?: boolean;
  label?: string;
  reason?: string;
}

interface PotentiallyAffectedInput {
  id: string;
  label?: string;
  note?: string;
}

interface ArticlesJsonPayload {
  violatedArticles?: ViolatedArticleInput[];
  articleReviews?: ArticleReviewInput[];
  potentiallyAffected?: PotentiallyAffectedInput[];
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

const FALLBACK_REASON =
  "Verstoß im Schreiben festgestellt (keine Detailbegründung geliefert).";

function reviewsToViolatedInputs(
  reviews: ArticleReviewInput[],
): ViolatedArticleInput[] {
  const items: ViolatedArticleInput[] = [];

  for (const review of reviews) {
    if (review.violated === false) {
      continue;
    }
    const reason = review.reason?.trim() ?? "";
    if (!reason && review.violated !== true) {
      continue;
    }
    items.push({
      id: review.id,
      label: review.label,
      reason: reason || FALLBACK_REASON,
    });
  }

  return items;
}

function reviewsToAffectedInputs(
  reviews: ArticleReviewInput[],
): PotentiallyAffectedInput[] {
  const items: PotentiallyAffectedInput[] = [];

  for (const review of reviews) {
    if (review.violated === true) {
      continue;
    }
    if (review.affected !== true) {
      continue;
    }
    items.push({
      id: review.id,
      label: review.label,
      note: review.reason?.trim() || undefined,
    });
  }

  return items;
}

interface PayloadExtractionResult {
  violated: ViolatedArticleInput[] | null;
  affected: PotentiallyAffectedInput[];
}

function payloadToExtraction(
  payload: ArticlesJsonPayload,
): PayloadExtractionResult {
  let violated: ViolatedArticleInput[] | null = null;
  let affected: PotentiallyAffectedInput[] = [];

  if (payload.articleReviews && Array.isArray(payload.articleReviews)) {
    violated = reviewsToViolatedInputs(payload.articleReviews);
    affected = reviewsToAffectedInputs(payload.articleReviews);
  } else if (
    payload.violatedArticles &&
    Array.isArray(payload.violatedArticles)
  ) {
    violated = payload.violatedArticles;
  }

  if (payload.potentiallyAffected && Array.isArray(payload.potentiallyAffected)) {
    affected = [...affected, ...payload.potentiallyAffected];
  }

  return { violated, affected };
}

export interface ExtractStructuredResult {
  items: ViolatedArticleInput[] | null;
  affectedItems: PotentiallyAffectedInput[];
  hasJsonStart: boolean;
  hasJsonEnd: boolean;
  jsonValid: boolean;
  jsonRecovered: boolean;
}

function tryRecoverJsonAfterMarker(text: string, startIndex: number): string | null {
  const slice = text.slice(startIndex + ARTICLES_JSON_START.length);

  const candidateEnds = [
    /\]\s*\}\s*<!--\/GA_IV_ARTICLES-->/iu,
    /\]\s*\}/u,
  ];

  for (const pattern of candidateEnds) {
    const match = slice.match(pattern);
    if (match) {
      const cut = slice.slice(0, (match.index ?? 0) + match[0].length);
      return cut.replace(/<!--\/GA_IV_ARTICLES-->\s*$/iu, "").trim();
    }
  }

  return null;
}

export function extractStructuredArticlesDetailed(
  text: string,
): ExtractStructuredResult {
  const start = text.indexOf(ARTICLES_JSON_START);
  if (start < 0) {
    return {
      items: null,
      affectedItems: [],
      hasJsonStart: false,
      hasJsonEnd: false,
      jsonValid: false,
      jsonRecovered: false,
    };
  }

  const end = text.indexOf(ARTICLES_JSON_END);
  const hasJsonEnd = end >= 0 && end > start;

  let jsonRaw: string | null = null;
  let jsonRecovered = false;

  if (hasJsonEnd) {
    jsonRaw = text.slice(start + ARTICLES_JSON_START.length, end).trim();
  } else {
    jsonRaw = tryRecoverJsonAfterMarker(text, start);
    jsonRecovered = jsonRaw !== null;
  }

  if (!jsonRaw) {
    return {
      items: null,
      affectedItems: [],
      hasJsonStart: true,
      hasJsonEnd,
      jsonValid: false,
      jsonRecovered,
    };
  }

  const payload = parseArticlesPayload(jsonRaw);
  if (!payload) {
    return {
      items: null,
      affectedItems: [],
      hasJsonStart: true,
      hasJsonEnd,
      jsonValid: false,
      jsonRecovered,
    };
  }

  const { violated, affected } = payloadToExtraction(payload);
  return {
    items: violated,
    affectedItems: affected,
    hasJsonStart: true,
    hasJsonEnd,
    jsonValid: true,
    jsonRecovered,
  };
}

export function extractStructuredArticles(
  text: string,
): ViolatedArticleInput[] | null {
  return extractStructuredArticlesDetailed(text).items;
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

export interface NormalizedAffectedArticle {
  id: string;
  article: string;
  note?: string;
}

export interface AnalyzeArticlesResult {
  displayAnalysis: string;
  articles: NormalizedViolatedArticle[];
  affected: NormalizedAffectedArticle[];
  structuredCount: number;
  proseCount: number;
  affectedCount: number;
  hasJsonStart: boolean;
  hasJsonEnd: boolean;
  jsonValid: boolean;
  jsonRecovered: boolean;
}

function normalizeAffectedArticles(
  items: PotentiallyAffectedInput[],
  excludeIds: Set<string>,
): NormalizedAffectedArticle[] {
  const byId = new Map<string, NormalizedAffectedArticle>();

  for (const item of items) {
    const id = normalizeArticleId(item.id) ?? normalizeArticleId(item.label ?? "");
    if (!id || excludeIds.has(id)) {
      continue;
    }
    const article = item.label?.trim() || getArticleLabel(id);
    const note = item.note?.trim() || undefined;
    const existing = byId.get(id);
    if (!existing || (note && (!existing.note || note.length > existing.note.length))) {
      byId.set(id, { id, article, note });
    }
  }

  return [...byId.values()].sort((a, b) => compareArticleIds(a.id, b.id));
}

/** Ersetzt Abschnitt 5.2 durch normalisierte Liste und entfernt JSON-Marker aus dem Anzeigetext. */
export function applyNormalizedArticlesToAnalysis(
  analysis: string,
): AnalyzeArticlesResult {
  const detail = extractStructuredArticlesDetailed(analysis);
  const stripped = stripArticlesJsonBlock(analysis);
  const prose = parseArticlesFromLegacyText(stripped);

  const mergedInputs: ViolatedArticleInput[] = [];
  if (detail.items) {
    mergedInputs.push(...detail.items);
  }
  mergedInputs.push(...prose);
  const articles = normalizeViolatedArticles(mergedInputs);

  const violatedIds = new Set(articles.map((a) => a.id));
  const affected = normalizeAffectedArticles(detail.affectedItems, violatedIds);

  const section = formatArticlesSection(articles);
  const displayAnalysis = replaceArticlesSection(stripped, section);

  return {
    displayAnalysis,
    articles,
    affected,
    structuredCount: detail.items?.length ?? 0,
    proseCount: prose.length,
    affectedCount: affected.length,
    hasJsonStart: detail.hasJsonStart,
    hasJsonEnd: detail.hasJsonEnd,
    jsonValid: detail.jsonValid,
    jsonRecovered: detail.jsonRecovered,
  };
}

function getArticlesSectionBody(analysis: string): string {
  const articlesSection = analysis.split(/5\.2\.\s*Verletzte Artikel/i)[1] ?? "";
  const endMarkers = ["6. Fertig formulierter Antwortbrief", "6. Antwortbrief"];
  let sectionBody = articlesSection;
  for (const marker of endMarkers) {
    const idx = sectionBody.indexOf(marker);
    if (idx >= 0) {
      sectionBody = sectionBody.slice(0, idx);
    }
  }
  return sectionBody;
}

function splitArticleLine(line: string): ViolatedArticleInput | null {
  const dashIndex = line.indexOf("–");
  const hyphenIndex = line.indexOf("-");
  const splitIndex =
    dashIndex > -1 ? dashIndex : hyphenIndex > -1 ? hyphenIndex : -1;

  if (splitIndex < 0) {
    const id = normalizeArticleId(line);
    if (!id) {
      return null;
    }
    return { id, label: line, reason: "" };
  }

  const label = line.slice(0, splitIndex).trim();
  const reason = line.slice(splitIndex + 1).trim();
  const id = normalizeArticleId(label);
  if (!id) {
    return null;
  }
  return { id, label, reason };
}

function parseArticlesFromLegacyText(
  analysis: string,
): ViolatedArticleInput[] {
  const lines = getArticlesSectionBody(analysis)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("<!--"));

  const results: ViolatedArticleInput[] = [];
  let pending: ViolatedArticleInput | null = null;

  const flushPending = () => {
    if (!pending) return;
    if (pending.reason) {
      results.push(pending);
    } else {
      results.push({ ...pending, reason: FALLBACK_REASON });
    }
    pending = null;
  };

  for (const line of lines) {
    if (/^Artikel\s+\d+/iu.test(line)) {
      flushPending();
      pending = splitArticleLine(line);
      if (pending?.reason) {
        results.push(pending);
        pending = null;
      }
      continue;
    }

    if (pending) {
      const reasonFromLabel = line.replace(
        /^Begründung(?:\s+mit\s+Bezug\s+zum\s+Schreiben)?\s*:\s*/iu,
        "",
      );
      results.push({
        ...pending,
        reason: reasonFromLabel || line,
      });
      pending = null;
      continue;
    }
  }

  flushPending();

  return results;
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
