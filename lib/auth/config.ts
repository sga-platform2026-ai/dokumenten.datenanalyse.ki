import { MIN_AUTH_SECRET_LENGTH } from "@/lib/auth/constants";

export interface AuthConfig {
  username: string;
  password: string;
  secret: string;
}

function readAuthEnv(): AuthConfig | null {
  const username = process.env.AUTH_USERNAME?.trim();
  const password = process.env.AUTH_PASSWORD;
  const secret = process.env.AUTH_SECRET?.trim();

  if (!username || !password || !secret) {
    return null;
  }

  if (secret.length < MIN_AUTH_SECRET_LENGTH) {
    return null;
  }

  return { username, password, secret };
}

/** Auth is active only when all three env vars are set and AUTH_SECRET is long enough. */
export function isAuthEnabled(): boolean {
  return readAuthEnv() !== null;
}

export function getAuthConfig(): AuthConfig | null {
  return readAuthEnv();
}
