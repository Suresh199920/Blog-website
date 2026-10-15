import Link from "next/link";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import { Logo } from "@/components/logo/Logo";
import { site } from "@/lib/site";
import type { SiteSettings } from "@/lib/settings";

const SOCIAL_ICONS = [
  { key: "github", label: "GitHub", Icon: Github },
  { key: "twitter", label: "Twitter", Icon: Twitter },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "youtube", label: "YouTube", Icon: Youtube },
] as const;

/** Link groups, split so the columns balance instead of one long list. */
const COLUMNS = [
  {
    heading: "Read",
    links: site.nav.filter((item) =>
      ["/blog", "/gallery", "/videos"].includes(item.href)
    ),
  },
  {
    heading: "Site",
    links: [
      ...site.nav.filter((item) => ["/about", "/contact"].includes(item.href)),
      { href: "/sitemap.xml", label: "Sitemap" },
    ],
  },
] as const;

export function Footer({
  nav: _nav,
  settings,
}: {
  nav: readonly { href: string; label: string }[];
  settings: SiteSettings;
}) {
  const year = new Date().getFullYear();
  const socials = SOCIAL_ICONS.filter(
    ({ key }) => site.author.social[key as keyof typeof site.author.social]
  );

  return (
    <footer className="relative mt-24 overflow-hidden bg-neutral-950 text-neutral-300">
      {/* Decorative glows, mirroring the hero so the page opens and
          closes with the same visual language. */}
      <div
        aria-hidden
        className="animate-blob-slow pointer-events-none absolute -left-24 -bottom-32 size-[26rem] rounded-full bg-primary-700/20 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-blob pointer-events-none absolute -right-20 -top-24 size-[22rem] rounded-full bg-accent-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* ---------- top: brand + link columns ---------- */}
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5"
            >
              <Logo
                letter={settings.site_title}
                className="shrink-0 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-lg font-bold tracking-tight text-white">
                {settings.site_title}
              </span>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              {settings.site_description}
            </p>

            {socials.length > 0 && (
              <ul className="mt-6 flex items-center gap-2">
                {socials.map(({ key, label, Icon }) => (
                  <li key={key}>
                    <a
                      href={site.author.social[key as keyof typeof site.author.social]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 text-neutral-400 transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/5 hover:text-white"
                    >
                      <Icon className="size-4" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {column.heading}
              </h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Get in touch
            </h2>
            {settings.contact_email ? (
              <a
                href={`mailto:${settings.contact_email}`}
                className="group mt-4 inline-flex items-center gap-1 text-sm font-medium text-white transition-colors hover:text-accent-400"
              >
                {settings.contact_email}
                <ArrowUpRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </a>
            ) : (
              <p className="mt-4 text-sm text-neutral-500">
                No contact email set yet.
              </p>
            )}

            <Link
              href="/contact"
              className="group mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-100 hover:shadow-lg hover:shadow-white/10"
            >
              Send a message
            </Link>
          </div>
        </div>

        {/* ---------- bottom bar ---------- */}
        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/10 pt-7 sm:flex-row sm:items-center">
          <p className="text-xs leading-relaxed text-neutral-500">
            &copy; {year} {settings.site_title}. All rights reserved.
          </p>

          <Link
            href="#main"
            className="group inline-flex items-center gap-2 text-xs font-medium text-neutral-400 transition-colors hover:text-white"
          >
            Back to top
            <span
              aria-hidden
              className="inline-flex size-7 items-center justify-center rounded-full border border-white/10 transition-transform group-hover:-translate-y-0.5 group-hover:border-white/30"
            >
              <ArrowUpRight className="size-3.5 -rotate-45" />
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

/**
 * Internal links get a sliding marker; the sitemap is a real file, so it
 * has to be a plain anchor or Next's client router will try to RSC it.
 */
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const className =
    "group inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-white";

  if (href.endsWith(".xml")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      <span className="bg-linear-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent transition-opacity group-hover:opacity-80">
        {children}
      </span>
    </Link>
  );
}