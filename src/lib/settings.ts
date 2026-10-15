import { cache } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import { demoSettings } from "@/lib/demo";

export type SiteSettings = {
  site_title: string;
  site_tagline: string;
  site_description: string;
  about_body: string;
  contact_email: string;
  /** Optional hero image shown behind the homepage banner text. */
  banner_image: string;
};

/**
 * Values from the `settings` table, falling back to `site` so the
 * site still renders (and `generateMetadata` still has a title) on a
 * fresh install with no rows yet.
 *
 * `cache()` dedupes calls within a single render pass: the layout,
 * `generateMetadata` and the page all ask for settings, but only one
 * query is issued.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const fallback: SiteSettings = {
    site_title: site.name,
    site_tagline: site.author.bio,
    site_description: site.description,
    about_body: "",
    contact_email: site.author.email,
    banner_image: "",
  };

  if (!isSupabaseConfigured) return demoSettings;

  const supabase = await createClient();
  const { data, error } = await supabase.from("settings").select("key, value");

  if (error) {
    const isSkip = error.message?.includes("request skipped") || error.message?.includes("Supabase unreachable");
    if (!isSkip) {
      console.error("[settings] getSettings failed:", error.message);
    }
    return fallback;
  }

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    if (row.value != null) map[row.key] = row.value;
  }

  return {
    site_title: map.site_title || fallback.site_title,
    site_tagline: map.site_tagline || fallback.site_tagline,
    site_description: map.site_description || fallback.site_description,
    about_body: map.about_body || fallback.about_body,
    contact_email: map.contact_email || fallback.contact_email,
    banner_image: map.banner_image || fallback.banner_image,
  };
});
