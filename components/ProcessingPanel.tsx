import { ProgressBar } from "@/components/ProgressBar";
import { Spinner } from "@/components/Spinner";

interface ProcessingPanelProps {
  title: string;
  hint?: string;
  compact?: boolean;
  progress?: number;
}

export function ProcessingPanel({
  title,
  hint,
  compact = false,
  progress,
}: ProcessingPanelProps) {
  const showProgress = progress !== undefined;

  return (
    <div
      className={`processing-panel${compact ? " processing-panel-compact" : ""}`}
      aria-live="polite"
      aria-busy="true"
    >
      {!showProgress && (
        <Spinner size={compact ? "md" : "lg"} label={title} />
      )}
      <div className="processing-panel-text">
        <p className="processing-panel-title">{title}</p>
        {hint && <p className="processing-panel-hint">{hint}</p>}
      </div>
      {showProgress && (
        <ProgressBar
          value={progress}
          className="processing-panel-progress"
          showLabel
        />
      )}
    </div>
  );
}
