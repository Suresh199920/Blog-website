import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getAdminCategories } from "@/lib/admin-queries";
import { PostEditor } from "../PostEditor";

export const metadata: Metadata = {
  title: "New post",
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  await requireAdmin();

  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          New post
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Write in Markdown. Save as a draft, or publish straight away.
        </p>
      </header>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <PostEditor post={null} categories={categories} />
      </div>
    </div>
  );
}