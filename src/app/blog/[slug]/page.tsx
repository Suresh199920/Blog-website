import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CalendarDays, Clock, Tag, User } from "lucide-react";
import { getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";
import { renderMarkdown, buildExcerpt } from "@/lib/markdown";
import { formatDate, toISODate } from "@/lib/format";
import { coverUrl, PostCardHorizontal } from "@/components/blog/PostCard";
import { Badge } from "@/components/ui/Badge";

type Params = Promise<{ slug: string }>;

// No generateStaticParams here on purpose. It runs at build time with no
// HTTP request, so the cookie-bound Supabase client throws, which made
// every post page 500. Slugs resolve on demand instead.

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  const description = post.excerpt || buildExcerpt(post.content, 160);
  const image = coverUrl(post);

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: post.tags,
    authors: post.author?.display_name ? [{ name: post.author.display_name }] : undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: post.author?.display_name ? [post.author.display_name] : undefined,
      tags: post.tags,
      images: image ? [{ url: image, alt: post.cover_alt || post.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);
  const image = coverUrl(post);

  // Markdown is sanitized in renderMarkdown() before it reaches the DOM.
  const html = renderMarkdown(post.content);

  return (
    <article>
      {/* ---------- Header ---------- */}
      <header className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-primary-600"
          >
            <ArrowLeft
              className="size-4 transition-transform group-hover:-translate-x-0.5"
              aria-hidden
            />
            All posts
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {post.is_featured && <Badge variant="accent">Featured</Badge>}
            {post.category && (
              <Link href={`/blog?category=${post.category.slug}`}>
                <Badge variant="primary">{post.category.name}</Badge>
              </Link>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
              {post.excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-neutral-200 pt-5 text-sm text-neutral-500">
            {post.author?.display_name && (
              <span className="inline-flex items-center gap-1.5">
                <User className="size-4" aria-hidden />
                {post.author.display_name}
              </span>
            )}
            {post.published_at && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                <time dateTime={toISODate(post.published_at)}>
                  {formatDate(post.published_at)}
                </time>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {post.reading_minutes} min read
            </span>
          </div>
        </div>
      </header>

      {/* ---------- Cover ---------- */}
      {image && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-2 aspect-[16/9] overflow-hidden rounded-2xl bg-neutral-100 shadow-lg">
            <Image
              src={image}
              alt={post.cover_alt || post.title}
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* ---------- Body ---------- */}
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-8">
            <Tag className="size-4 text-neutral-400" aria-hidden />
            <span className="sr-only">Tags:</span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Related ---------- */}
      {related.length > 0 && (
        <section className="border-t border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">
              Keep reading
            </h2>
            <div className="mt-6 space-y-4">
              {related.map((item) => (
                <PostCardHorizontal key={item.id} post={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Article structured data ---------- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt || buildExcerpt(post.content, 160),
            image: image ? [absoluteUrl(image)] : undefined,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            author: {
              "@type": post.author?.display_name ? "Person" : "Organization",
              name: post.author?.display_name || site.author.name,
            },
            publisher: {
              "@type": "Organization",
              name: post.author?.display_name || site.author.name,
            },
            mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
            keywords: post.tags.join(", "),
          }),
        }}
      />
    </article>
  );
}