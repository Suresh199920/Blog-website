import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { demoVideos } from "@/lib/demo";
import type { Video } from "@/types/database";

export async function getVideos(options: {
  category?: string;
  limit?: number;
} = {}): Promise<Video[]> {
  if (!isSupabaseConfigured) {
    const filtered = options.category
      ? demoVideos.filter((video) => video.category === options.category)
      : demoVideos;

    return options.limit ? filtered.slice(0, options.limit) : filtered;
  }

  const supabase = await createClient();

  let query = supabase
    .from("videos")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (options.category) {
    query = query.eq("category", options.category);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    const isSkip = error.message?.includes("request skipped") || error.message?.includes("Supabase unreachable") || error.name === "AbortError";
    if (!isSkip) {
      console.error("[videos] getVideos failed:", error.message);
    }
    return [];
  }

  return data ?? [];
}

export async function getVideoById(id: string): Promise<Video | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[videos] getVideoById failed:", error.message);
    return null;
  }

  return data ?? null;
}

/** Distinct, non-empty category names across all videos. */
export async function getVideoCategories(): Promise<string[]> {
  if (!isSupabaseConfigured) {
    return [
      ...new Set(
        demoVideos
          .map((video) => video.category?.trim())
          .filter((value): value is string => Boolean(value))
      ),
    ].sort((a, b) => a.localeCompare(b));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("category")
    .not("category", "is", null);

  if (error) {
    console.error("[videos] getVideoCategories failed:", error.message);
    return [];
  }

  const unique = new Set(
    (data ?? [])
      .map((row) => row.category?.trim())
      .filter((value): value is string => Boolean(value))
  );

  return [...unique].sort((a, b) => a.localeCompare(b));
}
