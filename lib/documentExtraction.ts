import {
  extractTextFromCanvases,
  extractTextWithTesseract,
  type OcrProgressHandler,
} from "@/lib/imageOcr";
import { openPdfDocument, type PdfDocumentProxy } from "@/lib/pdfJsClient";
import type {
  ExtractionErrorCode,
  ExtractionResult,
  SupportedMime,
} from "@/types";

export const MIN_READABLE_CHARS = 80;

const SUPPORTED_MIMES: SupportedMime[] = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MIME_ALIASES: Record<string, SupportedMime> = {
  "image/x-tiff": "image/tiff",
};

const EXTENSION_MIME_MAP: Record<string, SupportedMime> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  tif: "image/tiff",
  tiff: "image/tiff",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const IMAGE_MIMES: SupportedMime[] = ["image/jpeg", "image/png", "image/tiff"];

/** Render-Skalierung für PDF-Seiten beim OCR-Fallback (2x liefert robuste OCR). */
const OCR_RENDER_SCALE = 2;

export function validateFileType(file: File): SupportedMime | null {
  const alias = MIME_ALIASES[file.type];
  if (alias) {
    return alias;
  }

  if (SUPPORTED_MIMES.includes(file.type as SupportedMime)) {
    return file.type as SupportedMime;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME_MAP[extension] ?? null;
}

function buildResult(
  text: string,
  method: ExtractionResult["method"],
  errorCode?: ExtractionErrorCode,
): ExtractionResult {
  const normalized = text.replace(/\s+/g, " ").trim();
  const charCount = normalized.length;
  const readable = charCount >= MIN_READABLE_CHARS && !errorCode;

  return {
    text: normalized,
    charCount,
    method,
    readable,
    errorCode: readable
      ? undefined
      : (errorCode ?? (charCount < MIN_READABLE_CHARS ? inferEmptyError(method) : undefined)),
  };
}

function inferEmptyError(method: ExtractionResult["method"]): ExtractionErrorCode {
  switch (method) {
    case "pdf":
      return "pdf_empty";
    case "docx":
      return "docx_parse_failed";
    case "ocr":
      return "ocr_failed";
    default:
      return "unsupported_type";
  }
}

function methodForMime(mime: SupportedMime): ExtractionResult["method"] {
  if (mime === "application/pdf") {
    return "pdf";
  }
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }
  if (IMAGE_MIMES.includes(mime)) {
    return "ocr";
  }
  return "unsupported";
}

async function extractTextFromPdfDocument(pdf: PdfDocumentProxy): Promise<string> {
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

async function renderPdfPagesToCanvases(
  pdf: PdfDocumentProxy,
): Promise<HTMLCanvasElement[]> {
  if (typeof window === "undefined") {
    return [];
  }

  const canvases: HTMLCanvasElement[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: OCR_RENDER_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) {
      continue;
    }
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    canvases.push(canvas);
  }

  return canvases;
}

async function extractPdfTextWithOcrFallback(
  file: File,
  onProgress?: OcrProgressHandler,
): Promise<{ text: string; usedOcr: boolean; errorCode?: ExtractionErrorCode }> {
  let pdf: PdfDocumentProxy;

  try {
    const buffer = await file.arrayBuffer();
    pdf = await openPdfDocument(buffer);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[documentExtraction] PDF open failed", error);
    }
    return { text: "", usedOcr: false, errorCode: "pdf_parse_failed" };
  }

  const layerText = await extractTextFromPdfDocument(pdf);
  const normalized = layerText.replace(/\s+/g, " ").trim();
  if (normalized.length >= MIN_READABLE_CHARS) {
    return { text: layerText, usedOcr: false };
  }

  const canvases = await renderPdfPagesToCanvases(pdf);
  if (canvases.length === 0) {
    return { text: layerText, usedOcr: false };
  }

  try {
    const ocrPages = await extractTextFromCanvases(canvases, onProgress);
    return { text: ocrPages.join("\n\n"), usedOcr: true };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[documentExtraction] PDF OCR fallback failed", error);
    }
    return { text: layerText, usedOcr: true, errorCode: "ocr_failed" };
  }
}

export interface ExtractDocumentOptions {
  onOcrProgress?: OcrProgressHandler;
}

export async function extractDocumentText(
  file: File,
  options?: ExtractDocumentOptions,
): Promise<ExtractionResult> {
  const mime = validateFileType(file);

  if (!mime) {
    return buildResult("", "unsupported", "unsupported_type");
  }

  const fallbackMethod = methodForMime(mime);

  try {
    switch (mime) {
      case "application/pdf": {
        const { text, usedOcr, errorCode } = await extractPdfTextWithOcrFallback(
          file,
          options?.onOcrProgress,
        );
        return buildResult(text, usedOcr ? "ocr" : "pdf", errorCode);
      }
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        const text = await extractDocxText(file);
        return buildResult(text, "docx");
      }
      case "image/jpeg":
      case "image/png":
      case "image/tiff": {
        const text = await extractTextWithTesseract(
          file,
          options?.onOcrProgress,
        );
        return buildResult(text, "ocr");
      }
      default:
        return buildResult("", "unsupported", "unsupported_type");
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[documentExtraction] extraction failed", error);
    }
    return buildResult("", fallbackMethod, mapMethodToParseError(fallbackMethod));
  }
}

function mapMethodToParseError(
  method: ExtractionResult["method"],
): ExtractionErrorCode {
  switch (method) {
    case "pdf":
      return "pdf_parse_failed";
    case "docx":
      return "docx_parse_failed";
    case "ocr":
      return "ocr_failed";
    default:
      return "unsupported_type";
  }
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}
