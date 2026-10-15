"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import {
  savePhoto,
  saveAlbum,
  deletePhotoAction,
  type ActionState,
} from "../actions";
import type { Photo } from "@/types/database";

const initialState: ActionState = {};

type AlbumOption = { id: string; name: string };

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

export function PhotoEditor({
  photo,
  albums,
}: {
  photo: Photo | null;
  albums: AlbumOption[];
}) {
  const [state, action] = useActionState(savePhoto, initialState);
  const [delState, delAction] = useActionState(deletePhotoAction, initialState);

  return (
    <form action={action} className="space-y-6">
      {photo && <input type="hidden" name="id" value={photo.id} />}

      <Alert state={state} />
      <Alert state={delState} />

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Image file
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          required={!photo}
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="mt-1.5 block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
        />
        <p className="mt-1.5 text-xs text-neutral-500">
          {photo
            ? "Optional. Uploading a new file replaces the current image."
            : "JPG, PNG, WebP, GIF or AVIF. Max 10 MB."}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={photo?.title ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="album_id" className="block text-sm font-medium text-neutral-700">
            Album
          </label>
          <select
            id="album_id"
            name="album_id"
            defaultValue={photo?.album_id ?? ""}
            className={inputClass}
          >
            <option value="">No album</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="caption" className="block text-sm font-medium text-neutral-700">
          Caption
        </label>
        <textarea
          id="caption"
          name="caption"
          rows={3}
          defaultValue={photo?.caption ?? ""}
          className={textareaClass}
        />
      </div>

      <div>
        <label htmlFor="alt_text" className="block text-sm font-medium text-neutral-700">
          Alt text
        </label>
        <input
          id="alt_text"
          name="alt_text"
          defaultValue={photo?.alt_text ?? ""}
          placeholder="Describe the photo for screen readers"
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-6">
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
        >
          <Upload className="size-4" aria-hidden />
          {photo ? "Save changes" : "Upload photo"}
        </button>

        <Link
          href="/admin/photos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to photos
        </Link>

        {photo && (
          <button
            type="submit"
            formAction={delAction}
            className="ml-auto inline-flex h-10 items-center rounded-lg border border-red-200 px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            Delete photo
          </button>
        )}
      </div>
    </form>
  );
}

export function AlbumEditor() {
  const [state, action] = useActionState(saveAlbum, initialState);

  return (
    <form action={action} className="space-y-5">
      <Alert state={state} />

      <div>
        <label htmlFor="album_name" className="block text-sm font-medium text-neutral-700">
          Album name
        </label>
        <input
          id="album_name"
          name="name"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="album_description"
          className="block text-sm font-medium text-neutral-700"
        >
          Description
        </label>
        <textarea
          id="album_description"
          name="description"
          rows={2}
          className={textareaClass}
        />
      </div>

      <button
        type="submit"
        className="inline-flex h-10 items-center rounded-lg bg-primary-600 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        Create album
      </button>
    </form>
  );
}