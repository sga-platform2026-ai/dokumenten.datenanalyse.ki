import { isSafariBrowser } from "@/lib/browserSupport";

export const PDF_WORKER_PATH = "/pdf.worker.min.mjs";

export type PdfJsModule = typeof import("pdfjs-dist");
export type PdfJsLoadMode = "standard" | "legacy";

export type PdfDocumentProxy = Awaited<
  ReturnType<PdfJsModule["getDocument"]>["promise"]
>;

export interface PdfDocumentLoadParams {
  data: ArrayBuffer;
  useSystemFonts: true;
  isEvalSupported: false;
  useWorkerFetch: false;
}

const PDF_DOCUMENT_PARAMS: Omit<PdfDocumentLoadParams, "data"> = {
  useSystemFonts: true,
  isEvalSupported: false,
  useWorkerFetch: false,
};

let configuredMode: PdfJsLoadMode | null = null;
let safariWorker: Worker | null = null;
let pdfJsModule: PdfJsModule | null = null;

function logPdfError(mode: PdfJsLoadMode, error: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[pdfJsClient:${mode}]`, error);
  }
}

async function importPdfJs(mode: PdfJsLoadMode): Promise<PdfJsModule> {
  if (mode === "legacy") {
    return import("pdfjs-dist/legacy/build/pdf.mjs") as Promise<PdfJsModule>;
  }
  return import("pdfjs-dist");
}

function configureWorker(pdfjs: PdfJsModule): void {
  if (typeof window === "undefined") {
    return;
  }

  pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_PATH;

  if (isSafariBrowser()) {
    safariWorker ??= new Worker(PDF_WORKER_PATH, { type: "module" });
    pdfjs.GlobalWorkerOptions.workerPort = safariWorker;
  }
}

async function loadPdfJsModule(mode: PdfJsLoadMode): Promise<PdfJsModule> {
  if (pdfJsModule && configuredMode === mode) {
    return pdfJsModule;
  }

  const pdfjs = await importPdfJs(mode);
  configureWorker(pdfjs);
  pdfJsModule = pdfjs;
  configuredMode = mode;
  return pdfjs;
}

export function buildPdfDocumentParams(data: ArrayBuffer): PdfDocumentLoadParams {
  return {
    data,
    ...PDF_DOCUMENT_PARAMS,
  };
}

export async function openPdfDocument(
  data: ArrayBuffer,
): Promise<PdfDocumentProxy> {
  const modes: PdfJsLoadMode[] = isSafariBrowser()
    ? ["standard", "legacy"]
    : ["standard"];

  let lastError: unknown = new Error("PDF konnte nicht geöffnet werden.");

  for (const mode of modes) {
    try {
      const pdfjs = await loadPdfJsModule(mode);
      return await pdfjs
        .getDocument(buildPdfDocumentParams(data))
        .promise;
    } catch (error) {
      lastError = error;
      logPdfError(mode, error);
      pdfJsModule = null;
      configuredMode = null;
    }
  }

  throw lastError;
}
