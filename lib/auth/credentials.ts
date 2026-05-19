import { getAuthConfig } from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/password";

export function validateCredentials(
  username: string,
  password: string,
): boolean {
  const config = getAuthConfig();
  if (!config) {
    return false;
  }

  if (username !== config.username) {
    return false;
  }

  return verifyPassword(password, config.password);
}
