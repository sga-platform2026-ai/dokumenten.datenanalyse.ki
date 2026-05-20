"use client";

import { useEffect, useRef, useState } from "react";
import { AnalysisResult } from "@/components/AnalysisResult";
import { DiagnosticsPanel } from "@/components/DiagnosticsPanel";
import { FileUpload } from "@/components/FileUpload";
import { AppHeader } from "@/components/AppHeader";
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
  } = useDocumentWorkflow();

  const resultRef = useRef<HTMLDivElement>(null);
  const analyzingMsg = getProcessingMessage(status);
  const [debugEnabled, setDebugEnabled] = useState(false);

  useEffect(() => {
    if (status === "done" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [status]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setDebugEnabled(params.get("debug") === "1");
  }, []);

  const railStep = (key: string, label: string, n: number) => {
    let on: string | undefined;
    if (key === "upload" && ["selected","reading","checking","analyzing","done"].includes(status)) on = "done";
    else if (key === "upload" && status === "idle") on = queuedFiles.length > 0 ? "done" : "1";
    else if (key === "read" && ["checking","analyzing","done"].includes(status)) on = "done";
    else if (key === "read" && status === "reading") on = "1";
    else if (key === "extract" && ["analyzing","done"].includes(status)) on = "done";
    else if (key === "extract" && status === "checking") on = "1";
    else if (key === "analyze" && status === "done") on = "done";
    else if (key === "analyze" && status === "analyzing") on = "1";

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
      <AppHeader status={status} />

      <main className="shell">
        <div className="eyebrow">
          Bundesinstanz Deutschland <span className="sep">·</span>
          Stand <span id="now">{getNow()}</span>
        </div>

        <h1 className="page-title">Dokument prüfen nach GA IV.</h1>
        <p className="page-lede">
          Laden Sie ein oder mehrere Schreiben hoch (PDF, DOCX, Bilder).
          Mit „Dokument prüfen“ starten Sie Lesbarkeitsprüfung und GA-IV-Analyse
          automatisch anhand des <b>IV. Genfer Abkommens</b>.
        </p>

        <div className="rail">
          {railStep("upload",  "Dokument hochladen",  1)}
          {railStep("read",    "Lesbarkeit prüfen",   2)}
          {railStep("extract", "Daten erfassen",      3)}
          {railStep("analyze", "Schreiben analysieren", 4)}
        </div>

        <div className="grid">
          <FileUpload
            queuedFiles={queuedFiles}
            onFilesAdded={addFiles}
            onRemoveFile={removeFile}
            onStartCheck={() => void startDocumentCheck()}
            onReset={reset}
            disabled={isProcessing}
            status={status}
            checkStates={checkStates}
            checkItems={CHECK_ITEMS}
            progress={progress}
            errorMessage={errorMessage}
          />

          <div ref={resultRef}>
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
        </div>

        {debugEnabled && result?.metadata.diagnostics && (
          <DiagnosticsPanel
            diagnostics={result.metadata.diagnostics}
            cached={result.metadata.cached}
          />
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
