"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Youtube } from "lucide-react";
import { saveVideo, deleteVideoAction, type ActionState } from "../actions";
import type { Video } from "@/types/database";

const initialState: ActionState = {};

const inputClass =
  "mt-1.5 block h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

const textareaClass =
  "mt-1.5 block w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

function Alert({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"
      >
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
        {state.success}
      </p>
    );
  }
  return null;
}

export function VideoEditor({ video }: { video: Video | null }) {
  const [state, action] = useActionState(saveVideo, initialState);
  const [delState, delAction] = useActionState(deleteVideoAction, initialState);

  return (
    <form action={action} className="space-y-6">
      {video && <input type="hidden" name="id" value={video.id} />}

      <Alert state={state} />
      <Alert state={delState} />

      <div>
        <label htmlFor="youtube_url" className="block text-sm font-medium text-neutral-700">
          YouTube link
        </label>
        <input
          id="youtube_url"
          name="youtube_url"
          required
          defaultValue={video?.youtube_url ?? ""}
          placeholder="https://www.youtube.com/watch?v=..."
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-neutral-500">
          Paste any YouTube link — watch, short, embed or youtu.be all work.
        </p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={video?.title ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={video?.description ?? ""}
          className={textareaClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-neutral-700">
            Category
          </label>
          <input
            id="category"
            name="category"
            defaultValue={video?.category ?? ""}
            placeholder="e.g. Tutorial"
            className={inputClass}
          />
        </div>

        <label className="mt-7 flex items-center gap-2.5 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={video?.is_featured ?? false}
            className="size-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          Feature this video
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-6">
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
        >
          <Youtube className="size-4" aria-hidden />
          {video ? "Save changes" : "Add video"}
        </button>

        <Link
          href="/admin/videos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to videos
        </Link>

        {video && (
          <button
            type="submit"
            formAction={delAction}
            className="ml-auto inline-flex h-10 items-center rounded-lg border border-red-200 px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            Remove video
          </button>
        )}
      </div>
    </form>
  );
}