import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { VideoEditor } from "../VideoEditor";

export const metadata: Metadata = {
  title: "New video",
  robots: { index: false, follow: false },
};

export default async function NewVideoPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          New video
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Paste a YouTube link and the details are filled in for you.
        </p>
      </header>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <VideoEditor video={null} />
      </div>
    </div>
  );
}