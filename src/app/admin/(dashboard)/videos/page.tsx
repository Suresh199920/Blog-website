import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminVideos } from "@/lib/admin-queries";
import { youtubeThumbnailUrl, formatDuration } from "@/lib/youtube";
import { VideoEditor } from "./VideoEditor";

export const metadata: Metadata = {
  title: "Videos",
  robots: { index: false, follow: false },
};

export default async function AdminVideosPage() {
  await requireAdmin();

  const videos = await getAdminVideos();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Videos
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          {videos.length} {videos.length === 1 ? "video" : "videos"} added.
        </p>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-neutral-900">
          Add a video
        </h2>
        <VideoEditor video={null} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          Your videos
        </h2>

        {videos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-sm text-neutral-500">
            No videos yet. Paste a YouTube link above to add one.
          </p>
        ) : (
          <ul className="space-y-3">
            {videos.map((video) => (
              <li
                key={video.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  <Image
                    src={youtubeThumbnailUrl(video.youtube_id)}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-neutral-900">
                    {video.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {video.youtube_id}
                    {video.category ? ` · ${video.category}` : ""}
                    {video.duration_seconds
                      ? ` · ${formatDuration(video.duration_seconds)}`
                      : ""}
                  </p>
                </div>

                <Link
                  href={`/admin/videos/${video.id}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}