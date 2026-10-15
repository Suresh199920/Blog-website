import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FolderPlus, Images } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminPhotos, getAdminAlbums } from "@/lib/admin-queries";
import { publicImageUrl, BUCKETS } from "@/lib/storage";
import { AlbumEditor, PhotoEditor } from "./PhotoEditor";

export const metadata: Metadata = {
  title: "Photos",
  robots: { index: false, follow: false },
};

export default async function AdminPhotosPage() {
  await requireAdmin();

  const [photos, albums] = await Promise.all([
    getAdminPhotos(),
    getAdminAlbums(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Photos
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          {photos.length} {photos.length === 1 ? "photo" : "photos"} across{" "}
          {albums.length} {albums.length === 1 ? "album" : "albums"}.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">
            Upload a photo
          </h2>
          <p className="mb-5 mt-1 text-sm text-neutral-600">
            Files are stored in Supabase Storage. Manage individual photos from
            the list below.
          </p>
          <PhotoEditor
            photo={null}
            albums={albums.map((album) => ({ id: album.id, name: album.name }))}
          />
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <FolderPlus className="size-5 text-neutral-400" aria-hidden />
            New album
          </h2>
          <AlbumEditor />
        </section>
      </div>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
          <Images className="size-5 text-neutral-400" aria-hidden />
          Albums
        </h2>

        {albums.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-sm text-neutral-500">
            No albums yet.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <li
                key={album.id}
                className="rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm"
              >
                <h3 className="font-medium text-neutral-900">{album.name}</h3>
                <p className="mt-1 text-xs text-neutral-500">
                  {album.photo_count}{" "}
                  {album.photo_count === 1 ? "photo" : "photos"} · /{album.slug}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          All photos
        </h2>

        {photos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-sm text-neutral-500">
            No photos yet.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => {
              const url = publicImageUrl(BUCKETS.gallery, photo.image_path);

              return (
                <li
                  key={photo.id}
                  className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
                >
                  <div className="relative aspect-square bg-neutral-100">
                    {url && (
                      <Image
                        src={url}
                        alt={photo.alt_text ?? photo.title ?? ""}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {photo.title ?? "Untitled"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {photo.album?.name ?? "No album"}
                    </p>
                    <Link
                      href={`/admin/photos/${photo.id}`}
                      className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}