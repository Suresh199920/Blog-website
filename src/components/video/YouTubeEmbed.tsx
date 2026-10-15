"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayCircle, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube";

/**
 * Click-to-play YouTube embed.
 *
 * Mounting the real `<iframe>` only after a click keeps roughly a
 * megabyte of player JavaScript off the initial page load, and stops
 * YouTube from setting tracking cookies for visitors who never press
 * play. `youtube-nocookie.com` is used for the same reason.
 */
export function YouTubeEmbed({
  videoId,
  title,
  className,
}: {
  videoId: string;
  title: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-900 shadow-md",
        className
      )}
    >
      {/* A record with no YouTube ID yet (sample content) has nothing to
          embed, so show a notice rather than a player that cannot load. */}
      {!videoId ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <Youtube className="size-10 text-neutral-500" aria-hidden />
          <p className="max-w-sm text-sm text-neutral-300">{title}</p>
          <p className="text-xs text-neutral-500">
            This sample video has no YouTube link yet.
          </p>
        </div>
      ) : playing ? (
        <iframe
          src={`${youtubeEmbedUrl(videoId)}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 size-full cursor-pointer"
        >
          <Image
            src={youtubeThumbnailUrl(videoId, "hq")}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-neutral-950/30 transition-colors group-hover:bg-neutral-950/15"
          />
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center"
          >
            <PlayCircle className="size-16 text-white drop-shadow-lg transition-transform duration-200 group-hover:scale-110 sm:size-20" />
          </span>
        </button>
      )}
    </div>
  );
}
