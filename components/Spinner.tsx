type SpinnerSize = "sm" | "md" | "lg";
type SpinnerTone = "default" | "light" | "inverse";

interface SpinnerProps {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  className?: string;
  label?: string;
}

export function Spinner({
  size = "md",
  tone = "default",
  className = "",
  label = "Lädt",
}: SpinnerProps) {
  return (
    <span
      className={["spinner", `spinner-${size}`, `spinner-${tone}`, className]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-label={label}
    />
  );
}
