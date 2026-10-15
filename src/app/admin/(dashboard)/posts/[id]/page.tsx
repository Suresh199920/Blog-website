import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminPostById, getAdminCategories } from "@/lib/admin-queries";
import { isUuid } from "@/lib/validate";
import { PostEditor } from "../PostEditor";

export const metadata: Metadata = {
  title: "Edit post",
  robots: { index: false, follow: false },
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  if (!isUuid(id)) notFound();

  const [post, categories] = await Promise.all([
    getAdminPostById(id),
    getAdminCategories(),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Edit post
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          /blog/{post.slug}
        </p>
      </header>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <PostEditor post={post} categories={categories} />
      </div>
    </div>
  );
}