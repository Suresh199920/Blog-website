/**
 * Static site identity. Anything an admin can change lives in the
 * `settings` table instead (see `getSettings`).
 */
export const site = {
  name: "The Blog",
  shortName: "Blog",
  description:
    "A personal blog with a photo gallery and a YouTube video library.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  locale: "en_US",
  author: {
    name: "Suresh_official",
    email: "hello@example.com",
    bio: "Writer, photographer and occasional film-maker.",
    social: {
      github: "",
      twitter: "",
      linkedin: "",
      youtube: "",
    },
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/gallery", label: "Gallery" },
    { href: "/videos", label: "Videos" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  postsPerPage: 9,
  photosPerPage: 24,
} as const;

export type NavItem = (typeof site.nav)[number];

/** Absolute URL for metadata, sitemap entries and OG tags. */
export function absoluteUrl(path: string = "/"): string {
  const base = site.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
