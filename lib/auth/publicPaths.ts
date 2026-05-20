/**
 * Routes that stay accessible when authentication is enabled.
 */
export function isPublicPath(pathname: string): boolean {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  if (normalized === "/login") {
    return true;
  }

  if (normalized.startsWith("/api/auth")) {
    return true;
  }

  return false;
}
