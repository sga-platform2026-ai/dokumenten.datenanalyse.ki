"use client";

import { useCallback, useRef, useState } from "react";
import { ProcessingPanel } from "@/components/ProcessingPanel";
import { Spinner } from "@/components/Spinner";
import type { CheckStates, CheckItem } from "@/hooks/useDocumentWorkflow";
import { getProcessingMessage } from "@/lib/processingMessages";
import type { ProcessingStatus, QueuedFile } from "@/types";

interface FileUploadProps {
  queuedFiles: QueuedFile[];
  onFilesAdded: (files: FileList | File[]) => void;
  onRemoveFile: (id: string) => void;
  onStartCheck: () => void;
  onReset: () => void;
  disabled: boolean;
  status: ProcessingStatus;
  checkStates: CheckStates;
  checkItems: CheckItem[];
  progress: number;
  errorMessage: string | null;
}

export function FileUpload({
  queuedFiles,
  onFilesAdded,
  onRemoveFile,
  onStartCheck,
  onReset,
  disabled,
  status,
  checkStates,
  checkItems,
  progress,
  errorMessage,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = "upload-file-input";
  const [isDragOver, setIsDragOver] = useState(false);

  const canPickFiles =
    status === "idle" || status === "selected" || status === "error";
  const hasFiles = queuedFiles.length > 0;
  const showMainDrop = canPickFiles && !hasFiles;
  const showAddMore = canPickFiles && hasFiles;
  const showChecklist = ["reading", "checking", "analyzing", "done"].includes(
    status,
  );
  const showCheckBtn = status === "selected" && hasFiles;
  const showResetBtn = hasFiles || status !== "idle";
  const uploadBusy = status === "reading" || status === "checking";
  const processingMsg = getProcessingMessage(status);
  const pickDisabled = disabled || !canPickFiles;

  const ingestFiles = useCallback(
    (files: FileList | File[] | undefined) => {
      if (!files || pickDisabled) {
        return;
      }
      onFilesAdded(files);
    },
    [onFilesAdded, pickDisabled],
  );

  const fileInput = (
    <input
      id={inputId}
      ref={inputRef}
      type="file"
      multiple
      accept=".pdf,.jpg,.jpeg,.png,.docx,.tif,.tiff"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
      disabled={pickDisabled}
      onChange={(e) => {
        ingestFiles(e.target.files ?? undefined);
        e.target.value = "";
      }}
    />
  );

  return (
    <section className="card accent" id="upload-card">
      <div className="row-between" style={{ marginBottom: 14 }}>
        <div>
          <div className="label">Schritt 1 · Eingang</div>
          <h2>
            {showChecklist
              ? "Lesbarkeitsprüfung"
              : hasFiles
                ? "Dokumente ausgewählt"
                : "Dokumente hochladen"}
          </h2>
        </div>
        {showResetBtn && (
          <button type="button" className="btn-link" onClick={onReset}>
            ↺ Neu beginnen
          </button>
        )}
      </div>

      {showMainDrop && (
        <label
          htmlFor={pickDisabled ? undefined : inputId}
          className={`drop${isDragOver ? " dragover" : ""}${pickDisabled ? " disabled" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            ingestFiles(e.dataTransfer.files);
          }}
        >
          <div className="plus">+</div>
          <div className="h">Dateien hierher ziehen</div>
          <div className="s">oder klicken – Mehrfachauswahl möglich</div>
          <div className="formats">
            {["PDF", "JPG", "PNG", "DOCX", "TIFF"].map((f) => (
              <span className="ftag" key={f}>
                {f}
              </span>
            ))}
          </div>
          {fileInput}
        </label>
      )}

      {hasFiles && (
        <div className="file-list">
          {queuedFiles.map((item) => (
            <div className="file-row" key={item.id}>
              <div className={`file-icon${uploadBusy ? " file-icon-busy" : ""}`}>
                {uploadBusy ? (
                  <Spinner size="sm" label="Datei wird verarbeitet" />
                ) : (
                  <span>{item.ext}</span>
                )}
              </div>
              <div className="file-meta">
                <div className="nm">{item.name}</div>
                <div className="sz">{item.sizeLabel}</div>
              </div>
              {canPickFiles && (
                <button
                  type="button"
                  className="file-remove"
                  aria-label={`${item.name} entfernen`}
                  onClick={() => onRemoveFile(item.id)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 6l12 12M18 6l-12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddMore && (
        <div className="add-more-row">
          <label
            htmlFor={pickDisabled ? undefined : inputId}
            className={`drop drop-compact${isDragOver ? " dragover" : ""}${pickDisabled ? " disabled" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              ingestFiles(e.dataTransfer.files);
            }}
          >
            <span className="drop-compact-plus">+</span>
            <span>Weitere Datei hinzufügen</span>
            {fileInput}
          </label>
          <p className="add-more-hint">
            {queuedFiles.length}{" "}
            {queuedFiles.length === 1 ? "Datei" : "Dateien"} in der Prüfung
          </p>
        </div>
      )}

      {uploadBusy && processingMsg && (
        <ProcessingPanel
          title={processingMsg.title}
          hint={processingMsg.hint}
        />
      )}

      {errorMessage && (
        <div className="upload-error">{errorMessage}</div>
      )}

      {showChecklist && (
        <div style={{ marginTop: 18 }}>
          <div className="label" style={{ marginBottom: 10 }}>
            Lesbarkeitsprüfung
          </div>
          <div className="check-list">
            {checkItems.map((item) => {
              const s = checkStates[item.key] ?? "idle";
              const lbl = s === "done" ? item.doneLabel : item.label;
              return (
                <div className="check" key={item.key} data-s={s}>
                  <span className="ic">
                    {s === "active" && <Spinner size="sm" />}
                    {s === "done" && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                      >
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                    {s === "error" && (
                      <span style={{ color: "var(--danger)", fontSize: 14 }}>
                        ✕
                      </span>
                    )}
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
          Max. 25 MB pro Datei · lokal verarbeitet
        </div>
        <div className="upload-action-buttons">
          {showCheckBtn && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onStartCheck}
              disabled={disabled}
            >
              <span>Dokument prüfen</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
