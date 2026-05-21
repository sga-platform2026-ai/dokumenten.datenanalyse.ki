export interface ParsedRecipientAddress {
  name?: string;
  street?: string;
  postalCity?: string;
}

const PLZ_CITY_PATTERN = /^(\d{5})\s+(.+)$/u;

function stripContactInfo(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w.-]+\.\w+/gu, "")
    .replace(/\+[\d\s()/.\-]+/gu, "")
    .replace(/\(\+?\d[\d\s()\-]+\)/gu, "")
    .replace(/,\s*,/gu, ",")
    .trim();
}

function parseMultiline(lines: string[]): ParsedRecipientAddress {
  const plzLineIndex = lines.findIndex((line) => PLZ_CITY_PATTERN.test(line));
  if (plzLineIndex < 0) {
    if (lines.length >= 3) {
      return {
        name: lines.slice(0, -2).join(" "),
        street: lines.at(-2),
        postalCity: lines.at(-1),
      };
    }
    if (lines.length === 2) {
      return { name: lines[0], street: lines[1] };
    }
    return { name: lines[0] };
  }

  const plzMatch = lines[plzLineIndex].match(PLZ_CITY_PATTERN);
  const postalCity = plzMatch
    ? `${plzMatch[1]} ${plzMatch[2]}`
    : lines[plzLineIndex];

  if (plzLineIndex >= 2) {
    return {
      name: lines.slice(0, plzLineIndex - 1).join(" "),
      street: lines[plzLineIndex - 1],
      postalCity,
    };
  }

  if (plzLineIndex === 1) {
    return { name: lines[0], postalCity };
  }

  return { postalCity };
}

function parseCommaSeparated(parts: string[]): ParsedRecipientAddress {
  const plzPartIndex = parts.findIndex((part) => PLZ_CITY_PATTERN.test(part));
  if (plzPartIndex >= 2) {
    return {
      name: parts.slice(0, plzPartIndex - 1).join(", "),
      street: parts[plzPartIndex - 1],
      postalCity: parts[plzPartIndex],
    };
  }

  if (plzPartIndex === 1) {
    return { name: parts[0], postalCity: parts[1] };
  }

  if (parts.length >= 3) {
    return {
      name: parts[0],
      street: parts[1],
      postalCity: parts[2],
    };
  }

  if (parts.length === 2) {
    return { name: parts[0], street: parts[1] };
  }

  return { name: parts[0] };
}

/** Zerlegt den Empfaenger-Block der Analyse in Absender-Felder fuer Beschwerdevorlagen. */
export function parseRecipientAddress(
  recipient: string | undefined,
): ParsedRecipientAddress {
  if (!recipient?.trim()) {
    return {};
  }

  const cleaned = stripContactInfo(recipient);
  const lines = cleaned
    .split(/\n/u)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return parseMultiline(lines);
  }

  const parts = cleaned
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return parseCommaSeparated(parts);
}

export function extractCityFromPostalCity(
  postalCity: string | undefined,
): string | undefined {
  const match = postalCity?.match(PLZ_CITY_PATTERN);
  return match?.[2]?.trim();
}

export function formatComplaintDate(date?: string): string {
  if (date?.trim()) {
    return date.trim();
  }

  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${now.getFullYear()}`;
}
