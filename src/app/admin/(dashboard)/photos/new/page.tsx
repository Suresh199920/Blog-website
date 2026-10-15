import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getAdminAlbums } from "@/lib/admin-queries";
import { PhotoEditor } from "../PhotoEditor";

export const metadata: Metadata = {
  title: "New photo",
  robots: { index: false, follow: false },
};

export default async function NewPhotoPage() {
  await requireAdmin();

  const albums = await getAdminAlbums();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          New photo
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Upload an image and choose which album it belongs to.
        </p>
      </header>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <PhotoEditor
          photo={null}
          albums={albums.map((album) => ({ id: album.id, name: album.name }))}
        />
      </div>
    </div>
  );
}