import { ProcessingPanel } from "@/components/ProcessingPanel";

interface ProcessingOverlayProps {
  title: string;
  hint?: string;
  progress?: number;
}

export function ProcessingOverlay({ title, hint, progress }: ProcessingOverlayProps) {
  return (
    <div className="processing-overlay" role="dialog" aria-modal="true" aria-busy="true">
      <ProcessingPanel title={title} hint={hint} progress={progress} />
    </div>
  );
}
