import type { ReactNode } from "react";
import {
  PREVIEW_LETTER_PAGINATION,
  paginateLetterText,
} from "@/lib/letterPagination";
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
  const body = normalizeLetterText(letter);
  const pages = paginateLetterText(body, PREVIEW_LETTER_PAGINATION);
  const pageCount = pages.length;

  return (
    <section className="letter-wrap fade-up" aria-live="polite">
      <div className="letter-head">
        <div>
          <h2>Antwortschreiben · Entwurf</h2>
          <div className="meta">
            Generiert am {formatNow()} · Modell{" "}
            <span className="mono">{mock ? "demo-mock" : "grok-doc-de"}</span>
            {mock && " · Demo-Modus"}
            {pageCount > 1 && <> · {pageCount} Seiten</>}
          </div>
        </div>
        {actions}
      </div>

      <div className="letter-pages">
        {pages.map((pageLines, pageIndex) => (
          <article
            key={pageIndex}
            className="sheet"
            id={pageIndex === 0 ? "letter-preview" : undefined}
            aria-label={
              pageCount > 1
                ? `Briefseite ${pageIndex + 1} von ${pageCount}`
                : "Antwortbrief"
            }
          >
            <span className="fold-mark t" aria-hidden />
            <span className="fold-mark b" aria-hidden />

            {pageCount > 1 && (
              <span className="sheet-page-label">
                Seite {pageIndex + 1} von {pageCount}
              </span>
            )}

            <div className="body">
              {pageLines.map((line, lineIndex) => {
                if (line.trim() === "") {
                  return <br key={lineIndex} />;
                }
                return <p key={lineIndex}>{line}</p>;
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
