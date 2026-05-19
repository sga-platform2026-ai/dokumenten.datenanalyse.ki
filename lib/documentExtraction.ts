import type { ExtractionResult, SupportedMime } from "@/types";

export const MIN_READABLE_CHARS = 80;

const SUPPORTED_MIMES: SupportedMime[] = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const EXTENSION_MIME_MAP: Record<string, SupportedMime> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function validateFileType(file: File): SupportedMime | null {
  if (SUPPORTED_MIMES.includes(file.type as SupportedMime)) {
    return file.type as SupportedMime;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME_MAP[extension] ?? null;
}

function buildResult(
  text: string,
  method: ExtractionResult["method"],
): ExtractionResult {
  const normalized = text.replace(/\s+/g, " ").trim();
  const charCount = normalized.length;

  return {
    text: normalized,
    charCount,
    method,
    readable: charCount >= MIN_READABLE_CHARS,
  };
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");

  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }

  return pages.join("\n\n");
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

/**
 * Platzhalter für OCR-Integration.
 * TODO: OCR_PROVIDER env + tesseract.js / Vercel-kompatible OCR anbinden.
 */
async function extractTextFromImagePlaceholder(): Promise<string> {
  return "";
}

export async function extractDocumentText(file: File): Promise<ExtractionResult> {
  const mime = validateFileType(file);

  if (!mime) {
    return buildResult("", "unsupported");
  }

  try {
    switch (mime) {
      case "application/pdf": {
        const text = await extractPdfText(file);
        return buildResult(text, "pdf");
      }
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        const text = await extractDocxText(file);
        return buildResult(text, "docx");
      }
      case "image/jpeg":
      case "image/png": {
        const text = await extractTextFromImagePlaceholder();
        return buildResult(text, "ocr-placeholder");
      }
      default:
        return buildResult("", "unsupported");
    }
  } catch {
    return buildResult("", mime === "application/pdf" ? "pdf" : "docx");
  }
}
