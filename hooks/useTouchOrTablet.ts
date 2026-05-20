"use client";

import { useEffect, useState } from "react";

const TOUCH_OR_TABLET_QUERY =
  "(max-width: 1024px), (hover: none) and (pointer: coarse)";

export function useTouchOrTablet(): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(TOUCH_OR_TABLET_QUERY);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return matches;
}
