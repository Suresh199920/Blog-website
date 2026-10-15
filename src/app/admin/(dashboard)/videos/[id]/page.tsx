import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminVideoById } from "@/lib/admin-queries";
import { youtubeThumbnailUrl } from "@/lib/youtube";
import { isUuid } from "@/lib/validate";
import { VideoEditor } from "../VideoEditor";

export const metadata: Metadata = {
  title: "Edit video",
  robots: { index: false, follow: false },
};

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  // Guard the cast before it reaches Postgres.
  if (!isUuid(id)) notFound();

  const video = await getAdminVideoById(id);

  if (!video) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Edit video
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="relative aspect-video bg-neutral-100">
            <Image
              src={youtubeThumbnailUrl(video.youtube_id)}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <VideoEditor video={video} />
        </div>
      </div>
    </div>
  );
}