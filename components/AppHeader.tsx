"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import type { ProcessingStatus } from "@/types";

interface AppHeaderProps {
  status: ProcessingStatus;
}

interface AuthStatusResponse {
  enabled?: unknown;
}

export function AppHeader({ status }: AppHeaderProps) {
  const [authEnabled, setAuthEnabled] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch("/api/auth/status", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          return;
        }
        const data: AuthStatusResponse = await res.json();
        if (!cancelled && data.enabled === true) {
          setAuthEnabled(true);
        }
      } catch {
        // Bei Netzwerkfehlern bleibt der Button verborgen – kein User-Impact.
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return <Header status={status} showLogout={authEnabled} />;
}
