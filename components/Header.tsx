"use client";

import { Spinner } from "@/components/Spinner";
import type { ProcessingStatus } from "@/types";

interface HeaderProps {
  status: ProcessingStatus;
  showLogout?: boolean;
}

const STATUS_PILL: Record<
  ProcessingStatus,
  { label: string; state: string }
> = {
  idle:      { label: "Bereit",                      state: "" },
  selected:  { label: "Dateien ausgewählt",          state: "" },
  reading:   { label: "Dokument wird gelesen …",     state: "working" },
  checking:  { label: "Lesbarkeit wird geprüft …",   state: "working" },
  readable:  { label: "Dokument lesbar",              state: "done" },
  analyzing: { label: "KI formuliert Antwort …",     state: "working" },
  done:      { label: "Antwortbrief bereit",          state: "done" },
  error:     { label: "Fehler",                       state: "error" },
};

export function Header({ status, showLogout = false }: HeaderProps) {
  const pill = STATUS_PILL[status];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="GA IV Logo" style={{ width: 34, height: 34, objectFit: "contain", filter: "drop-shadow(0 1px 0 rgba(0,0,0,.4))" }} />
        </div>
        <div className="brand-text">
          <span className="name">Dokumentenprüfung GA IV</span>
          <span className="sub">Genfer Abkommen · Zivilistenschutz</span>
        </div>
      </div>

      <div className="crumbs">
        <span>Arbeitsbereich</span>
        <span style={{ opacity: 0.4 }}>/</span>
        <b>Neue Prüfung</b>
      </div>

      <div className="topbar-spacer" />

      <div className="top-actions">
        <span className="status-pill" data-state={pill.state}>
          {pill.state === "working" ? (
            <Spinner size="sm" tone="light" label={pill.label} />
          ) : (
            <span className="dot" />
          )}
          <span>{pill.label}</span>
        </span>
        {showLogout && (
          <button
            type="button"
            className="top-btn top-logout"
            title="Abmelden"
            onClick={() => void handleLogout()}
          >
            Abmelden
          </button>
        )}
        <button className="top-btn top-lang" title="Sprache">DE</button>
        <button className="top-btn" title="Hilfe">?</button>
      </div>
    </header>
  );
}
