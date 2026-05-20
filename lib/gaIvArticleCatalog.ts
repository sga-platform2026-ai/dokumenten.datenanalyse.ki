/** Kanonische Reihenfolge – leer bis Wissensbasis und Prompts neu konfiguriert sind. */
export const GA_IV_CANONICAL_ARTICLE_ORDER = [] as const;

export type GaIvCanonicalArticleId =
  (typeof GA_IV_CANONICAL_ARTICLE_ORDER)[number];

const LABEL_BY_ID: Record<string, string> = {};

export function getArticleLabel(id: string): string {
  return LABEL_BY_ID[id] ?? `Artikel ${id.replace("-", " Abs. ")} GA IV`;
}

/** Normalisiert „Artikel 7 Abs. 2 GA IV“ oder „7-2“ auf kanonische ID. */
export function normalizeArticleId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d+(-\d+)?$/u.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(
    /Artikel\s+(\d+)(?:\s*Abs\.?\s*(\d+))?/iu,
  );
  if (!match) {
    return null;
  }

  return match[2] ? `${match[1]}-${match[2]}` : match[1];
}

function numericArticleIdRank(id: string): number[] {
  return id.split("-").map((part) => Number.parseInt(part, 10));
}

function compareNumericArticleIds(a: string, b: string): number {
  const partsA = numericArticleIdRank(a);
  const partsB = numericArticleIdRank(b);
  const len = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < len; i += 1) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return a.localeCompare(b, "de");
}

export function compareArticleIds(a: string, b: string): number {
  const indexA = GA_IV_CANONICAL_ARTICLE_ORDER.indexOf(
    a as GaIvCanonicalArticleId,
  );
  const indexB = GA_IV_CANONICAL_ARTICLE_ORDER.indexOf(
    b as GaIvCanonicalArticleId,
  );

  if (indexA >= 0 && indexB >= 0) {
    return indexA - indexB;
  }
  if (indexA >= 0) {
    return -1;
  }
  if (indexB >= 0) {
    return 1;
  }

  return compareNumericArticleIds(a, b);
}
