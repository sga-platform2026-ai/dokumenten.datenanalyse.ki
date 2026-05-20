"use client";

import { useState } from "react";
import { parseAnalysisSections } from "@/lib/parseAiResponse";

interface AnalysisResultProps {
  analysis: string;
  fileName?: string | null;
  mock?: boolean;
}

export function AnalysisResult({ analysis, fileName, mock }: AnalysisResultProps) {
  const parsed = parseAnalysisSections(analysis);
  const articleCount = parsed.articles.length;
  const affectedCount = parsed.affected.length;
  const [affectedOpen, setAffectedOpen] = useState(false);

  return (
    <aside className="card" id="data-card">
      <div className="label">Erkannte Dokumentdaten</div>
      <h2 style={{ marginBottom: 14 }}>Übersicht</h2>

      <dl className="kv">
        <dt>Status</dt>
        <dd>
          <span className="badge">Lesbar · analysiert</span>
        </dd>

        {fileName && (
          <>
            <dt>Datei</dt>
            <dd style={{ fontWeight: 400, fontSize: 13, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {fileName}
            </dd>
          </>
        )}

        {parsed.authority && (
          <>
            <dt>Absender</dt>
            <dd style={{ fontWeight: 600 }}>{parsed.authority.split("\n")[0]}</dd>
            {parsed.authority.includes("\n") && (
              <>
                <dt>Anschrift</dt>
                <dd style={{ fontWeight: 400, color: "var(--ink-2)", fontSize: 13, lineHeight: 1.4 }}>
                  {parsed.authority
                    .split("\n")
                    .slice(1)
                    .join(", ")}
                </dd>
              </>
            )}
          </>
        )}

        {parsed.clerk && (
          <>
            <dt>Sachbearbeiter</dt>
            <dd style={{ fontWeight: 400, fontSize: 13, color: "var(--ink-2)" }}>{parsed.clerk}</dd>
          </>
        )}

        {parsed.leader && (
          <>
            <dt>Behördenleitung</dt>
            <dd style={{ fontWeight: 400, fontSize: 13, color: "var(--ink-2)" }}>{parsed.leader}</dd>
          </>
        )}

        <dt>GA IV</dt>
        <dd>
          {articleCount > 0 ? (
            <span className="badge warn">
              {articleCount} {articleCount === 1 ? "Artikel verletzt" : "Artikel verletzt"}
            </span>
          ) : (
            <span className="badge">Analyse abgeschlossen</span>
          )}
          {affectedCount > 0 && (
            <span className="badge" style={{ marginLeft: 6 }}>
              +{affectedCount} thematisch berührt
            </span>
          )}
        </dd>

        {mock && (
          <>
            <dt>Modus</dt>
            <dd>
              <span className="badge warn">Demo-Modus</span>
            </dd>
          </>
        )}
      </dl>

      {articleCount > 0 && (
        <div style={{ marginTop: 18 }}>
          <div className="label" style={{ marginBottom: 10 }}>Verletzte Artikel</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {parsed.articles.map((item) => (
              <div
                key={`v-${item.article}`}
                style={{
                  background: "rgba(180,138,58,.07)",
                  border: "1px solid rgba(180,138,58,.25)",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 13,
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 12.5, letterSpacing: ".03em" }}>
                  {item.article}
                </div>
                {item.reason && (
                  <div style={{ color: "var(--ink-2)", marginTop: 2 }}>{item.reason}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {affectedCount > 0 && (
        <div style={{ marginTop: 18 }}>
          <button
            type="button"
            onClick={() => setAffectedOpen((open) => !open)}
            style={{
              all: "unset",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "8px 0",
              borderTop: "1px dashed var(--line)",
            }}
            aria-expanded={affectedOpen}
          >
            <span className="label">
              Weitere thematisch berührte Artikel ({affectedCount})
            </span>
            <span
              style={{
                fontSize: 14,
                color: "var(--muted)",
                transition: "transform .15s ease",
                transform: affectedOpen ? "rotate(90deg)" : "none",
              }}
              aria-hidden
            >
              ›
            </span>
          </button>
          {affectedOpen && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginTop: 8,
              }}
            >
              {parsed.affected.map((item) => (
                <div
                  key={`a-${item.article}`}
                  style={{
                    background: "var(--paper-2)",
                    border: "1px solid var(--line)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 12.5,
                  }}
                >
                  <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 12 }}>
                    {item.article}
                  </div>
                  {item.note && (
                    <div style={{ color: "var(--muted)", marginTop: 2 }}>{item.note}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          <p
            style={{
              marginTop: 8,
              fontSize: 11.5,
              color: "var(--muted)",
              lineHeight: 1.45,
            }}
          >
            Thematisch einschlägige Artikel ohne konkreten Bezug zum Schreiben.
          </p>
        </div>
      )}
    </aside>
  );
}
