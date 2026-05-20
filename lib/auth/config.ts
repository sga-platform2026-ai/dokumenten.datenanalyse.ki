import { MIN_AUTH_SECRET_LENGTH } from "@/lib/auth/constants";

export interface AuthConfig {
  username: string;
  password: string;
  secret: string;
}

export type AuthDisabledReason =
  | "not_configured"
  | "incomplete"
  | "secret_too_short";

export interface AuthConfigStatus {
  enabled: boolean;
  reason?: AuthDisabledReason;
}

function readAuthEnv(): AuthConfig | null {
  const status = getAuthConfigStatus();
  if (!status.enabled) {
    return null;
  }

  const username = process.env.AUTH_USERNAME?.trim() ?? "";
  const password = process.env.AUTH_PASSWORD?.trim() ?? "";
  const secret = process.env.AUTH_SECRET?.trim() ?? "";

  return { username, password, secret };
}

export function getAuthConfigStatus(): AuthConfigStatus {
  const username = process.env.AUTH_USERNAME?.trim();
  const password = process.env.AUTH_PASSWORD?.trim();
  const secret = process.env.AUTH_SECRET?.trim();

  if (!username && !password && !secret) {
    return { enabled: false, reason: "not_configured" };
  }

  if (!username || !password || !secret) {
    return { enabled: false, reason: "incomplete" };
  }

  if (secret.length < MIN_AUTH_SECRET_LENGTH) {
    return { enabled: false, reason: "secret_too_short" };
  }

  return { enabled: true };
}

export function getAuthDisabledMessage(reason: AuthDisabledReason): string {
  switch (reason) {
    case "not_configured":
      return "Der Zugangsschutz ist auf diesem Server nicht eingerichtet. Setzen Sie AUTH_USERNAME, AUTH_PASSWORD und AUTH_SECRET (mind. 32 Zeichen) in den Umgebungsvariablen und starten Sie die App neu.";
    case "incomplete":
      return "Der Zugangsschutz ist unvollständig konfiguriert. Alle drei Variablen AUTH_USERNAME, AUTH_PASSWORD und AUTH_SECRET müssen gesetzt sein.";
    case "secret_too_short":
      return `AUTH_SECRET ist zu kurz. Mindestens ${MIN_AUTH_SECRET_LENGTH} Zeichen erforderlich.`;
  }
}

/** Auth is active only when all three env vars are set and AUTH_SECRET is long enough. */
export function isAuthEnabled(): boolean {
  return getAuthConfigStatus().enabled;
}

export function getAuthConfig(): AuthConfig | null {
  return readAuthEnv();
}
