"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, ImageIcon } from "lucide-react";
import {
  deletePostAction,
  savePost,
  type ActionState,
} from "../actions";
import type { Post } from "@/types/database";

const initialState: ActionState = {};

type CategoryOption = { id: string; name: string };

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

const inputClass =
  "mt-1.5 block h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

const textareaClass =
  "mt-1.5 block w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

export function PostEditor({
  post,
  categories,
}: {
  post: Post | null;
  categories: CategoryOption[];
}) {
  const [state, action] = useActionState(savePost, initialState);
  const [delState, delAction] = useActionState(deletePostAction, initialState);

  return (
    <form action={action} className="space-y-6">
      {post && <input type="hidden" name="id" value={post.id} />}
      {post?.cover_image && (
        <input type="hidden" name="existing_cover" value={post.cover_image} />
      )}

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
          {state.success}
        </p>
      )}
      {delState.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"
        >
          {delState.error}
        </p>
      )}

      <Field label="Title">
        <input
          id="title"
          name="title"
          required
          defaultValue={post?.title ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Slug" hint="Leave blank to generate it from the title.">
          <input
            id="slug"
            name="slug"
            defaultValue={post?.slug ?? ""}
            placeholder="generated-from-title"
            className={inputClass}
          />
        </Field>

        <Field label="Category">
          <select
            id="category_id"
            name="category_id"
            defaultValue={post?.category_id ?? ""}
            className={inputClass}
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Excerpt" hint="Shown on the blog index and in link previews.">
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt ?? ""}
          className={textareaClass}
        />
      </Field>

      <Field label="Content" hint="Markdown is supported.">
        <textarea
          id="content"
          name="content"
          rows={20}
          required
          defaultValue={post?.content ?? ""}
          className={`${textareaClass} font-mono`}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tags" hint="Comma separated, e.g. nextjs, react, supabase">
          <input
            id="tags"
            name="tags"
            defaultValue={post?.tags?.join(", ") ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Status">
          <select
            id="status"
            name="status"
            defaultValue={post?.status ?? "draft"}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Cover image"
          hint="JPG, PNG, WebP, GIF or AVIF. Max 10 MB."
        >
          <input
            id="cover"
            name="cover"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="mt-1.5 block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-200"
          />
          {post?.cover_image && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-500">
              <ImageIcon className="size-3.5" aria-hidden />
              A cover is already set. Uploading a new one replaces it.
            </p>
          )}
        </Field>

        <Field
          label="Cover alt text"
          hint="Describe the image for screen readers."
        >
          <input
            id="cover_alt"
            name="cover_alt"
            defaultValue={post?.cover_alt ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="is_featured"
          defaultChecked={post?.is_featured ?? false}
          className="size-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
        />
        Feature on the homepage
      </label>

      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-6">
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-lg bg-primary-600 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
        >
          {post ? "Save changes" : "Create post"}
        </button>

        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to posts
        </Link>

        {post && (
          <button
            type="submit"
            formAction={delAction}
            formNoValidate
            className="ml-auto inline-flex h-10 items-center rounded-lg border border-red-200 px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            Delete post
          </button>
        )}
      </div>
    </form>
  );
}