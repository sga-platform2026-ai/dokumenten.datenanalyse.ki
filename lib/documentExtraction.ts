import {
  extractTextFromCanvases,
  extractTextWithTesseract,
  type OcrProgressHandler,
} from "@/lib/imageOcr";
import type { ExtractionResult, SupportedMime } from "@/types";

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

async function loadPdfJs(): Promise<typeof import("pdfjs-dist")> {
  const pdfjs = await import("pdfjs-dist");

  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }

  return pdfjs;
}

async function extractPdfTextLayer(file: File): Promise<string> {
  const pdfjs = await loadPdfJs();
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

async function renderPdfPagesToCanvases(
  file: File,
): Promise<HTMLCanvasElement[]> {
  if (typeof window === "undefined") {
    return [];
  }

  const pdfjs = await loadPdfJs();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
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
): Promise<{ text: string; usedOcr: boolean }> {
  const layerText = await extractPdfTextLayer(file);
  const normalized = layerText.replace(/\s+/g, " ").trim();
  if (normalized.length >= MIN_READABLE_CHARS) {
    return { text: layerText, usedOcr: false };
  }

  const canvases = await renderPdfPagesToCanvases(file);
  if (canvases.length === 0) {
    return { text: layerText, usedOcr: false };
  }

  const ocrPages = await extractTextFromCanvases(canvases, onProgress);
  return { text: ocrPages.join("\n\n"), usedOcr: true };
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
    return buildResult("", "unsupported");
  }

  const fallbackMethod = methodForMime(mime);

  try {
    switch (mime) {
      case "application/pdf": {
        const { text, usedOcr } = await extractPdfTextWithOcrFallback(
          file,
          options?.onOcrProgress,
        );
        return buildResult(text, usedOcr ? "ocr" : "pdf");
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
        return buildResult("", "unsupported");
    }
  } catch {
    return buildResult("", fallbackMethod);
  }
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}
