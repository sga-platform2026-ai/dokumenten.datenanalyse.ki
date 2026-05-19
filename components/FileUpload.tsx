"use client";

import { useCallback, useRef, useState } from "react";
import type { CheckStates, CheckItem } from "@/hooks/useDocumentWorkflow";
import type { ProcessingStatus } from "@/types";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  onGenerate: () => void;
  onReset: () => void;
  disabled: boolean;
  status: ProcessingStatus;
  fileName: string | null;
  fileSize: string | null;
  fileExt: string | null;
  checkStates: CheckStates;
  checkItems: CheckItem[];
  progress: number;
  errorMessage: string | null;
}

export function FileUpload({
  onFileSelected,
  onGenerate,
  onReset,
  disabled,
  status,
  fileName,
  fileSize,
  fileExt,
  checkStates,
  checkItems,
  progress,
  errorMessage,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file || disabled) return;
      onFileSelected(file);
    },
    [disabled, onFileSelected],
  );

  const showDrop     = status === "idle" || status === "error";
  const showFileRow  = fileName && status !== "idle";
  const showChecklist = ["reading","checking","readable","analyzing","done"].includes(status);
  const showGenBtn   = status === "readable";
  const showResetBtn = status !== "idle";
  const isGenerating = status === "analyzing";

  return (
    <section className="card accent" id="upload-card">
      <div className="row-between" style={{ marginBottom: 14 }}>
        <div>
          <div className="label">Schritt 1 · Eingang</div>
          <h2>{showChecklist ? "Lesbarkeitsprüfung" : "Dokument hochladen"}</h2>
        </div>
        {showResetBtn && (
          <button className="btn-link" onClick={onReset}>
            ↺ Neu beginnen
          </button>
        )}
      </div>

      {showDrop && (
        <label
          className={`drop${isDragOver ? " dragover" : ""}${disabled ? " disabled" : ""}`}
          tabIndex={0}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
        >
          <div className="plus">+</div>
          <div className="h">Datei hierher ziehen</div>
          <div className="s">oder klicken, um eine Datei auszuwählen</div>
          <div className="formats">
            {["PDF","JPG","PNG","DOCX","TIFF"].map((f) => (
              <span className="ftag" key={f}>{f}</span>
            ))}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.docx,.tiff"
            style={{ display: "none" }}
            disabled={disabled}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      )}

      {showFileRow && (
        <div className="file-row">
          <div className="file-icon">
            <span>{fileExt ?? "?"}</span>
          </div>
          <div className="file-meta">
            <div className="nm">{fileName}</div>
            <div className="sz">{fileSize ?? ""}</div>
          </div>
          {status !== "analyzing" && status !== "done" && (
            <button className="file-remove" aria-label="Entfernen" onClick={onReset}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {errorMessage && (
        <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(176,72,72,.08)", border: "1px solid rgba(176,72,72,.35)", borderRadius: 8, color: "var(--danger)", fontSize: 13.5 }}>
          {errorMessage}
        </div>
      )}

      {showChecklist && (
        <div style={{ marginTop: 18 }}>
          <div className="label" style={{ marginBottom: 10 }}>Lesbarkeitsprüfung</div>
          <div className="check-list">
            {checkItems.map((item) => {
              const s = checkStates[item.key] ?? "idle";
              const lbl = s === "done" ? item.doneLabel : item.label;
              return (
                <div className="check" key={item.key} data-s={s}>
                  <span className="ic">
                    {s === "active" && <span className="spin" />}
                    {s === "done" && (
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                    {s === "error" && <span style={{ color: "var(--danger)", fontSize: 14 }}>✕</span>}
                  </span>
                  <span className="lbl">{lbl}</span>
                </div>
              );
            })}
          </div>
          <div className="progress-bar">
            <div style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="mt-20 row-between" id="upload-actions">
        <div style={{ color: "var(--muted)", fontSize: 12.5 }}>
          Max. 25 MB · Dateien werden lokal verarbeitet
        </div>
        {showGenBtn && (
          <button
            className="btn btn-primary"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spin" style={{ borderColor: "#f3e9d4", borderTopColor: "transparent" }} />
                Brief wird formuliert …
              </>
            ) : (
              <>
                <span>Antwortbrief generieren</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
