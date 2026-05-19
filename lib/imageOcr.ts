/** OCR für Bilder, TIFF und gescannte PDFs (Browser, deutsch). */

const OCR_LANGUAGE = "deu";

export type OcrProgressHandler = (progress: number) => void;

interface RecognizeInput {
  image: File | HTMLCanvasElement;
}

async function withOcrWorker<T>(
  inputs: RecognizeInput[],
  onProgress: OcrProgressHandler | undefined,
  perInputProgressShare: number,
  handler: (text: string, index: number) => T,
): Promise<T[]> {
  const { createWorker } = await import("tesseract.js");

  let completed = 0;
  const worker = await createWorker(OCR_LANGUAGE, 1, {
    logger: (message) => {
      if (
        message.status === "recognizing text" &&
        typeof message.progress === "number"
      ) {
        const fraction =
          (completed + message.progress) * perInputProgressShare;
        onProgress?.(Math.min(1, fraction));
      }
    },
  });

  const results: T[] = [];
  try {
    for (let index = 0; index < inputs.length; index += 1) {
      const { data } = await worker.recognize(inputs[index].image);
      results.push(handler(data.text, index));
      completed += 1;
      onProgress?.(Math.min(1, completed * perInputProgressShare));
    }
  } finally {
    await worker.terminate();
  }

  return results;
}

export async function extractTextWithTesseract(
  file: File,
  onProgress?: OcrProgressHandler,
): Promise<string> {
  const texts = await withOcrWorker(
    [{ image: file }],
    onProgress,
    1,
    (text) => text,
  );
  return texts[0] ?? "";
}

export async function extractTextFromCanvases(
  canvases: HTMLCanvasElement[],
  onProgress?: OcrProgressHandler,
): Promise<string[]> {
  if (canvases.length === 0) {
    return [];
  }

  const share = 1 / canvases.length;
  return withOcrWorker(
    canvases.map((canvas) => ({ image: canvas })),
    onProgress,
    share,
    (text) => text,
  );
}
