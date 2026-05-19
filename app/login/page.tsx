import { LoginForm } from "@/components/LoginForm";
import { isAuthEnabled } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata = {
  title: "Anmelden – Dokumentenprüfung GA IV",
};

export default function LoginPage() {
  if (!isAuthEnabled()) {
    redirect("/");
  }

  return (
    <div className="login-page">
      <header className="topbar login-topbar">
        <div className="brand">
          <div className="brand-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="GA IV Logo"
              style={{
                width: 34,
                height: 34,
                objectFit: "contain",
                filter: "drop-shadow(0 1px 0 rgba(0,0,0,.4))",
              }}
            />
          </div>
          <div className="brand-text">
            <span className="name">Dokumentenprüfung GA IV</span>
            <span className="sub">Genfer Abkommen · Zivilistenschutz</span>
          </div>
        </div>
      </header>

      <main className="login-shell">
        <div className="login-card card accent fade-up">
          <p className="eyebrow" style={{ marginBottom: 8 }}>
            Zugang geschützt
          </p>
          <h1 className="serif login-title">Anmelden</h1>
          <p className="login-lede">
            Bitte melden Sie sich an, um die Dokumentenprüfung zu nutzen.
          </p>
          <Suspense fallback={<p className="login-lede">Formular wird geladen …</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
