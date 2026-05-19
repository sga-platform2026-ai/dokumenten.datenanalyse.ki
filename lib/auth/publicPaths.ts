/**
 * Routes that stay accessible when authentication is enabled.
 */
export function isPublicPath(pathname: string): boolean {
  if (pathname === "/login") {
    return true;
  }

  if (pathname.startsWith("/api/auth")) {
    return true;
  }

  return false;
}
