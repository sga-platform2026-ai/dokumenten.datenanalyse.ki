import type { MetadataRoute } from "next";

/** Keine Indexierung durch Suchmaschinen. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
