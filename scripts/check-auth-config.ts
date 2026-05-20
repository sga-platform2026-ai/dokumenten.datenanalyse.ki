import { loadEnvConfig } from "@next/env";
import { getAuthConfigStatus } from "@/lib/auth/config";

async function main(): Promise<void> {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);

  const remoteUrl = process.argv[2]?.trim();
  const status = getAuthConfigStatus();

  console.log("Lokale Auth-Konfiguration (.env.local):");
  console.log(JSON.stringify(status, null, 2));

  if (status.enabled) {
    console.log("\nOK: Login ist lokal aktiv. Middleware schützt / nach Redeploy.");
  } else {
    console.log(
      `\nHinweis: Auth lokal inaktiv (${status.reason ?? "unbekannt"}).`,
    );
    console.log(
      "Setzen Sie AUTH_USERNAME, AUTH_PASSWORD und AUTH_SECRET (mind. 32 Zeichen).",
    );
  }

  if (remoteUrl) {
    console.log("");
    await checkRemote(remoteUrl);
  }
}

async function checkRemote(url: string): Promise<void> {
  const endpoint = new URL("/api/auth/status", url.endsWith("/") ? url : `${url}/`);
  console.log(`Remote: ${endpoint.toString()}`);

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    const body = (await response.json()) as {
      enabled?: boolean;
      reason?: string | null;
    };
    console.log(`HTTP ${response.status}`);
    console.log(JSON.stringify(body, null, 2));
  } catch (error) {
    console.error(
      "Remote-Check fehlgeschlagen:",
      error instanceof Error ? error.message : error,
    );
  }
}

void main();
