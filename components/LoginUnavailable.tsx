import { getAuthDisabledMessage, type AuthDisabledReason } from "@/lib/auth/config";
import Link from "next/link";

interface LoginUnavailableProps {
  reason: AuthDisabledReason;
}

export function LoginUnavailable({ reason }: LoginUnavailableProps) {
  return (
    <div className="login-unavailable">
      <p className="login-error" role="status">
        {getAuthDisabledMessage(reason)}
      </p>
      <p className="login-lede" style={{ marginTop: 12 }}>
        Auf Vercel: Project Settings → Environment Variables → Redeploy.
        Lokal: Werte in <code>.env.local</code> ohne Leerzeichen um das{" "}
        <code>=</code> eintragen.
      </p>
      <Link href="/" className="btn btn-primary login-submit" style={{ marginTop: 18 }}>
        Zur App
      </Link>
    </div>
  );
}
