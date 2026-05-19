import { Spinner } from "@/components/Spinner";

interface ProcessingPanelProps {
  title: string;
  hint?: string;
  compact?: boolean;
}

export function ProcessingPanel({ title, hint, compact = false }: ProcessingPanelProps) {
  return (
    <div
      className={`processing-panel${compact ? " processing-panel-compact" : ""}`}
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size={compact ? "md" : "lg"} label={title} />
      <div className="processing-panel-text">
        <p className="processing-panel-title">{title}</p>
        {hint && <p className="processing-panel-hint">{hint}</p>}
      </div>
    </div>
  );
}
