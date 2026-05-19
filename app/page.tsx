"use client";

import { useEffect, useRef } from "react";
import { ActionBar } from "@/components/ActionBar";
import { AnalysisResult } from "@/components/AnalysisResult";
import { FileUpload } from "@/components/FileUpload";
import { Header } from "@/components/Header";
import { LetterPreview } from "@/components/LetterPreview";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { ProcessingPanel } from "@/components/ProcessingPanel";
import { useDocumentWorkflow, CHECK_ITEMS } from "@/hooks/useDocumentWorkflow";
import { getProcessingMessage } from "@/lib/processingMessages";

function getNow(): string {
  const d = new Date();
  return d.toLocaleDateString("de-DE", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZoneName: "short",
  });
}

export default function HomePage() {
  const {
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
  } = useDocumentWorkflow();

  const letterRef = useRef<HTMLDivElement>(null);
  const analyzingMsg = getProcessingMessage(status);

  useEffect(() => {
    if (status === "done" && letterRef.current) {
      letterRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [status]);

  const railStep = (key: string, label: string, n: number) => {
    let on: string | undefined;
    if (key === "upload" && ["reading","checking","readable","analyzing","done"].includes(status)) on = "done";
    else if (key === "upload" && status === "idle") on = "1";
    else if (key === "read" && ["checking","readable"].includes(status)) on = "done";
    else if (key === "read" && status === "reading") on = "1";
    else if (key === "extract" && status === "readable") on = "done";
    else if (key === "extract" && ["checking"].includes(status)) on = "1";
    else if (key === "letter" && status === "done") on = "done";
    else if (key === "letter" && status === "analyzing") on = "1";

    return (
      <div className="rail-step" key={key} data-on={on}>
        <span className="n">
          {on === "done" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          ) : n}
        </span>
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div>
      <Header status={status} />

      <main className="shell">
        <div className="eyebrow">
          Bundesinstanz Deutschland <span className="sep">·</span>
          Stand <span id="now">{getNow()}</span>
        </div>

        <h1 className="page-title">Dokument prüfen &amp; Antwort entwerfen.</h1>
        <p className="page-lede">
          Laden Sie einen Bescheid, eine Mahnung oder ein behördliches Schreiben hoch.
          Die Lesbarkeit wird geprüft, Absender und Aktenzeichen werden erkannt —
          anschließend erstellt die KI einen formellen Antwortbrief unter Bezugnahme
          auf die <b>IV. Genfer Konvention</b>.
        </p>

        <div className="rail">
          {railStep("upload",  "Dokument hochladen",  1)}
          {railStep("read",    "Lesbarkeit prüfen",   2)}
          {railStep("extract", "Daten erfassen",      3)}
          {railStep("letter",  "Antwort generieren",  4)}
        </div>

        <div className="grid">
          <FileUpload
            onFileSelected={processFile}
            onGenerate={generateLetter}
            onReset={reset}
            disabled={isProcessing}
            status={status}
            fileName={fileName}
            fileSize={fileSize}
            fileExt={fileExt}
            checkStates={checkStates}
            checkItems={CHECK_ITEMS}
            progress={progress}
            errorMessage={errorMessage}
          />

          {result ? (
            <AnalysisResult
              analysis={result.analysis}
              fileName={fileName}
              mock={result.metadata.mock}
            />
          ) : status === "analyzing" && analyzingMsg ? (
            <aside className="card" id="data-card">
              <div className="label">Erkannte Dokumentdaten</div>
              <h2 style={{ marginBottom: 14 }}>Übersicht</h2>
              <ProcessingPanel
                title={analyzingMsg.title}
                hint={analyzingMsg.hint}
                compact
              />
            </aside>
          ) : (
            <aside className="card" id="data-card">
              <div className="label">Erkannte Dokumentdaten</div>
              <h2 style={{ marginBottom: 14 }}>Übersicht</h2>
              <div className="data-empty-state">
                <div className="data-empty-icon">⌗</div>
                Noch kein Dokument analysiert.
                <div className="data-empty-sub">
                  Felder werden hier befüllt, sobald ein Schreiben hochgeladen wurde.
                </div>
              </div>
            </aside>
          )}
        </div>

        {result && (
          <div ref={letterRef}>
            <LetterPreview
              letter={result.letter}
              mock={result.metadata.mock}
              actions={
                <ActionBar letterText={result.letter} onReset={reset} />
              }
            />
          </div>
        )}
      </main>

      {status === "analyzing" && analyzingMsg && (
        <ProcessingOverlay
          title={analyzingMsg.title}
          hint={analyzingMsg.hint}
        />
      )}

      <footer className="footer-note">
        <span>
          Hinweis: Diese Anwendung erstellt automatisierte Textentwürfe anhand
          bereitgestellter Dokumentdaten. Die Ausgabe ersetzt keine individuelle Prüfung.
        </span>
        <span>Dokumentenprüfung GA IV · Version 1.0</span>
      </footer>
    </div>
  );
}
