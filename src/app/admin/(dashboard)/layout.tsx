import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOutAction } from "./actions";

// Admin pages read cookies for the auth check, so they must never be
// prerendered. Without this, a build with no Supabase env vars set
// would bake the redirect into a static file.
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authorization lives here rather than only in `proxy.ts`: server
  // actions POST directly and never pass through the proxy.
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-base font-bold tracking-tight text-neutral-900"
              >
                Admin
              </Link>
              <nav aria-label="Admin sections">
                <ul className="flex flex-wrap items-center gap-1">
                  {NAV.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="inline-flex rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden text-sm font-medium text-neutral-500 hover:text-neutral-900 sm:inline"
              >
                View site
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-lg border border-neutral-300 bg-white px-3.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {admin?.email && (
        <p className="mx-auto max-w-6xl px-4 pb-8 text-xs text-neutral-400 sm:px-6 lg:px-8">
          Signed in as {admin.email}
        </p>
      )}
    </div>
  );
}