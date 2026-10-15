import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { demoAlbums, demoPhotos } from "@/lib/demo";
import type { Album, Photo } from "@/types/database";

export type PhotoWithAlbum = Photo & {
  album: Pick<Album, "id" | "slug" | "name"> | null;
};

export type AlbumWithCount = Album & { photo_count: number };

const PHOTO_SELECT = `
  id, album_id, title, caption, image_path, alt_text, width, height,
  sort_order, created_at,
  album:albums(id, slug, name)
`;

export async function getPhotos(options: {
  albumSlug?: string;
  page?: number;
  perPage?: number;
} = {}): Promise<{
  photos: PhotoWithAlbum[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
}> {
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.max(1, options.perPage ?? 24);

  const empty = { photos: [], total: 0, totalPages: 0, page, perPage };

  if (!isSupabaseConfigured) {
    const matching = options.albumSlug
      ? demoPhotos.filter((photo) => photo.album?.slug === options.albumSlug)
      : demoPhotos;

    const total = matching.length;
    const from = (page - 1) * perPage;

    return {
      photos: matching.slice(from, from + perPage),
      total,
      totalPages: Math.ceil(total / perPage),
      page,
      perPage,
    };
  }

  const supabase = await createClient();
  const from = (page - 1) * perPage;

  let query = supabase
    .from("photos")
    .select(PHOTO_SELECT, { count: "exact" })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (options.albumSlug) {
    const { data: album } = await supabase
      .from("albums")
      .select("id")
      .eq("slug", options.albumSlug)
      .maybeSingle();

    if (!album) return { ...empty, page, perPage };
    query = query.eq("album_id", album.id);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[photos] getPhotos failed:", error.message);
    return { photos: [], total: 0, totalPages: 0, page, perPage };
  }

  const total = count ?? 0;

  return {
    photos: (data ?? []) as unknown as PhotoWithAlbum[],
    total,
    totalPages: Math.ceil(total / perPage),
    page,
    perPage,
  };
}

export async function getAlbumsWithCounts(): Promise<AlbumWithCount[]> {
  if (!isSupabaseConfigured) {
    return demoAlbums.map((album) => ({
      ...album,
      photo_count: demoPhotos.filter((photo) => photo.album_id === album.id).length,
    }));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("albums")
    .select(
      "id, slug, name, description, cover_photo, sort_order, created_at, photos(count)"
    )
    .order("sort_order");

  if (error) {
    console.error("[photos] getAlbumsWithCounts failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const embedded = row.photos as { count: number } | null;
    const { photos: _photos, ...album } = row;
    return { ...album, photo_count: embedded?.count ?? 0 };
  });
}

export async function getLatestPhotos(limit = 8): Promise<PhotoWithAlbum[]> {
  if (!isSupabaseConfigured) return demoPhotos.slice(0, limit);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select(PHOTO_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    const isSkip = error.message?.includes("request skipped") || error.message?.includes("Supabase unreachable") || error.name === "AbortError";
    if (!isSkip) {
      console.error("[photos] getLatestPhotos failed:", error.message);
    }
    return [];
  }

  return (data ?? []) as unknown as PhotoWithAlbum[];
}
