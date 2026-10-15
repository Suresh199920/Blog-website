import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate, toISODate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PostWithRelations } from "@/lib/posts";

/**
 * `cover_image` holds a Supabase *storage path* (or a full URL if it
 * was pasted in), so it is normalised to an absolute URL here.
 */
function coverUrl(post: PostWithRelations): string | null {
  const value = post.cover_image;
  if (!value) return null;
  if (value.startsWith("http")) return value;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  return `${base.replace(/\/$/, "")}/storage/v1/object/public/post-covers/${value.replace(
    /^\/+/,
    ""
  )}`;
}

function PostCover({
  post,
  priority = false,
  sizes,
  className,
}: {
  post: PostWithRelations;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  const url = coverUrl(post);

  if (!url) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-linear-to-br from-primary-100 via-primary-50 to-accent-100",
          className
        )}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          className="size-10 text-primary-300"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={post.cover_alt || post.title}
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover"
    />
  );
}

export function PostMeta({ post }: { post: PostWithRelations }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
      {post.published_at && (
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" aria-hidden />
          <time dateTime={toISODate(post.published_at)}>
            {formatDate(post.published_at)}
          </time>
        </span>
      )}
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-3.5" aria-hidden />
        {post.reading_minutes} min read
      </span>
    </div>
  );
}

export function PostCard({
  post,
  priority = false,
}: {
  post: PostWithRelations;
  priority?: boolean;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-neutral-100"
        tabIndex={-1}
        aria-hidden
      >
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
          <PostCover
            post={post}
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="size-full"
          />
        </div>
        {post.is_featured && (
          <span className="absolute left-3 top-3">
            <Badge variant="accent">Featured</Badge>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {post.category && (
          <Link
            href={`/blog?category=${post.category.slug}`}
            className="mb-2 w-fit text-xs font-semibold uppercase tracking-wide text-primary-600 hover:text-primary-700"
          >
            {post.category.name}
          </Link>
        )}

        <h3 className="text-lg font-bold leading-snug tracking-tight text-neutral-900">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-primary-700"
          >
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-600">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto pt-4">
          <PostMeta post={post} />
        </div>
      </div>
    </article>
  );
}

export function PostCardHorizontal({ post }: { post: PostWithRelations }) {
  return (
    <article className="group flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md sm:gap-5">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block size-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:size-32"
        tabIndex={-1}
        aria-hidden
      >
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
          <PostCover
            post={post}
            sizes="128px"
            className="size-full"
          />
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        {post.category && (
          <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            {post.category.name}
          </span>
        )}
        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug tracking-tight text-neutral-900 sm:text-lg">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-primary-700"
          >
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-sm text-neutral-600">
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto pt-2.5">
          <PostMeta post={post} />
        </div>
      </div>
    </article>
  );
}

export function PostCardFeatured({ post }: { post: PostWithRelations }) {
  return (
    <article className="group relative flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-2xl bg-neutral-900">
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
        <PostCover
          post={post}
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="size-full"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/55 to-transparent"
      />

      <div className="relative p-6 sm:p-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {post.is_featured && <Badge variant="accent">Featured</Badge>}
          {post.category && <Badge variant="primary">{post.category.name}</Badge>}
        </div>
        <h3 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-neutral-200 sm:text-base">
            {post.excerpt}
          </p>
        )}
        <div className="mt-5 [&_span]:text-neutral-300 [&_time]:text-neutral-300">
          <PostMeta post={post} />
        </div>
      </div>
    </article>
  );
}

export { PostCover, coverUrl };
