"use client";

import { useState } from "react";
import { ExternalLink, PlayCircle, Youtube } from "lucide-react";
import { YouTubeEmbed } from "@/components/video/YouTubeEmbed";
import { formatDuration } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import type { Video } from "@/types/database";

/**
 * Main player + playlist. Selecting a video swaps the embed in place
 * instead of navigating, so the page (and its scroll position) stays
 * where the visitor left it.
 */
export function VideoBrowser({
  videos,
  initialVideoId,
}: {
  videos: Video[];
  initialVideoId?: string;
}) {
  // Select by row id, not YouTube id: sample rows have no YouTube id, so
  // matching on it would pin every entry to the first video.
  const initial =
    videos.find((video) => video.youtube_id && video.youtube_id === initialVideoId) ??
    videos[0];

  const [selectedKey, setSelectedKey] = useState<string>(initial?.id ?? "");

  const active = videos.find((video) => video.id === selectedKey);

  if (!active) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      {/* ---------- Player ---------- */}
      <div>
        <YouTubeEmbed videoId={active.youtube_id} title={active.title} />

        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-2">
            {active.category && (
              <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-medium text-accent-800">
                {active.category}
              </span>
            )}
            {formatDuration(active.duration_seconds) && (
              <span className="font-mono text-xs text-neutral-400">
                {formatDuration(active.duration_seconds)}
              </span>
            )}
          </div>

          <h2
            id={`video-${active.id}`}
            className="mt-3 scroll-mt-24 text-2xl font-bold tracking-tight text-neutral-900"
          >
            {active.title}
          </h2>

          {active.description && (
            <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">
              {active.description}
            </p>
          )}

          <a
            href={active.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Watch on YouTube
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>
      </div>

      {/* ---------- Playlist ---------- */}
      <aside>
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-500">
          In this list
        </h2>

        <ul className="mt-4 space-y-2">
          {videos.map((video) => {
            const isActive = video.id === active.id;

            return (
              <li key={video.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedKey(video.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "group flex w-full gap-3 rounded-lg border p-2.5 text-left transition-colors",
                    isActive
                      ? "border-primary-300 bg-primary-50"
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                  )}
                >
                  <span className="relative block size-20 shrink-0 overflow-hidden rounded-md bg-neutral-900">
                    {video.youtube_id ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={`https://i.ytimg.com/vi/${video.youtube_id}/default.jpg`}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Youtube className="size-6 text-neutral-500" />
                      </span>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-neutral-950/25">
                      <PlayCircle className="size-6 text-white" aria-hidden />
                    </span>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "line-clamp-2 block text-sm font-semibold leading-snug",
                        isActive
                          ? "text-primary-800"
                          : "text-neutral-900 group-hover:text-primary-700"
                      )}
                    >
                      {video.title}
                    </span>
                    {video.category && (
                      <span className="mt-1 block text-xs text-accent-600">
                        {video.category}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}