import { parseAnalysisSections } from "@/lib/parseAiResponse";

interface AnalysisResultProps {
  analysis: string;
  fileName?: string | null;
  mock?: boolean;
}

export function AnalysisResult({ analysis, fileName, mock }: AnalysisResultProps) {
  const parsed = parseAnalysisSections(analysis);
  const articleCount = parsed.articles.length;

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
              {articleCount} {articleCount === 1 ? "Artikel berührt" : "Artikel berührt"}
            </span>
          ) : (
            <span className="badge">Analyse abgeschlossen</span>
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
                key={`${item.article}`}
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
    </aside>
  );
}
