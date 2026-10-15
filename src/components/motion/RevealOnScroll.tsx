"use client";

import { useEffect } from "react";

/**
 * Marks `[data-reveal]` elements as visible when they scroll into view.
 *
 * Runs once on mount and again whenever `deps` change, so content that
 * arrives after a client-side navigation still gets observed. Elements
 * already on screen are revealed immediately, so nothing stays invisible
 * if the observer never fires. CSS owns the actual transition.
 */
export function RevealOnScroll({ deps }: { deps?: unknown }) {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const targets = document.querySelectorAll<HTMLElement>(
      "[data-reveal]:not([data-revealed])"
    );

    if (reduced || !("IntersectionObserver" in window)) {
      for (const el of targets) el.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        }
      },
      // Trigger slightly before the element reaches the viewport edge so
      // the animation is already underway by the time it's noticed.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 }
    );

    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, [deps]);

  return null;
}