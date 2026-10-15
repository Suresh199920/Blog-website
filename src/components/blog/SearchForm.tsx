"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

/**
 * Search + filter form that updates the URL as a plain GET form.
 *
 * Submitting normally would reload the page; intercepting it keeps the
 * navigation client-side. When the URL changes (back button, clicking
 * a category link) the input resets to match, so the two never drift.
 */
export function SearchForm({
  defaultValue,
  category,
  tag,
}: {
  defaultValue: string;
  category: string;
  tag: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = searchParams.get("q") ?? defaultValue;
    }
  }, [searchParams, defaultValue]);

  // The header's search button deep-links to ?focus=search.
  useEffect(() => {
    if (searchParams.get("focus") === "search") {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [searchParams]);

  const update = (next: { q?: string; category?: string; tag?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(next)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    // Any filter change invalidates the current page number.
    params.delete("focus");
    params.delete("page");

    const query = params.toString();
    router.push(query ? `/blog?${query}` : "/blog");
  };

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        update({ q: inputRef.current?.value.trim() ?? "" });
      }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <div className="relative flex-1">
        <label htmlFor="blog-search" className="sr-only">
          Search posts
        </label>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
        />
        <input
          ref={inputRef}
          id="blog-search"
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search posts by title or content…"
          className="h-11 w-full rounded-lg border border-neutral-300 bg-white pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </div>

      {category && <input type="hidden" name="category" value={category} />}
      {tag && <input type="hidden" name="tag" value={tag} />}

      <div className="flex gap-2">
        <button
          type="submit"
          className="h-11 shrink-0 rounded-lg bg-primary-600 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Search
        </button>
        {(defaultValue || category || tag) && (
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              router.push("/blog");
            }}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            aria-label="Clear search and filters"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </form>
  );
}