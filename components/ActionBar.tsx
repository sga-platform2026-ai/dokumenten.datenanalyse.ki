"use client";

import { useState } from "react";
import { downloadLetterPdf } from "@/lib/exportLetterPdf";
import { normalizeLetterText } from "@/lib/normalizeLetter";

interface ActionBarProps {
  letterText: string;
  onReset: () => void;
}

export function ActionBar({ letterText, onReset }: ActionBarProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const copyLetter = async () => {
    const text = normalizeLetterText(letterText);
    if (!text) {
      showToast("Kein Brieftext vorhanden.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast("Brief in Zwischenablage kopiert");
    } catch {
      showToast("Kopieren fehlgeschlagen.");
    }
  };

  const savePdf = () => {
    if (pdfBusy) return;
    setPdfBusy(true);
    try {
      downloadLetterPdf(letterText);
      showToast("PDF wurde heruntergeladen");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "PDF-Export fehlgeschlagen.";
      showToast(message);
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <>
      <div className="letter-actions" style={{ marginBottom: 0 }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => void copyLetter()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
          Text kopieren
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={savePdf}
          disabled={pdfBusy}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2h9l5 5v15H6V2z" />
            <path d="M14 2v6h6" />
          </svg>
          Als PDF speichern
        </button>
        <button type="button" className="btn btn-primary" onClick={onReset}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          + Neu hochladen
        </button>
      </div>

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </>
  );
}
