import Link from "next/link";
import { Compass } from "lucide-react";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-50">
        <Compass className="size-8 text-primary-600" aria-hidden />
      </span>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">
        That page doesn&rsquo;t exist, or it may have been moved or unpublished.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg bg-primary-600 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Back to home
        </Link>
        <Link
          href="/blog"
          className="inline-flex h-11 items-center rounded-lg border border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Browse the blog
        </Link>
      </div>

      <p className="mt-12 text-sm text-neutral-500">
        Looking for something specific?{" "}
        <Link
          href="/contact"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Get in touch
        </Link>
        .
      </p>

      <span className="sr-only">{site.name}</span>
    </div>
  );
}