/**
 * Admin-only queries.
 *
 * These bypass the public filters (`status = published`, future-date
 * checks) so the admin can see drafts and scheduled posts. Every one of
 * them must only ever be called after `requireAdmin()` has passed.
 */
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Post, Video, Photo, Album, ContactMessage, Category } from "@/types/database";

export type AdminPost = Post & {
  category: Pick<Category, "id" | "name"> | null;
};

export type AdminPhoto = Photo & {
  album: Pick<Album, "id" | "name"> | null;
};

export async function getAdminPosts(): Promise<AdminPost[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, category:categories(id, name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin] getAdminPosts failed:", error.message);
    return [];
  }

  return (data ?? []) as unknown as AdminPost[];
}

export async function getAdminPostById(id: string): Promise<AdminPost | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, category:categories(id, name)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[admin] getAdminPostById failed:", error.message);
    return null;
  }

  return (data as unknown as AdminPost) ?? null;
}

export async function getAdminCategories(): Promise<
  Pick<Category, "id" | "name">[]
> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order");

  if (error) {
    console.error("[admin] getAdminCategories failed:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getAdminPhotoById(id: string): Promise<AdminPhoto | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*, album:albums(id, name)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[admin] getAdminPhotoById failed:", error.message);
    return null;
  }

  return (data as unknown as AdminPhoto) ?? null;
}

export async function getAdminVideos(): Promise<Video[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin] getAdminVideos failed:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getAdminVideoById(id: string): Promise<Video | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[admin] getAdminVideoById failed:", error.message);
    return null;
  }

  return data ?? null;
}

export async function getAdminPhotos(): Promise<AdminPhoto[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*, album:albums(id, name)")
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin] getAdminPhotos failed:", error.message);
    return [];
  }

  return (data ?? []) as unknown as AdminPhoto[];
}

export async function getAdminAlbums(): Promise<
  (Album & { photo_count: number })[]
> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("albums")
    .select("id, slug, name, description, cover_photo, sort_order, created_at, photos(count)")
    .order("sort_order");

  if (error) {
    console.error("[admin] getAdminAlbums failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const embedded = row.photos as { count: number } | null;
    const { photos: _photos, ...album } = row;
    return { ...album, photo_count: embedded?.count ?? 0 };
  });
}

export async function getAdminMessages(): Promise<{
  messages: ContactMessage[];
  unread: number;
}> {
  const empty = { messages: [], unread: 0 };
  if (!isSupabaseConfigured) return empty;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("is_read")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin] getAdminMessages failed:", error.message);
    return empty;
  }

  const messages = data ?? [];
  return {
    messages,
    unread: messages.filter((message) => !message.is_read).length,
  };
}