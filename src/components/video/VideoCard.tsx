import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Youtube } from "lucide-react";
import { formatDuration, youtubeThumbnailUrl } from "@/lib/youtube";
import { formatDate, toISODate } from "@/lib/format";
import type { Video } from "@/types/database";

export function VideoCard({ video }: { video: Video }) {
  const duration = formatDuration(video.duration_seconds);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
      <a
        href={video.youtube_url || undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!video.youtube_id}
        className="relative block aspect-video overflow-hidden bg-neutral-900"
      >
        {video.youtube_id ? (
          <Image
            src={youtubeThumbnailUrl(video.youtube_id, "hq")}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // No YouTube ID yet (only happens with the sample content), so
          // show a neutral panel rather than a broken image.
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-neutral-800 to-neutral-950 text-neutral-500"
          >
            <Youtube className="size-10" />
          </span>
        )}
        <span
          aria-hidden
          className="absolute inset-0 bg-neutral-950/25 transition-colors group-hover:bg-neutral-950/10"
        />
        <span aria-hidden className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="size-14 text-white/90 drop-shadow-lg transition-transform duration-200 group-hover:scale-110" />
        </span>
        {duration && (
          <span className="absolute bottom-2 right-2 rounded-md bg-neutral-950/85 px-1.5 py-0.5 font-mono text-xs font-medium text-white">
            {duration}
          </span>
        )}
        <span className="sr-only">Watch &ldquo;{video.title}&rdquo; on YouTube</span>
      </a>

      <div className="flex flex-1 flex-col p-5">
        {video.category && (
          <span className="text-xs font-semibold uppercase tracking-wide text-accent-600">
            {video.category}
          </span>
        )}
        <h3 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug tracking-tight text-neutral-900">
          {video.title}
        </h3>
        {video.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">
            {video.description}
          </p>
        )}
        {video.published_at && (
          <time
            dateTime={toISODate(video.published_at)}
            className="mt-auto pt-3 text-xs text-neutral-400"
          >
            {formatDate(video.published_at)}
          </time>
        )}
      </div>
    </article>
  );
}

export function VideoListItem({ video }: { video: Video }) {
  const duration = formatDuration(video.duration_seconds);

  return (
    <Link
      href={`/videos?v=${video.youtube_id}`}
      className="group flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-3 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
    >
      <span className="relative block size-20 shrink-0 overflow-hidden rounded-md bg-neutral-900">
        {video.youtube_id ? (
          <Image
            src={youtubeThumbnailUrl(video.youtube_id, "mq")}
            alt=""
            fill
            sizes="80px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center bg-neutral-800"
          >
            <Youtube className="size-6 text-neutral-500" />
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-neutral-950/25">
          <PlayCircle className="size-7 text-white" aria-hidden />
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 block text-sm font-semibold leading-snug text-neutral-900 group-hover:text-primary-700">
          {video.title}
        </span>
        {video.category && (
          <span className="mt-1 block text-xs text-accent-600">{video.category}</span>
        )}
      </span>

      {duration && (
        <span className="hidden shrink-0 font-mono text-xs text-neutral-400 sm:block">
          {duration}
        </span>
      )}
    </Link>
  );
}