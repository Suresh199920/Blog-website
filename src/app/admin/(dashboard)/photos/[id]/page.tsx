import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminAlbums, getAdminPhotoById } from "@/lib/admin-queries";
import { publicImageUrl, BUCKETS } from "@/lib/storage";
import { isUuid } from "@/lib/validate";
import { PhotoEditor } from "../PhotoEditor";

export const metadata: Metadata = {
  title: "Edit photo",
  robots: { index: false, follow: false },
};

export default async function EditPhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  if (!isUuid(id)) notFound();

  const [photo, albums] = await Promise.all([
    getAdminPhotoById(id),
    getAdminAlbums(),
  ]);

  if (!photo) notFound();

  const url = publicImageUrl(BUCKETS.gallery, photo.image_path);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Edit photo
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="relative aspect-square bg-neutral-100">
            {url && (
              <Image
                src={url}
                alt={photo.alt_text ?? photo.title ?? ""}
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <PhotoEditor
            photo={photo}
            albums={albums.map((album) => ({ id: album.id, name: album.name }))}
          />
        </div>
      </div>
    </div>
  );
}