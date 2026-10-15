/**
 * Supabase Storage helpers.
 *
 * Upload flow: push the file to a bucket, store the *path* in the
 * database, and build the public URL on the way out. Storing the URL
 * instead would bake the project hostname into your rows and break if
 * you ever move projects.
 */
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const BUCKETS = {
  postCovers: "post-covers",
  gallery: "gallery",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export function isAllowedImageType(type: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(type);
}

/** Public CDN URL for an object path inside a public bucket. */
export function publicImageUrl(
  bucket: BucketName,
  path: string
): string | null {
  if (!path) return null;

  // Already absolute (a pasted external URL), so use it untouched.
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${path}`;
}

/** Strip the bucket prefix so both full URLs and bare paths normalise. */
export function toStoragePath(
  value: string | null | undefined,
  bucket: BucketName
): string | null {
  if (!value) return null;

  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = value.indexOf(marker);
  if (index !== -1) return value.slice(index + marker.length);

  // A bare path with no scheme is already a storage path.
  if (!value.startsWith("http") && !value.startsWith("//")) {
    return value.replace(/^\/+/, "");
  }

  return null;
}

/** Collision-resistant, readable object name. */
function buildObjectName(file: File): string {
  const extension = (file.name.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 5);

  const base = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);

  return `${base || "image"}-${stamp}-${random}.${extension || "jpg"}`;
}

export type UploadResult = {
  path: string;
  url: string;
  width: number | null;
  height: number | null;
};

export class UploadError extends Error {}

/**
 * Upload an image and return its storage path plus intrinsic size.
 *
 * Width/height are read client-side before this runs and passed in,
 * because the browser is the only place that can cheaply decode an
 * image header — Postgres has no image-size function available here.
 */
export async function uploadImage(
  bucket: BucketName,
  file: File,
  dimensions?: { width: number; height: number } | null
): Promise<UploadResult> {
  if (!isSupabaseConfigured) {
    throw new UploadError(
      "Supabase is not configured. Add your keys to .env.local first."
    );
  }

  if (!isAllowedImageType(file.type)) {
    throw new UploadError(
      `Unsupported file type "${file.type || "unknown"}". Use JPG, PNG, WebP, GIF or AVIF.`
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(
      `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 10 MB.`
    );
  }

  const supabase = await createClient();
  const path = buildObjectName(file);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: "31536000", upsert: false });

  if (error) {
    throw new UploadError(error.message);
  }

  return {
    path,
    url: publicImageUrl(bucket, path) ?? path,
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
  };
}

export async function deleteImage(
  bucket: BucketName,
  path: string | null | undefined
): Promise<void> {
  const normalized = toStoragePath(path, bucket);
  if (!normalized || !isSupabaseConfigured) return;

  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove([normalized]);

  // A missing object is not worth failing the surrounding delete.
  if (error) {
    console.error("[storage] deleteImage failed:", error.message);
  }
}
