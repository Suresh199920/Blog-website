"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type LightboxPhoto = {
  id: string;
  src: string;
  thumb: string;
  alt: string;
  caption: string | null;
  album: string | null;
};

/**
 * Responsive photo grid with a keyboard-navigable lightbox.
 *
 * Uses native <dialog> so the browser handles the top layer, focus
 * trap and Escape handling for free — no portal, no extra library.
 */
export function PhotoGrid({
  photos,
  className,
}: {
  photos: LightboxPhoto[];
  className?: string;
}) {
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const previous = useCallback(
    () => setIndex((current) => (current === null ? null : (current - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setIndex((current) => (current === null ? null : (current + 1) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (index === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };

    document.addEventListener("keydown", onKeyDown);
    // Stop the page behind the lightbox from scrolling.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, close, previous, next]);

  if (photos.length === 0) return null;

  const active = index === null ? null : photos[index];

  return (
    <>
      <ul
        className={cn(
          "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4",
          className
        )}
      >
        {photos.map((photo, position) => (
          <li
            key={photo.id}
            data-reveal
            style={
              { "--reveal-delay": `${(position % 4) * 60}ms` } as React.CSSProperties
            }
          >
            <button
              type="button"
              onClick={() => setIndex(position)}
              aria-label={photo.alt || photo.caption || "View photo"}
              className="group relative block aspect-square w-full overflow-hidden rounded-lg bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              <Image
                src={photo.thumb}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {(photo.caption || photo.album) && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 bg-linear-to-t from-neutral-950/80 to-transparent p-3 pt-8 text-left opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {photo.album && (
                    <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-accent-300">
                      {photo.album}
                    </span>
                  )}
                  {photo.caption && (
                    <span className="mt-0.5 line-clamp-1 block text-xs text-white">
                      {photo.caption}
                    </span>
                  )}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <dialog
          open
          onClose={close}
          aria-label={active.alt || "Photo viewer"}
          className="m-0 h-full max-h-none w-full max-w-none bg-neutral-950/95 p-0 backdrop:bg-neutral-950/95"
        >
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-4 p-4 sm:p-6">
              <div className="min-w-0 text-neutral-200">
                {active.album && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent-400">
                    {active.album}
                  </p>
                )}
                {active.caption && (
                  <p className="mt-0.5 truncate text-sm text-neutral-300">
                    {active.caption}
                  </p>
                )}
                <p className="mt-1 font-mono text-xs text-neutral-500">
                  {(index ?? 0) + 1} / {photos.length}
                </p>
              </div>

              <button
                type="button"
                onClick={close}
                aria-label="Close photo viewer"
                autoFocus
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={previous}
                  aria-label="Previous photo"
                  className="absolute left-2 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                </button>
              )}

              <div className="relative h-full w-full">
                <Image
                  key={active.id}
                  src={active.src}
                  alt={active.alt}
                  fill
                  sizes="100vw"
                  priority
                  className="object-contain"
                />
              </div>

              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next photo"
                  className="absolute right-2 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4"
                >
                  <ChevronRight className="size-6" aria-hidden />
                </button>
              )}
            </div>

            {photos.length > 1 && (
              <div className="flex justify-center gap-1.5 overflow-x-auto p-4 sm:p-6">
                {photos.map((photo, position) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setIndex(position)}
                    aria-label={`Go to photo ${position + 1}`}
                    aria-current={position === index ? "true" : undefined}
                    className={cn(
                      "size-2 shrink-0 rounded-full transition-all",
                      position === index
                        ? "w-6 bg-white"
                        : "bg-white/30 hover:bg-white/60"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </dialog>
      )}
    </>
  );
}