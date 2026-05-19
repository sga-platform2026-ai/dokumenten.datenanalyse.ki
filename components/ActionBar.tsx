"use client";

import { useState } from "react";

interface ActionBarProps {
  analysisText: string;
  letterText: string;
  onReset: () => void;
}

export function ActionBar({ analysisText, letterText, onReset }: ActionBarProps) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(label);
    } catch {
      showToast("Kopieren fehlgeschlagen.");
    }
  };

  const handlePrint = () => {
    showToast("Druckdialog wird vorbereitet …");
    setTimeout(() => window.print(), 300);
  };

  return (
    <>
      <div className="letter-actions" style={{ marginBottom: 0 }}>
        <button
          className="btn btn-ghost"
          onClick={() => copyText(analysisText, "Analyse in Zwischenablage kopiert")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
          Text kopieren
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => copyText(letterText, "Brief in Zwischenablage kopiert")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
          Brief kopieren
        </button>
        <button className="btn btn-ghost" onClick={handlePrint}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2h9l5 5v15H6V2z" />
            <path d="M14 2v6h6" />
          </svg>
          Als PDF vorbereiten
        </button>
        <button className="btn btn-primary" onClick={onReset}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Neu hochladen
        </button>
      </div>

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </>
  );
}
