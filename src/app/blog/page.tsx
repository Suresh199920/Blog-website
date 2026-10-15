import Link from "next/link";
import type { Metadata } from "next";
import { FileText, SearchX } from "lucide-react";
import {
  getAllTags,
  getCategoriesWithCounts,
  getPublishedPosts,
} from "@/lib/posts";
import { site } from "@/lib/site";
import { PostCard } from "@/components/blog/PostCard";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchForm } from "@/components/blog/SearchForm";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "All posts — long-form writing, notes and guides, newest first.",
  alternates: { canonical: "/blog" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Query params arrive as string | string[]; we only ever want one value. */
function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

function toPage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const page = toPage(first(params.page));
  const category = first(params.category);
  const tag = first(params.tag);
  const query = first(params.q);

  const [{ posts, total, totalPages }, categories, tags] = await Promise.all([
    getPublishedPosts({
      page,
      perPage: site.postsPerPage,
      categorySlug: category,
      tag,
      query,
    }),
    getCategoriesWithCounts(),
    getAllTags(),
  ]);

  const activeCategory = categories.find((item) => item.slug === category);
  const hasFilters = Boolean(category || tag || query);

  const heading = query
    ? `Results for “${query}”`
    : tag
      ? `Posts tagged “${tag}”`
      : activeCategory
        ? activeCategory.name
        : "All posts";

  const listParams = { category, tag, q: query };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          {heading}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {total} {total === 1 ? "post" : "posts"}
          {totalPages > 1 && ` · page ${page} of ${totalPages}`}
        </p>
      </header>

      <SearchForm
        defaultValue={query ?? ""}
        category={category ?? ""}
        tag={tag ?? ""}
      />

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-10">
        {/* ---------- Sidebar ---------- */}
        <aside className="shrink-0 lg:w-60">
          <nav aria-label="Categories">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Categories
            </h2>
            <ul className="mt-3 space-y-1">
              <li>
                <CategoryLink href="/blog" active={!category} label="All posts" />
              </li>
              {categories.map((item) => (
                <li key={item.id}>
                  <CategoryLink
                    href={`/blog?category=${item.slug}`}
                    active={category === item.slug}
                    label={item.name}
                    count={item.post_count}
                  />
                </li>
              ))}
            </ul>
          </nav>

          {tags.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Tags
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {tags.map((item) => (
                  <li key={item}>
                    <Link
                      href={`/blog?tag=${encodeURIComponent(item)}`}
                      className={cn(
                        "inline-flex rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        tag === item
                          ? "bg-primary-600 text-white"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      )}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* ---------- Results ---------- */}
        <div className="min-w-0 flex-1">
          {posts.length === 0 ? (
            <EmptyState
              icon={hasFilters ? SearchX : FileText}
              title={hasFilters ? "No matching posts" : "No posts published yet"}
              description={
                hasFilters
                  ? "Try a different search term, or clear the filters to see everything."
                  : "Nothing has been published here yet. Check back soon."
              }
              action={
                hasFilters ? (
                  <Link
                    href="/blog"
                    className="inline-flex h-11 items-center rounded-lg bg-primary-600 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                  >
                    Clear filters
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                pathname="/blog"
                params={listParams}
                className="mt-12"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary-50 text-primary-700"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      )}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "text-xs tabular-nums",
            active ? "text-primary-500" : "text-neutral-400"
          )}
        >
          {count}
        </span>
      )}
    </Link>
  );
}