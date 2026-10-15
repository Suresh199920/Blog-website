import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Builds `/blog?page=2&category=tech` while dropping the default page
 * number and any empty values, so page 1 is always the clean `/blog`.
 */
export function buildPageHref(
  pathname: string,
  page: number,
  params: Record<string, string | undefined> = {}
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function Pagination({
  page,
  totalPages,
  pathname,
  params = {},
  className,
}: {
  page: number;
  totalPages: number;
  pathname: string;
  params?: Record<string, string | undefined>;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const window = 2;
  const pages: (number | "gap")[] = [];

  for (let index = 1; index <= totalPages; index += 1) {
    const isEdge = index === 1 || index === totalPages;
    const isNear = Math.abs(index - page) <= window;

    if (isEdge || isNear) {
      pages.push(index);
    } else if (pages[pages.length - 1] !== "gap") {
      pages.push("gap");
    }
  }

  const linkClass =
    "inline-flex size-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      {page > 1 ? (
        <Link
          href={buildPageHref(pathname, page - 1, params)}
          rel="prev"
          aria-label="Previous page"
          className={cn(linkClass, "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50")}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
      ) : (
        <span
          aria-hidden
          className={cn(linkClass, "cursor-not-allowed border-neutral-200 text-neutral-300")}
        >
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pages.map((entry, index) =>
        entry === "gap" ? (
          <span
            key={`gap-${index}`}
            aria-hidden
            className="px-1 text-sm text-neutral-400"
          >
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={buildPageHref(pathname, entry, params)}
            aria-current={entry === page ? "page" : undefined}
            className={cn(
              linkClass,
              entry === page
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
            )}
          >
            {entry}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          href={buildPageHref(pathname, page + 1, params)}
          rel="next"
          aria-label="Next page"
          className={cn(linkClass, "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50")}
        >
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span
          aria-hidden
          className={cn(linkClass, "cursor-not-allowed border-neutral-200 text-neutral-300")}
        >
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
