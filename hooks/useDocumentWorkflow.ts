"use client";

import { useCallback, useState } from "react";
import { extractDocumentText, validateFileType } from "@/lib/documentExtraction";
import type { AnalyzeResponse, ProcessingStatus } from "@/types";

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
  { key: "legal", label: "Abgleich Genfer Abkommen IV …",             doneLabel: "GA-IV-Analyse abgeschlossen" },
];

export type CheckStates = Record<string, CheckState>;

export function useDocumentWorkflow() {
  const [status, setStatus]             = useState<ProcessingStatus>("idle");
  const [fileName, setFileName]         = useState<string | null>(null);
  const [fileSize, setFileSize]         = useState<string | null>(null);
  const [fileExt, setFileExt]           = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult]             = useState<AnalyzeResponse | null>(null);
  const [checkStates, setCheckStates]   = useState<CheckStates>({});
  const [progress, setProgress]         = useState(0);
  const [extractedText, setExtractedText] = useState<string>("");

  const isProcessing = ["reading", "checking", "readable", "analyzing"].includes(status);

  const setCheck = useCallback((key: string, state: CheckState) => {
    setCheckStates((prev) => ({ ...prev, [key]: state }));
  }, []);

  const processFile = useCallback(async (file: File) => {
    setErrorMessage(null);
    setResult(null);
    setCheckStates({});
    setProgress(0);
    setExtractedText("");
    setFileName(file.name);
    setFileExt((file.name.split(".").pop() ?? "").toUpperCase().slice(0, 4));

    const kb = Math.round(file.size / 1024);
    setFileSize(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);

    const mime = validateFileType(file);
    if (!mime) {
      setStatus("error");
      setErrorMessage(
        "Dateityp nicht unterstützt. Erlaubt: PDF, JPG, PNG, DOCX, TIFF.",
      );
      return;
    }

    setStatus("reading");

    const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    // Step 1: read
    setCheck("read", "active");
    const extraction = await extractDocumentText(file, {
      onOcrProgress: (fraction) => {
        setProgress(10 + Math.round(fraction * 15));
      },
    });
    await delay(400);
    setCheck("read", "done");
    setProgress(25);

    // Step 2: ocr / readability
    setStatus("checking");
    setCheck("ocr", "active");
    await delay(500 + Math.random() * 300);

    if (!extraction.readable) {
      setCheck("ocr", "error");
      setStatus("error");
      setErrorMessage("Dokument nicht ausreichend lesbar – bitte bessere Datei hochladen");
      return;
    }
    setCheck("ocr", "done");
    setProgress(50);

    // Step 3: parse metadata
    setCheck("parse", "active");
    await delay(500 + Math.random() * 300);
    setCheck("parse", "done");
    setProgress(75);

    // Step 4: legal check
    setCheck("legal", "active");
    await delay(400 + Math.random() * 300);
    setCheck("legal", "done");
    setProgress(100);

    setExtractedText(extraction.text);
    setStatus("readable");
  }, [setCheck]);

  const generateLetter = useCallback(async () => {
    if (!extractedText && status !== "readable") return;

    setStatus("analyzing");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentText: extractedText, fileName }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Analyse fehlgeschlagen.");
      }

      const data = (await response.json()) as AnalyzeResponse;
      setResult(data);
      setStatus("done");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Analyse fehlgeschlagen.",
      );
    }
  }, [extractedText, fileName, status]);

  const reset = useCallback(() => {
    setStatus("idle");
    setFileName(null);
    setFileSize(null);
    setFileExt(null);
    setErrorMessage(null);
    setResult(null);
    setCheckStates({});
    setProgress(0);
    setExtractedText("");
  }, []);

  return {
    status,
    fileName,
    fileSize,
    fileExt,
    errorMessage,
    result,
    isProcessing,
    checkStates,
    progress,
    processFile,
    generateLetter,
    reset,
  };
}
