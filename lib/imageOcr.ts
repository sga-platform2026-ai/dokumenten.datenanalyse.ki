/** OCR für Bilder und TIFF (Browser, deutsch). */

const OCR_LANGUAGE = "deu";

export type OcrProgressHandler = (progress: number) => void;

export async function extractTextWithTesseract(
  file: File,
  onProgress?: OcrProgressHandler,
): Promise<string> {
  const { createWorker } = await import("tesseract.js");

  const worker = await createWorker(OCR_LANGUAGE, 1, {
    logger: (message) => {
      if (
        message.status === "recognizing text" &&
        typeof message.progress === "number"
      ) {
        onProgress?.(message.progress);
      }
    },
  });

  try {
    const { data } = await worker.recognize(file);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
