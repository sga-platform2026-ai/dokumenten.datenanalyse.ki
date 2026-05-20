/** Kanonische Reihenfolge für stabile Anzeige und Vergleichbarkeit. */
export const GA_IV_CANONICAL_ARTICLE_ORDER = [
  "1",
  "4",
  "7-2",
  "10",
  "27",
  "31",
  "32",
  "33",
  "34",
  "47",
  "49",
  "53",
  "101",
  "131",
  "144",
] as const;

export type GaIvCanonicalArticleId =
  (typeof GA_IV_CANONICAL_ARTICLE_ORDER)[number];

const LABEL_BY_ID: Record<string, string> = {
  "1": "Artikel 1 GA IV",
  "4": "Artikel 4 GA IV",
  "7-2": "Artikel 7 Abs. 2 GA IV",
  "10": "Artikel 10 GA IV",
  "27": "Artikel 27 GA IV",
  "31": "Artikel 31 GA IV",
  "32": "Artikel 32 GA IV",
  "33": "Artikel 33 GA IV",
  "34": "Artikel 34 GA IV",
  "47": "Artikel 47 GA IV",
  "49": "Artikel 49 GA IV",
  "53": "Artikel 53 GA IV",
  "101": "Artikel 101 GA IV",
  "131": "Artikel 131 GA IV",
  "144": "Artikel 144 GA IV",
};

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
