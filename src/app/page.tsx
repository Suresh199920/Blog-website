import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, Camera, PenLine, PlayCircle } from "lucide-react";
import { getFeaturedPosts, getPublishedPosts } from "@/lib/posts";
import { getLatestPhotos } from "@/lib/photos";
import { getVideos } from "@/lib/videos";
import { getSettings } from "@/lib/settings";
import { site } from "@/lib/site";
import { publicImageUrl, BUCKETS } from "@/lib/storage";
import {
  PostCard,
  PostCardFeatured,
} from "@/components/blog/PostCard";
import { VideoCard } from "@/components/video/VideoCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    title: settings.site_title,
    description:
      settings.site_description ??
      "Essays and notes on building software, taking photographs, and paying attention.",
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const settings = await getSettings();

  const [featured, latest, photos, videos] = await Promise.all([
    getFeaturedPosts(1),
    getPublishedPosts({ perPage: 6 }),
    getLatestPhotos(8),
    getVideos({ limit: 3 }),
  ]);

  // Avoid showing the same post twice when the newest is also featured.
  const featuredPost = featured[0] ?? null;
  const latestPosts = latest.posts.filter(
    (post) => post.id !== featuredPost?.id
  );

  const configured = isSupabaseConfigured;
  const bannerUrl = settings.banner_image
    ? publicImageUrl(BUCKETS.postCovers, settings.banner_image)
    : null;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-neutral-950">
        {/* Banner photo sits behind the text. It carries a dark scrim so
            the heading keeps its contrast whatever the photo looks like. */}
        {bannerUrl && (
          <Image
            src={bannerUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}

        <div
          aria-hidden
          className={cn(
            "absolute inset-0",
            bannerUrl
              ? "bg-linear-to-r from-neutral-950/95 via-neutral-950/80 to-neutral-950/40"
              : "bg-linear-to-br from-primary-800 via-primary-950 to-neutral-950"
          )}
        />
        <div
          aria-hidden
          className="animate-blob absolute -right-32 -top-32 size-[28rem] rounded-full bg-primary-600/25 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-blob-slow absolute -bottom-40 -left-20 size-[26rem] rounded-full bg-accent-500/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <p
              className="animate-reveal text-sm font-semibold uppercase tracking-[0.18em] text-accent-400"
              style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
            >
              {settings.site_tagline}
            </p>
            <h1
              className="animate-reveal mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
              style={{ "--reveal-delay": "90ms" } as React.CSSProperties}
            >
              {settings.site_title}
            </h1>
            <p
              className="animate-reveal mt-5 max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg"
              style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
            >
              {settings.site_description}
            </p>

            <div
              className="animate-reveal mt-9 flex flex-wrap gap-3"
              style={{ "--reveal-delay": "270ms" } as React.CSSProperties}
            >
              <Link
                href="/blog"
                className="group inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-100 hover:shadow-lg hover:shadow-white/10"
              >
                <PenLine
                  className="size-4 transition-transform group-hover:-rotate-6"
                  aria-hidden
                />
                Read the blog
              </Link>
              <Link
                href="/gallery"
                className="group inline-flex h-12 items-center gap-2 rounded-lg border border-white/25 px-6 text-sm font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10"
              >
                <Camera
                  className="size-4 transition-transform group-hover:scale-110"
                  aria-hidden
                />
                Browse photos
              </Link>
              <Link
                href="/videos"
                className="group inline-flex h-12 items-center gap-2 rounded-lg border border-white/25 px-6 text-sm font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10"
              >
                <PlayCircle
                  className="size-4 transition-transform group-hover:scale-110"
                  aria-hidden
                />
                Watch videos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {!configured && !featuredPost && latestPosts.length === 0 && (
        <div className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <EmptyState
              icon={PenLine}
              title="No posts yet"
              description="Nothing has been published here yet. Check back soon."
            />
          </div>
        </div>
      )}

      {/* ---------- Featured ---------- */}
      {featuredPost && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Featured"
            title="Editor’s pick"
            action={{ href: "/blog", label: "All posts" }}
          />
          <div data-reveal>
            <PostCardFeatured post={featuredPost} />
          </div>
        </section>
      )}

      {/* ---------- Latest posts ---------- */}
      {latestPosts.length > 0 && (
        <section className="border-t border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Writing"
              title="Latest posts"
              description="Long-form writing, notes and guides."
              action={{ href: "/blog", label: "See all posts" }}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post, i) => (
                <div
                  key={post.id}
                  data-reveal
                  style={
                    { "--reveal-delay": `${i * 70}ms` } as React.CSSProperties
                  }
                >
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Gallery preview ---------- */}
      {photos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Gallery"
            title="Recent photos"
            action={{ href: "/gallery", label: "Full gallery" }}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {photos.map((photo, i) => {
              const src = publicImageUrl("gallery", photo.image_path);
              if (!src) return null;

              return (
                <Link
                  key={photo.id}
                  href="/gallery"
                  data-reveal
                  style={
                    { "--reveal-delay": `${i * 60}ms` } as React.CSSProperties
                  }
                  className="group relative block aspect-square overflow-hidden rounded-lg bg-neutral-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={photo.alt_text || photo.title || "Gallery photo"}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- Videos preview ---------- */}
      {videos.length > 0 && (
        <section className="border-t border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Videos"
              title="Latest on YouTube"
              action={{ href: "/videos", label: "All videos" }}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video, i) => (
                <div
                  key={video.id}
                  data-reveal
                  style={
                    { "--reveal-delay": `${i * 70}ms` } as React.CSSProperties
                  }
                >
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary-900 px-7 py-12 sm:flex-row sm:items-center sm:px-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Enjoying the writing?
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-primary-100 sm:text-base">
              Get in touch — questions, corrections and ideas are always welcome.
            </p>
          </div>
          <Link
            href="/contact"
            className="group inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-50"
          >
            Get in touch
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </section>

      {/* Structured data helps Google render a richer result. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: settings.site_title,
            description: settings.site_description,
            url: site.url,
            author: {
              "@type": "Person",
              name: site.author.name,
            },
          }),
        }}
      />
    </>
  );
}