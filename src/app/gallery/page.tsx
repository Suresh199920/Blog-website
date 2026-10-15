import Link from "next/link";
import type { Metadata } from "next";
import { Camera } from "lucide-react";
import { getAlbumsWithCounts, getPhotos } from "@/lib/photos";
import { site } from "@/lib/site";
import { publicImageUrl } from "@/lib/storage";
import { PhotoGrid, type LightboxPhoto } from "@/components/gallery/PhotoGrid";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Photo gallery",
  description:
    "Browse the photo gallery by album. Click any photo to view it full size.",
  alternates: { canonical: "/gallery" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const albumSlug = first(params.album);
  const parsed = Number.parseInt(first(params.page) ?? "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const [{ photos, total, totalPages }, albums] = await Promise.all([
    getPhotos({ albumSlug, page, perPage: site.photosPerPage }),
    getAlbumsWithCounts(),
  ]);

  const activeAlbum = albums.find((album) => album.slug === albumSlug);

  const lightboxPhotos: LightboxPhoto[] = photos
    .map((photo) => {
      const full = publicImageUrl("gallery", photo.image_path);
      if (!full) return null;

      return {
        id: photo.id,
        src: full,
        thumb: full,
        alt: photo.alt_text || photo.title || photo.caption || "Gallery photo",
        caption: photo.caption || photo.title,
        album: photo.album?.name ?? null,
      };
    })
    .filter((photo): photo is LightboxPhoto => photo !== null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          {activeAlbum ? activeAlbum.name : "Photo gallery"}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {activeAlbum?.description ||
            "Everything I've shot lately. Click any photo to view it full size."}
          {" · "}
          {total} {total === 1 ? "photo" : "photos"}
        </p>
      </header>

      {albums.length > 0 && (
        <nav aria-label="Albums" className="mb-8">
          <ul className="flex flex-wrap gap-2">
            <li>
              <AlbumLink
                href="/gallery"
                active={!albumSlug}
                label="All photos"
                count={albums.reduce((sum, album) => sum + album.photo_count, 0)}
              />
            </li>
            {albums.map((album) => (
              <li key={album.id}>
                <AlbumLink
                  href={`/gallery?album=${album.slug}`}
                  active={albumSlug === album.slug}
                  label={album.name}
                  count={album.photo_count}
                />
              </li>
            ))}
          </ul>
        </nav>
      )}

      {lightboxPhotos.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="No photos yet"
          description="Nothing has been published here yet. Check back soon."
        />
      ) : (
        <>
          <PhotoGrid photos={lightboxPhotos} />

          <Pagination
            page={page}
            totalPages={totalPages}
            pathname="/gallery"
            params={{ album: albumSlug }}
            className="mt-12"
          />
        </>
      )}
    </div>
  );
}

function AlbumLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary-600 text-white"
          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
      )}
    >
      {label}
      <span
        className={cn(
          "text-xs tabular-nums",
          active ? "text-primary-100" : "text-neutral-400"
        )}
      >
        {count}
      </span>
    </Link>
  );
}