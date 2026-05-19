import { ProcessingPanel } from "@/components/ProcessingPanel";

interface ProcessingOverlayProps {
  title: string;
  hint?: string;
}

export function ProcessingOverlay({ title, hint }: ProcessingOverlayProps) {
  return (
    <div className="processing-overlay" role="dialog" aria-modal="true" aria-busy="true">
      <ProcessingPanel title={title} hint={hint} />
    </div>
  );
}
