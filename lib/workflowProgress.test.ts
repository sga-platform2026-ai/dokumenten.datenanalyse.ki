import assert from "node:assert/strict";
import { test } from "node:test";
import {
  analyzeCreepIntervalMs,
  progressForRead,
  WORKFLOW_PROGRESS,
} from "@/lib/workflowProgress";

test("progressForRead startet niedrig und endet bei readEnd", () => {
  assert.equal(progressForRead(0, 1, 0), WORKFLOW_PROGRESS.readStart);
  assert.equal(progressForRead(0, 1, 1), WORKFLOW_PROGRESS.readEnd);
});

test("progressForRead verteilt mehrere Dateien gleichmäßig", () => {
  const mid = progressForRead(1, 2, 0);
  assert.ok(mid > WORKFLOW_PROGRESS.readStart);
  assert.ok(mid < WORKFLOW_PROGRESS.readEnd);
});

test("analyzeCreepIntervalMs ist lang genug für gleichmäßigen Analyse-Fortschritt", () => {
  const interval = analyzeCreepIntervalMs();
  const steps = WORKFLOW_PROGRESS.analyzeMax - WORKFLOW_PROGRESS.analyzeStart;
  assert.ok(interval >= 800);
  assert.ok(interval * steps >= 60_000);
});
