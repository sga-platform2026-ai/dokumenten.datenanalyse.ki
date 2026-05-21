import assert from "node:assert/strict";
import { test } from "node:test";
import { getProcessingMessage } from "@/lib/processingMessages";

test("getProcessingMessage reading nennt Einlese-Dauer", () => {
  const message = getProcessingMessage("reading");

  assert.ok(message);
  assert.match(message.hint ?? "", /Einlesen/u);
  assert.match(message.hint ?? "", /Minute/u);
});

test("getProcessingMessage analyzing nennt 1–2 Minuten", () => {
  const message = getProcessingMessage("analyzing");

  assert.ok(message);
  assert.match(message.hint ?? "", /1–2 Minuten/);
  assert.match(message.hint ?? "", /Fenster geöffnet lassen/i);
});

test("getProcessingMessage liefert null für idle", () => {
  assert.equal(getProcessingMessage("idle"), null);
});
