import fs from "node:fs";
import path from "node:path";
import { getGrokRuntimeConfig, GROK_CONFIG_RELATIVE_PATH } from "../lib/grokConfig";
import { grokChat } from "../lib/grokChat";

function loadEnv(file: string): void {
  const envPath = path.join(process.cwd(), file);
  if (!fs.existsSync(envPath)) {
    return;
  }
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq < 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv(".env.local");

const config = getGrokRuntimeConfig();

if (!config.apiKey) {
  console.log(
    JSON.stringify({
      configured: false,
      ok: false,
      configFile: GROK_CONFIG_RELATIVE_PATH,
      error: "GROK_API_KEY fehlt in .env.local",
    }),
  );
  process.exit(0);
}

console.log(
  JSON.stringify({
    configured: true,
    configFile: GROK_CONFIG_RELATIVE_PATH,
    keyLength: config.apiKey.length,
    keyPrefix: `${config.apiKey.slice(0, 6)}…`,
    apiUrl: config.apiUrl,
    model: config.model,
    reasoningEffort: config.reasoningEffort,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  }),
);

const started = Date.now();

try {
  const reply = await grokChat({
    apiKey: config.apiKey,
    apiUrl: config.apiUrl,
    model: config.model,
    system: "Antworte nur mit dem Wort OK.",
    user: "Test",
    temperature: 0,
    maxTokens: 10,
    reasoningEffort: config.reasoningEffort,
    signal: AbortSignal.timeout(60_000),
  });

  console.log(
    JSON.stringify({
      ok: true,
      ms: Date.now() - started,
      reply: reply.trim().slice(0, 80),
    }),
  );
  process.exit(0);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.log(
    JSON.stringify({
      ok: false,
      ms: Date.now() - started,
      error: message,
    }),
  );
  process.exit(1);
}
