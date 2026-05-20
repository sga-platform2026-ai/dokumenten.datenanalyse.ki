"use client";

import { useCallback, useState } from "react";
import { combineDocumentTexts, formatFileNamesLabel } from "@/lib/combineDocumentText";
import { extractDocumentText, validateFileType } from "@/lib/documentExtraction";
import { formatExtractionErrorMessage } from "@/lib/extractionErrors";
import {
  fileExtensionLabel,
  formatFileSizeLabel,
  MAX_FILE_BYTES,
} from "@/lib/fileMeta";
import type { AnalyzeResponse, ProcessingStatus, QueuedFile } from "@/types";

export type CheckState = "idle" | "active" | "done" | "error";

export interface CheckItem {
  key: string;
  label: string;
  doneLabel: string;
}

export const CHECK_ITEMS: CheckItem[] = [
  { key: "read",  label: "Dokument wird gelesen …",                  doneLabel: "Dokument gelesen" },
  { key: "ocr",   label: "Lesbarkeit & Bildqualität wird geprüft …", doneLabel: "Lesbarkeit: gut" },
  { key: "parse", label: "Absender, Aktenzeichen, Datum extrahieren", doneLabel: "Absender & Aktenzeichen erkannt" },
  { key: "legal", label: "Schreiben wird analysiert …",              doneLabel: "GA-IV-Analyse abgeschlossen" },
];

export type CheckStates = Record<string, CheckState>;

function createQueuedFile(file: File): QueuedFile {
  return {
    id: crypto.randomUUID(),
    file,
    name: file.name,
    sizeLabel: formatFileSizeLabel(file.size),
    ext: fileExtensionLabel(file.name),
  };
}

export function useDocumentWorkflow() {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [checkStates, setCheckStates] = useState<CheckStates>({});
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<string>("");

  const isProcessing = ["reading", "checking", "analyzing"].includes(status);

  const setCheck = useCallback((key: string, state: CheckState) => {
    setCheckStates((prev) => ({ ...prev, [key]: state }));
  }, []);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    if (list.length === 0) {
      return;
    }

    setErrorMessage(null);
    setResult(null);

    const accepted: QueuedFile[] = [];
    const errors: string[] = [];

    for (const file of list) {
      if (file.size > MAX_FILE_BYTES) {
        errors.push(`${file.name}: größer als 25 MB`);
        continue;
      }

      const mime = validateFileType(file);
      if (!mime) {
        errors.push(`${file.name}: Dateityp nicht unterstützt`);
        continue;
      }

      const duplicate = queuedFiles.some(
        (q) => q.name === file.name && q.file.size === file.size,
      );
      if (duplicate) {
        errors.push(`${file.name}: bereits in der Liste`);
        continue;
      }

      accepted.push(createQueuedFile(file));
    }

    if (accepted.length > 0) {
      setQueuedFiles((prev) => {
        const next = [...prev, ...accepted];
        setFileName(formatFileNamesLabel(next.map((f) => f.name)));
        return next;
      });
      setStatus((prev) =>
        prev === "reading" || prev === "checking" || prev === "analyzing"
          ? prev
          : "selected",
      );
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join(" · "));
      if (accepted.length === 0 && queuedFiles.length === 0) {
        setStatus("error");
      }
    } else if (accepted.length > 0) {
      setStatus("selected");
    }
  }, [queuedFiles]);

  const removeFile = useCallback((id: string) => {
    setQueuedFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      setFileName(
        next.length > 0 ? formatFileNamesLabel(next.map((f) => f.name)) : null,
      );
      if (next.length === 0) {
        setStatus("idle");
        setErrorMessage(null);
      }
      return next;
    });
  }, []);

  const startDocumentCheck = useCallback(async () => {
    if (queuedFiles.length === 0) {
      return;
    }

    setErrorMessage(null);
    setResult(null);
    setCheckStates({});
    setProgress(0);
    setExtractedText("");
    setStatus("reading");

    const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const total = queuedFiles.length;

    setCheck("read", "active");
    const extractedParts: { fileName: string; text: string }[] = [];

    for (let index = 0; index < total; index += 1) {
      const { file, name } = queuedFiles[index];
      const baseProgress = 10 + Math.round((index / total) * 15);
      const span = Math.max(1, Math.round(15 / total));

      const extraction = await extractDocumentText(file, {
        onOcrProgress: (fraction) => {
          setProgress(baseProgress + Math.round(fraction * span));
        },
      });

      if (!extraction.readable) {
        setCheck("read", "error");
        setStatus("error");
        setErrorMessage(formatExtractionErrorMessage(name, extraction));
        return;
      }

      extractedParts.push({ fileName: name, text: extraction.text });
      setProgress(10 + Math.round(((index + 1) / total) * 15));
    }

    await delay(400);
    setCheck("read", "done");
    setProgress(25);

    setStatus("checking");
    setCheck("ocr", "active");
    await delay(500 + Math.random() * 300);
    setCheck("ocr", "done");
    setProgress(50);

    setCheck("parse", "active");
    await delay(500 + Math.random() * 300);
    setCheck("parse", "done");
    setProgress(85);

    const combinedText = combineDocumentTexts(extractedParts);
    setExtractedText(combinedText);

    setCheck("legal", "active");
    setStatus("analyzing");
    setProgress(86);

    const progressTimer = window.setInterval(() => {
      setProgress((current) => (current >= 94 ? current : current + 1));
    }, 10_000);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText: combinedText,
          fileName: formatFileNamesLabel(queuedFiles.map((f) => f.name)),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Analyse fehlgeschlagen.");
      }

      const data = (await response.json()) as AnalyzeResponse;
      setCheck("legal", "done");
      setProgress(100);
      setResult(data);
      setStatus("done");
    } catch (error) {
      setCheck("legal", "error");
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Analyse fehlgeschlagen.",
      );
    } finally {
      window.clearInterval(progressTimer);
    }
  }, [queuedFiles, setCheck]);

  const reset = useCallback(() => {
    setStatus("idle");
    setQueuedFiles([]);
    setFileName(null);
    setErrorMessage(null);
    setResult(null);
    setCheckStates({});
    setProgress(0);
    setExtractedText("");
  }, []);

  return {
    status,
    queuedFiles,
    fileName,
    errorMessage,
    result,
    isProcessing,
    checkStates,
    progress,
    addFiles,
    removeFile,
    startDocumentCheck,
    reset,
  };
}
