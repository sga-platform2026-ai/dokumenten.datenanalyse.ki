import { Header } from "@/components/Header";
import { isAuthEnabled } from "@/lib/auth/config";
import type { ProcessingStatus } from "@/types";

interface AppHeaderProps {
  status: ProcessingStatus;
}

export function AppHeader({ status }: AppHeaderProps) {
  return <Header status={status} showLogout={isAuthEnabled()} />;
}
