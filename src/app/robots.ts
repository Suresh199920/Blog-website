import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const origin = base.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The admin area holds private data and must never be indexed.
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}