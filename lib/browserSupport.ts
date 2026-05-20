/** Erkennt Safari (Desktop/iOS), nicht Chrome/Firefox/Edge mit Safari-UA. */
export function isSafariBrowser(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent;
  const isSafari =
    /Safari/i.test(ua) &&
    !/Chrome|Chromium|CriOS|Edg|OPR|FxiOS/i.test(ua);

  return isSafari;
}
