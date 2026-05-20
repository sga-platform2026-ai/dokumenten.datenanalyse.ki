export type ContactPartKind = "text" | "email" | "phone";

export interface ContactPart {
  kind: ContactPartKind;
  value: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

function digitCount(value: string): number {
  return value.replace(/\D/gu, "").length;
}

export function detectContactKind(value: string): ContactPartKind {
  const trimmed = value.trim();
  if (EMAIL_PATTERN.test(trimmed)) {
    return "email";
  }

  const digits = digitCount(trimmed);
  if (
    digits >= 6 &&
    /(?:\+?\d|(?:tel|telefon|fon)\b)/iu.test(trimmed)
  ) {
    return "phone";
  }

  if (digits >= 8 && /^\+?\d[\d\s()./-]+$/u.test(trimmed)) {
    return "phone";
  }

  return "text";
}

export function splitContactParts(text: string): ContactPart[] {
  return text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((value) => ({
      kind: detectContactKind(value),
      value,
    }));
}

export function toTelHref(phone: string): string {
  const normalized = phone.replace(/[^\d+]/gu, "");
  return `tel:${normalized}`;
}

export function toMailtoHref(email: string): string {
  return `mailto:${email.trim()}`;
}
