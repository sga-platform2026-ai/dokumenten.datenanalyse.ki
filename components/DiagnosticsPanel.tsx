"use client";

import type { ReactElement } from "react";
import type { AnalyzeDiagnostics } from "@/types";

interface DiagnosticsPanelProps {
  diagnostics: AnalyzeDiagnostics;
  cached?: boolean;
}

function badge(label: string, ok: boolean): ReactElement {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px",
        borderRadius: 999,
        background: ok ? "rgba(126,181,106,.15)" : "rgba(176,72,72,.12)",
        color: ok ? "#5d8a4e" : "#a04646",
        border: `1px solid ${ok ? "rgba(126,181,106,.4)" : "rgba(176,72,72,.4)"}`,
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}

export function DiagnosticsPanel({ diagnostics, cached }: DiagnosticsPanelProps) {
  return (
    <section
      className="card"
      style={{ marginTop: 24, borderColor: "rgba(180,138,58,.4)" }}
    >
      <div className="label">Debug · Analyse-Diagnose</div>
      <h2 style={{ marginBottom: 14 }}>Pipeline-Status</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {badge("JSON-Start", diagnostics.hasJsonStart)}
        {badge("JSON-Ende", diagnostics.hasJsonEnd)}
        {badge("JSON gültig", diagnostics.jsonValid)}
        {diagnostics.jsonRecovered ? badge("JSON rekonstruiert", true) : null}
        {badge(
          diagnostics.retried ? "Retry ausgeführt" : "kein Retry",
          !diagnostics.retried,
        )}
        {cached ? badge("aus Cache", true) : badge("frische Antwort", true)}
      </div>

      <dl
        className="kv"
        style={{ fontSize: 13 }}
      >
        <dt>Dokumentlänge</dt>
        <dd>{diagnostics.documentLength.toLocaleString("de-DE")} Zeichen</dd>

        <dt>Rohantwort Länge</dt>
        <dd>{diagnostics.rawAnalysisLength.toLocaleString("de-DE")} Zeichen</dd>

        <dt>Artikel im JSON</dt>
        <dd>{diagnostics.structuredCount}</dd>

        <dt>Artikel in Prosa</dt>
        <dd>{diagnostics.proseCount}</dd>

        <dt>Artikel nach Union</dt>
        <dd>
          <b>{diagnostics.mergedCount}</b>
        </dd>

        {diagnostics.retryReason && (
          <>
            <dt>Retry-Grund</dt>
            <dd>{diagnostics.retryReason}</dd>
          </>
        )}
      </dl>

      {diagnostics.rawAnalysisPreview && (
        <div style={{ marginTop: 14 }}>
          <div className="label" style={{ marginBottom: 6 }}>
            Rohantwort (erste {diagnostics.rawAnalysisPreview.length} Zeichen)
          </div>
          <pre
            style={{
              background: "var(--paper-2)",
              border: "1px solid var(--line)",
              borderRadius: 6,
              padding: 12,
              fontSize: 12,
              lineHeight: 1.5,
              maxHeight: 240,
              overflow: "auto",
              whiteSpace: "pre-wrap",
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
            }}
          >
            {diagnostics.rawAnalysisPreview}
          </pre>
        </div>
      )}

      <p
        style={{
          marginTop: 12,
          fontSize: 12,
          color: "var(--muted)",
        }}
      >
        Aktiv weil <code>?debug=1</code> in der URL. Server-Logs zeigen
        weitere Details (Vercel-Logs).
      </p>
    </section>
  );
}
