import type { MetadataRoute } from "next";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const origin = base.replace(/\/$/, "");

  const staticRoutes = ["", "/blog", "/gallery", "/videos", "/about", "/contact"].map(
    (path) => ({
      url: `${origin}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })
  );

  if (!isSupabaseConfigured) return staticRoutes;

  const supabase = await createClient();

  const [{ data: posts }] = await Promise.all([
    supabase
      .from("posts")
      .select("slug, updated_at")
      .eq("status", "published"),
  ]);

  const postRoutes = (posts ?? []).map((post) => ({
    url: `${origin}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Albums are filtered by query string (`/gallery?album=slug`), not
  // their own route, so they are left out of the sitemap.
  return [...staticRoutes, ...postRoutes];
}