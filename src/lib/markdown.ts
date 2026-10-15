import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/**
 * Markdown is authored in the admin panel and rendered to HTML on the
 * server. Because that HTML is injected into the page, it MUST be
 * sanitized before it ships — a compromised admin session (or an
 * over-trusting paste) could otherwise smuggle a <script> into every
 * visitor's browser.
 *
 * The allowlist below is deliberately narrow: standard prose tags,
 * plus tables and code, plus `iframe` limited to YouTube hosts so a
 * post can embed its own video.
 */

const YOUTUBE_EMBED_HOSTS = [
  "www.youtube-nocookie.com",
  "www.youtube.com",
  "youtube.com",
  "youtube-nocookie.com",
];

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "br",
    "hr",
    "strong",
    "em",
    "del",
    "blockquote",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "code",
    "pre",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "iframe",
    "sup",
    "sub",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    code: ["class"],
    iframe: [
      "src",
      "width",
      "height",
      "title",
      "frameborder",
      "allow",
      "allowfullscreen",
      "loading",
    ],
    th: ["align"],
    td: ["align"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
  },
  allowedIframeHostnames: YOUTUBE_EMBED_HOSTS,
  // Anything not on the list is dropped rather than escaped.
  disallowedTagsMode: "discard",
  transformTags: {
    // Force external links to open safely in a new tab.
    a: sanitizeHtml.simpleTransform("a", {
      target: "_blank",
      rel: "noopener noreferrer",
    }),
    // Lazy-load images so long posts don't stall the main thread.
    img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }),
  },
};

marked.setOptions({
  gfm: true,
  breaks: false,
});

/** Render Markdown to sanitized HTML. Safe to inject with `dangerouslySetInnerHTML`. */
export function renderMarkdown(markdown: string): string {
  if (!markdown?.trim()) return "";

  const html = marked.parse(markdown, { async: false }) as string;

  return sanitizeHtml(html, sanitizeOptions);
}

/**
 * Plain-text version of the Markdown, for excerpts and meta
 * descriptions. Strips fenced code, images, and every tag.
 */
export function stripMarkdown(markdown: string): string {
  if (!markdown) return "";

  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** First `maxLength` characters of the post body, cut on a word boundary. */
export function buildExcerpt(markdown: string, maxLength = 180): string {
  const text = stripMarkdown(markdown);
  if (text.length <= maxLength) return text;

  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");

  return `${(lastSpace > 80 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

/**
 * Minutes to read, at ~220 words per minute, never below 1.
 * Computed from the post so it stays correct as the text is edited.
 */
export function estimateReadingMinutes(markdown: string): number {
  const words = stripMarkdown(markdown).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** URL-safe slug. Falls back to `post` if the title has no word characters. */
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['"’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "post";
}

/** `["a","b"]` or `"a, b"` -> `["a","b"]` */
export function parseTags(input: string | string[] | null | undefined): string[] {
  if (!input) return [];

  const raw = Array.isArray(input) ? input : input.split(",");

  return [
    ...new Set(
      raw
        .flatMap((tag) => tag.split(","))
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    ),
  ].slice(0, 12);
}