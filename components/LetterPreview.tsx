import type { ReactNode } from "react";
import { normalizeLetterText } from "@/lib/normalizeLetter";

interface LetterPreviewProps {
  letter: string;
  generatedAt?: string;
  mock?: boolean;
  actions?: ReactNode;
}

function formatNow(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}, ${hh}:${min}`;
}

export function LetterPreview({ letter, mock, actions }: LetterPreviewProps) {
  const lines = normalizeLetterText(letter).split("\n");

  return (
    <section className="letter-wrap fade-up" aria-live="polite">
      <div className="letter-head">
        <div>
          <h2>Antwortschreiben · Entwurf</h2>
          <div className="meta">
            Generiert am {formatNow()} ·{" "}
            Modell{" "}
            <span className="mono">{mock ? "demo-mock" : "grok-doc-de"}</span>
            {mock && " · Demo-Modus"}
          </div>
        </div>
        {actions}
      </div>

      <article className="sheet" id="letter-preview">
        <span className="fold-mark t" />
        <span className="fold-mark b" />

        <div className="body">
          {lines.map((line, i) => {
            if (line.trim() === "") {
              return <br key={i} />;
            }
            return <p key={i}>{line}</p>;
          })}
        </div>
      </article>
    </section>
  );
}
