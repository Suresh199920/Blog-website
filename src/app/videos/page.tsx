import Link from "next/link";
import type { Metadata } from "next";
import { PlayCircle } from "lucide-react";
import { getVideoCategories, getVideos } from "@/lib/videos";
import { VideoBrowser } from "@/components/video/VideoBrowser";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "A library of YouTube videos — tutorials, walkthroughs and behind the scenes.",
  alternates: { canonical: "/videos" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

export default async function VideosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const category = first(params.category);
  const requestedVideo = first(params.v);

  const [videos, categories] = await Promise.all([
    getVideos({ category }),
    getVideoCategories(),
  ]);

  // `?v=` deep link wins, otherwise open on the featured video. Only
  // match rows that actually have a YouTube id so an empty query string
  // can't select the first video by accident.
  const featured = videos.find((video) => video.is_featured);
  const initialVideoId = requestedVideo
    ? videos.find((video) => video.youtube_id === requestedVideo)?.youtube_id
    : featured?.youtube_id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Videos
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {videos.length} {videos.length === 1 ? "video" : "videos"}
          {category && ` in ${category}`}
        </p>
      </header>

      {categories.length > 0 && (
        <nav aria-label="Video categories" className="mb-10">
          <ul className="flex flex-wrap gap-2">
            <li>
              <CategoryLink href="/videos" active={!category} label="All videos" />
            </li>
            {categories.map((name) => (
              <li key={name}>
                <CategoryLink
                  href={`/videos?category=${encodeURIComponent(name)}`}
                  active={category === name}
                  label={name}
                />
              </li>
            ))}
          </ul>
        </nav>
      )}

      {videos.length === 0 ? (
        <EmptyState
          icon={PlayCircle}
          title="No videos yet"
          description="Nothing has been published here yet. Check back soon."
        />
      ) : (
        <VideoBrowser videos={videos} initialVideoId={initialVideoId} />
      )}
    </div>
  );
}

function CategoryLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
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
    </Link>
  );
}