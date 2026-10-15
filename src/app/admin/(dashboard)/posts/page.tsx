import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminPosts } from "@/lib/admin-queries";
import { publicImageUrl, BUCKETS } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Posts",
  robots: { index: false, follow: false },
};

export default async function AdminPostsPage() {
  await requireAdmin();

  const posts = await getAdminPosts();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Posts
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {posts.length} {posts.length === 1 ? "post" : "posts"} total.
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          <Plus className="size-4" aria-hidden />
          New post
        </Link>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center text-sm text-neutral-500">
          No posts yet. Create your first one to get started.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-5 py-3 text-left font-medium text-neutral-600">
                  Title
                </th>
                <th scope="col" className="px-5 py-3 text-left font-medium text-neutral-600">
                  Status
                </th>
                <th scope="col" className="hidden px-5 py-3 text-left font-medium text-neutral-600 sm:table-cell">
                  Category
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium text-neutral-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {posts.map((post) => {
                // `cover_image` is a storage path, not a URL. Normalise it
                // before handing it to next/image.
                const cover = publicImageUrl(
                  BUCKETS.postCovers,
                  post.cover_image ?? ""
                );

                return (
                <tr key={post.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        {cover && (
                          <Image
                            src={cover}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="font-medium text-neutral-900 hover:text-primary-700"
                        >
                          {post.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          /blog/{post.slug} · {post.reading_minutes} min read
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        post.status === "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {post.status}
                    </span>
                    {post.is_featured && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                        featured
                      </span>
                    )}
                  </td>
                  <td className="hidden px-5 py-4 text-neutral-600 sm:table-cell">
                    {post.category?.name ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      {post.status === "published" && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-neutral-600 hover:text-neutral-900"
                        >
                          View
                        </a>
                      )}
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}