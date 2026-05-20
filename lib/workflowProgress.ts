export const WORKFLOW_PROGRESS = {
  start: 0,
  readStart: 2,
  readEnd: 20,
  ocrEnd: 30,
  parseEnd: 38,
  analyzeStart: 38,
  analyzeMax: 95,
  done: 100,
} as const;

const ANALYZE_CREEP_DURATION_MS = 90_000;

export function progressForRead(
  fileIndex: number,
  fileCount: number,
  ocrFraction: number,
): number {
  const { readStart, readEnd } = WORKFLOW_PROGRESS;
  const span = readEnd - readStart;
  const perFile = span / Math.max(1, fileCount);
  const value = readStart + fileIndex * perFile + ocrFraction * perFile;
  return Math.min(readEnd, Math.round(value));
}

export function analyzeCreepIntervalMs(): number {
  const steps = WORKFLOW_PROGRESS.analyzeMax - WORKFLOW_PROGRESS.analyzeStart;
  return Math.max(800, Math.round(ANALYZE_CREEP_DURATION_MS / steps));
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function animateProgress(
  setProgress: (value: number) => void,
  from: number,
  to: number,
  durationMs: number,
): Promise<void> {
  if (durationMs <= 0 || from === to) {
    setProgress(to);
    return;
  }

  const steps = Math.max(1, Math.round(durationMs / 80));
  const stepMs = Math.round(durationMs / steps);

  for (let step = 1; step <= steps; step += 1) {
    await wait(stepMs);
    setProgress(Math.round(from + ((to - from) * step) / steps));
  }
}
