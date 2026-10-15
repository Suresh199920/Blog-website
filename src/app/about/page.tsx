import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Youtube, Github, Linkedin, Twitter } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getPublishedPosts } from "@/lib/posts";
import { getPhotos } from "@/lib/photos";
import { getVideos } from "@/lib/videos";
import { site } from "@/lib/site";
import { renderMarkdown } from "@/lib/markdown";
import { Card, CardBody } from "@/components/ui/Card";
import { Logo } from "@/components/logo/Logo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    title: "About",
    description: `About ${settings.site_title} — who writes here and why.`,
    alternates: { canonical: "/about" },
  };
}

const SOCIALS = [
  { key: "github", label: "GitHub", href: site.author.social.github, Icon: Github },
  { key: "twitter", label: "Twitter", href: site.author.social.twitter, Icon: Twitter },
  { key: "linkedin", label: "LinkedIn", href: site.author.social.linkedin, Icon: Linkedin },
  { key: "youtube", label: "YouTube", href: site.author.social.youtube, Icon: Youtube },
] as const;

export default async function AboutPage() {
  const settings = await getSettings();

  const [{ total: postCount }, { total: photoCount }, videos] = await Promise.all([
    getPublishedPosts({ perPage: 1 }),
    getPhotos({ perPage: 1 }),
    getVideos(),
  ]);

  const socials = SOCIALS.filter((social) => social.href);
  const aboutHtml = renderMarkdown(settings.about_body);

  const stats = [
    { label: "Posts", value: postCount },
    { label: "Photos", value: photoCount },
    { label: "Videos", value: videos.length },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="text-center">
        <div className="flex justify-center">
          <Logo letter={site.author.name} size={96} className="shadow-lg" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          {site.author.name}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
          {settings.site_tagline}
        </p>

        {socials.length > 0 && (
          <div className="mt-6 flex justify-center gap-2">
            {socials.map(({ key, label, href, Icon }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex size-10 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                <Icon className="size-[18px]" aria-hidden />
              </a>
            ))}
          </div>
        )}
      </header>

      {stats.some((stat) => stat.value > 0) && (
        <dl className="mt-12 grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-6 text-center shadow-sm"
            >
              <dd className="text-3xl font-bold tracking-tight text-neutral-900">
                {stat.value}
              </dd>
              <dt className="mt-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      )}

      {aboutHtml && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            About this blog
          </h2>
          <div
            className="prose-blog mt-5"
            dangerouslySetInnerHTML={{ __html: aboutHtml }}
          />
        </section>
      )}

      <section className="mt-14 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody>
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                <Mail className="size-5 text-primary-600" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Get in touch
                </h3>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="mt-1 block truncate text-sm text-primary-600 hover:text-primary-700"
                >
                  {settings.contact_email}
                </a>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-50">
                <MapPin className="size-5 text-accent-600" aria-hidden />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Say hello
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Questions and corrections are welcome.
                </p>
                <Link
                  href="/contact"
                  className="mt-1 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Contact form →
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}