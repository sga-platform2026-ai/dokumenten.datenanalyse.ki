import fs from "node:fs";
import path from "node:path";

function loadEnv(file) {
  const envPath = path.join(process.cwd(), file);
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(".env.local");

const apiKey = process.env.GROK_API_KEY?.trim() ?? "";
const apiUrl =
  process.env.GROK_API_URL?.trim() ||
  "https://api.x.ai/v1/chat/completions";
const model = process.env.GROK_MODEL?.trim() || "grok-3-latest";

if (!apiKey) {
  console.log(
    JSON.stringify({
      configured: false,
      ok: false,
      error: "GROK_API_KEY fehlt in .env.local",
    }),
  );
  process.exit(0);
}

console.log(
  JSON.stringify({
    configured: true,
    keyLength: apiKey.length,
    keyPrefix: `${apiKey.slice(0, 6)}…`,
    apiUrl,
    model,
  }),
);

const started = Date.now();

try {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Antworte nur mit dem Wort OK." }],
      max_tokens: 10,
      temperature: 0,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  const raw = await response.text();
  let body = {};
  try {
    body = JSON.parse(raw);
  } catch {
    body = { raw: raw.slice(0, 400) };
  }

  const reply = body.choices?.[0]?.message?.content;

  console.log(
    JSON.stringify({
      ok: response.ok,
      status: response.status,
      ms: Date.now() - started,
      reply: reply ? String(reply).trim().slice(0, 80) : null,
      error: response.ok
        ? null
        : body.error?.message ?? body.error ?? raw.slice(0, 300),
    }),
  );

  process.exit(response.ok ? 0 : 1);
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
