import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOutAction } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboard() {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary-600">
            Admin area
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Welcome back{admin?.displayName ? `, ${admin.displayName}` : ""}.
          </p>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/posts"
          className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-colors hover:border-primary-300"
        >
          <h2 className="text-base font-semibold text-neutral-900">
            Posts
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Write, edit and publish blog posts.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-primary-600 group-hover:text-primary-700">
            Manage posts →
          </span>
        </Link>

        <Link
          href="/admin/photos"
          className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-colors hover:border-primary-300"
        >
          <h2 className="text-base font-semibold text-neutral-900">
            Photos
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Upload images and organise albums.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-primary-600 group-hover:text-primary-700">
            Manage gallery →
          </span>
        </Link>

        <Link
          href="/admin/videos"
          className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-colors hover:border-primary-300"
        >
          <h2 className="text-base font-semibold text-neutral-900">
            Videos
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Add YouTube videos by pasting a link.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-primary-600 group-hover:text-primary-700">
            Manage videos →
          </span>
        </Link>

        <Link
          href="/admin/settings"
          className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-colors hover:border-primary-300"
        >
          <h2 className="text-base font-semibold text-neutral-900">
            Settings
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Update site title, tagline and about text.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-primary-600 group-hover:text-primary-700">
            Manage settings →
          </span>
        </Link>

        <Link
          href="/admin/messages"
          className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-colors hover:border-primary-300"
        >
          <h2 className="text-base font-semibold text-neutral-900">
            Messages
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Read contact form submissions.
          </p>
          <span className="mt-3 inline-block text-sm font-medium text-primary-600 group-hover:text-primary-700">
            Manage messages →
          </span>
        </Link>
      </div>
    </div>
  );
}