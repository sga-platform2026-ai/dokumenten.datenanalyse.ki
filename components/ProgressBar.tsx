interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  className,
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={className ?? "progress-bar-wrap"}>
      {showLabel && (
        <div className="progress-bar-meta">
          <span className="progress-bar-label">Fortschritt</span>
          <span className="progress-bar-value">{clamped} %</span>
        </div>
      )}
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Fortschritt ${clamped} Prozent`}
      >
        <div style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
