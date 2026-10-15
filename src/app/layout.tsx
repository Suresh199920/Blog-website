import "./globals.css";
import { site } from "@/lib/site";
import { getSettings } from "@/lib/settings";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Without JS the reveal observer never runs, so un-hide anything
            marked for it. Keeps content reachable in that case. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <Header nav={site.nav} brand={settings.site_title} />

        <main id="main" className="flex-1 pt-16">
          {children}
        </main>

        <Footer nav={site.nav} settings={settings} />

        {/* Scroll-triggered entrance animations for `[data-reveal]`. */}
        <RevealOnScroll />

        {!isSupabaseConfigured && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-accent-300 bg-accent-50 px-4 py-3 text-sm text-accent-900">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2">
              <TriangleAlert className="size-4 shrink-0" aria-hidden />
              <span>
                <strong>Sample content.</strong> You&rsquo;re seeing
                placeholder posts, photos and videos because this site has no
                database yet. Add{" "}
                <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{" "}
                and{" "}
                <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>{" "}
                to <code className="font-mono text-xs">.env.local</code>, run{" "}
                <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">
                  supabase/migrations/001_initial_schema.sql
                </code>{" "}
                in Supabase, and your own content replaces this.{" "}
                <Link href="/admin/login" className="font-semibold underline">
                  Admin login
                </Link>
              </span>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
