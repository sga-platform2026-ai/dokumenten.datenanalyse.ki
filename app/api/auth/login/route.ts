import { isAuthEnabled } from "@/lib/auth/config";
import { validateCredentials } from "@/lib/auth/credentials";
import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { NextResponse } from "next/server";

interface LoginBody {
  username?: string;
  password?: string;
}

export async function POST(request: Request) {
  if (!isAuthEnabled()) {
    return NextResponse.json(
      { error: "Authentifizierung ist nicht aktiviert." },
      { status: 404 },
    );
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { error: "Ungültige Anfrage." },
      { status: 400 },
    );
  }

  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Benutzername und Passwort sind erforderlich." },
      { status: 400 },
    );
  }

  if (!validateCredentials(username, password)) {
    return NextResponse.json(
      { error: "Ungültige Anmeldedaten." },
      { status: 401 },
    );
  }

  const token = await createSessionToken(username);
  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, token);
  return response;
}
