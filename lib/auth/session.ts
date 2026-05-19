import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";
import { getAuthConfig, isAuthEnabled } from "@/lib/auth/config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface SessionPayload {
  sub: string;
  exp: number;
}

const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array | null {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLen);

  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function signPayload(payloadB64: string, secret: string): Promise<string> {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadB64),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function getSessionCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function createSessionToken(username: string): Promise<string> {
  const config = getAuthConfig();
  if (!config) {
    throw new Error("Auth ist nicht konfiguriert.");
  }

  const payload: SessionPayload = {
    sub: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };

  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await signPayload(payloadB64, config.secret);
  return `${payloadB64}.${signature}`;
}

async function verifySessionToken(
  token: string,
  secret: string,
): Promise<SessionPayload | null> {
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex <= 0) {
    return null;
  }

  const payloadB64 = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const expectedSignature = await signPayload(payloadB64, secret);

  if (!timingSafeEqual(signature, expectedSignature)) {
    return null;
  }

  const payloadBytes = base64UrlDecode(payloadB64);
  if (!payloadBytes) {
    return null;
  }

  let payload: SessionPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as SessionPayload;
  } catch {
    return null;
  }

  if (
    typeof payload.sub !== "string" ||
    typeof payload.exp !== "number" ||
    payload.exp < Math.floor(Date.now() / 1000)
  ) {
    return null;
  }

  return payload;
}

export async function getSessionFromRequest(
  request: NextRequest | Request,
): Promise<SessionPayload | null> {
  if (!isAuthEnabled()) {
    return null;
  }

  const config = getAuthConfig();
  if (!config) {
    return null;
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const token = parseCookie(cookieHeader, SESSION_COOKIE_NAME);
  if (!token) {
    return null;
  }

  return verifySessionToken(token, config.secret);
}

function parseCookie(header: string, name: string): string | null {
  const parts = header.split(";");
  for (const part of parts) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey === name && rawValue.length > 0) {
      return decodeURIComponent(rawValue.join("="));
    }
  }
  return null;
}

export function setSessionCookie(
  response: NextResponse,
  token: string,
): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
}

/** Returns 401 when auth is enabled and the session is missing or invalid. */
export async function requireSession(
  request: Request,
): Promise<NextResponse | null> {
  if (!isAuthEnabled()) {
    return null;
  }

  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { error: "Nicht angemeldet." },
      { status: 401 },
    );
  }

  return null;
}
