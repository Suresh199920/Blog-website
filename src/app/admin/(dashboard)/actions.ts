"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import {
  slugify,
  estimateReadingMinutes,
  parseTags,
} from "@/lib/markdown";
import { parseYouTubeId } from "@/lib/youtube";
import {
  BUCKETS,
  deleteImage,
  uploadImage,
  UploadError,
} from "@/lib/storage";

export type ActionState = { error?: string; success?: string };

const postSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().max(200).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  cover_alt: z.string().max(200).optional(),
  category_id: z.string().uuid().optional(),
  tags: z.string().optional(),
  status: z.enum(["draft", "published"]),
  is_featured: z.boolean(),
});

export async function savePost(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorised" };

  const parsed = postSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content"),
    cover_alt: formData.get("cover_alt") || undefined,
    category_id: formData.get("category_id") || undefined,
    tags: formData.get("tags") || undefined,
    status: formData.get("status"),
    is_featured: formData.get("is_featured") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const values = parsed.data;
  const supabase = await createClient();

  // Unique slug, so two posts with the same title don't collide.
  const baseSlug = slugify(values.slug || values.title) || `post-${Date.now().toString(36)}`;
  let slug = baseSlug;
  let attempt = 2;

  for (;;) {
    const { data: clash } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!clash || clash.id === values.id) break;
    slug = `${baseSlug}-${attempt++}`;
  }

  const payload = {
    title: values.title,
    slug,
    excerpt: values.excerpt || null,
    content: values.content,
    cover_alt: values.cover_alt || null,
    category_id: values.category_id || null,
    tags: parseTags(values.tags),
    status: values.status,
    is_featured: values.is_featured,
    reading_minutes: estimateReadingMinutes(values.content),
    author_id: admin.id,
    published_at: values.status === "published" ? new Date().toISOString() : null,
  };

  // Cover image is optional on edit: keep the existing one unless a
  // replacement was supplied.
  let coverImage: string | null = null;
  const coverFile = formData.get("cover");
  const existingCover = formData.get("existing_cover");

  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      const uploaded = await uploadImage(BUCKETS.postCovers, coverFile);
      coverImage = uploaded.path;
    } catch (error) {
      return {
        error:
          error instanceof UploadError ? error.message : "Could not upload the cover image",
      };
    }
  } else if (typeof existingCover === "string" && existingCover) {
    coverImage = existingCover;
  }

  const body = coverImage ? { ...payload, cover_image: coverImage } : payload;

  if (values.id) {
    const { error } = await supabase.from("posts").update(body).eq("id", values.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("posts").insert(body);
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/posts");

  return { success: values.id ? "Post updated" : "Post created" };
}

export async function deletePostAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorised" };

  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: "Invalid post" };

  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("cover_image")
    .eq("id", id.data)
    .maybeSingle();

  if (post?.cover_image) {
    await deleteImage(BUCKETS.postCovers, post.cover_image);
  }

  const { error } = await supabase.from("posts").delete().eq("id", id.data);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/posts");

  return { success: "Post deleted" };
}

const photoSchema = z.object({
  id: z.string().uuid().optional(),
  album_id: z.string().uuid().optional(),
  title: z.string().max(200).optional(),
  caption: z.string().max(1000).optional(),
  alt_text: z.string().max(200).optional(),
});

export async function savePhoto(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorised" };

  const parsed = photoSchema.safeParse({
    id: formData.get("id") || undefined,
    album_id: formData.get("album_id") || undefined,
    title: formData.get("title") || undefined,
    caption: formData.get("caption") || undefined,
    alt_text: formData.get("alt_text") || undefined,
  });

  if (!parsed.success) return { error: "Invalid input" };

  const values = parsed.data;
  const file = formData.get("photo");
  const hasNewFile = file instanceof File && file.size > 0;

  if (!values.id && !hasNewFile) {
    return { error: "Choose an image to upload" };
  }

  const supabase = await createClient();
  const details = {
    album_id: values.album_id || null,
    title: values.title || null,
    caption: values.caption || null,
    alt_text: values.alt_text || null,
  };

  if (hasNewFile) {
    let uploaded;
    try {
      uploaded = await uploadImage(BUCKETS.gallery, file as File);
    } catch (error) {
      return {
        error:
          error instanceof UploadError ? error.message : "Could not upload the image",
      };
    }

    if (values.id) {
      // Fetch the old path first so the previous file is only removed
      // once the replacement is safely stored.
      const { data: existing } = await supabase
        .from("photos")
        .select("image_path")
        .eq("id", values.id)
        .maybeSingle();

      const { error } = await supabase
        .from("photos")
        .update({ ...details, image_path: uploaded.path })
        .eq("id", values.id);

      if (error) return { error: error.message };

      if (existing?.image_path && existing.image_path !== uploaded.path) {
        await deleteImage(BUCKETS.gallery, existing.image_path);
      }
    } else {
      const { error } = await supabase
        .from("photos")
        .insert({ ...details, image_path: uploaded.path });

      if (error) return { error: error.message };
    }
  } else if (values.id) {
    const { error } = await supabase
      .from("photos")
      .update(details)
      .eq("id", values.id);

    if (error) return { error: error.message };
  }

  revalidatePath("/gallery");
  revalidatePath("/admin/photos");

  return { success: values.id ? "Photo updated" : "Photo uploaded" };
}

export async function deletePhotoAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorised" };

  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: "Invalid photo" };

  const supabase = await createClient();

  const { data: photo } = await supabase
    .from("photos")
    .select("image_path")
    .eq("id", id.data)
    .maybeSingle();

  if (photo?.image_path) {
    await deleteImage(BUCKETS.gallery, photo.image_path);
  }

  const { error } = await supabase.from("photos").delete().eq("id", id.data);
  if (error) return { error: error.message };

  revalidatePath("/gallery");
  revalidatePath("/admin/photos");

  return { success: "Photo deleted" };
}

const albumSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

export async function saveAlbum(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorised" };

  const parsed = albumSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  const baseSlug = slugify(parsed.data.name) || `album-${Date.now().toString(36)}`;
  let slug = baseSlug;
  let attempt = 2;

  for (;;) {
    const { data: clash } = await supabase
      .from("albums")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!clash || clash.id === parsed.data.id) break;
    slug = `${baseSlug}-${attempt++}`;
  }

  const body = {
    name: parsed.data.name,
    slug,
    description: parsed.data.description || null,
  };

  if (parsed.data.id) {
    const { error } = await supabase
      .from("albums")
      .update(body)
      .eq("id", parsed.data.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("albums").insert(body);
    if (error) return { error: error.message };
  }

  revalidatePath("/gallery");
  revalidatePath("/admin/photos");

  return { success: parsed.data.id ? "Album updated" : "Album created" };
}

export async function deleteAlbumAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorised" };

  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: "Invalid album" };

  const supabase = await createClient();

  // Rows cascade at the database level, but storage objects do not, so
  // clear the files explicitly before dropping the album.
  const { data: photos } = await supabase
    .from("photos")
    .select("image_path")
    .eq("album_id", id.data);

  for (const photo of photos ?? []) {
    await deleteImage(BUCKETS.gallery, photo.image_path);
  }

  const { error } = await supabase.from("albums").delete().eq("id", id.data);
  if (error) return { error: error.message };

  revalidatePath("/gallery");
  revalidatePath("/admin/photos");

  return { success: "Album deleted" };
}

const videoSchema = z.object({
  id: z.string().uuid().optional(),
  youtube_url: z.string().min(1, "A YouTube link is required"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  category: z.string().max(50).optional(),
  is_featured: z.boolean(),
});

export async function saveVideo(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorised" };

  const parsed = videoSchema.safeParse({
    id: formData.get("id") || undefined,
    youtube_url: formData.get("youtube_url"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    is_featured: formData.get("is_featured") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const youtubeId = parseYouTubeId(parsed.data.youtube_url);
  if (!youtubeId) {
    return { error: "That doesn't look like a valid YouTube link" };
  }

  const supabase = await createClient();

  const body = {
    youtube_id: youtubeId,
    youtube_url: parsed.data.youtube_url,
    title: parsed.data.title,
    description: parsed.data.description || null,
    category: parsed.data.category || null,
    is_featured: parsed.data.is_featured,
    published_at: new Date().toISOString(),
  };

  if (parsed.data.id) {
    const { error } = await supabase.from("videos").update(body).eq("id", parsed.data.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("videos").insert(body);
    if (error) return { error: error.message };
  }

  revalidatePath("/videos");
  revalidatePath("/admin/videos");

  return { success: parsed.data.id ? "Video updated" : "Video added" };
}

export async function deleteVideoAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorised" };

  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: "Invalid video" };

  const supabase = await createClient();
  const { error } = await supabase.from("videos").delete().eq("id", id.data);
  if (error) return { error: error.message };

  revalidatePath("/videos");
  revalidatePath("/admin/videos");

  return { success: "Video removed" };
}

const settingsSchema = z.object({
  site_title: z.string().min(1, "Title is required").max(100),
  site_tagline: z.string().max(200).optional(),
  site_description: z.string().max(300).optional(),
  about_body: z.string().max(20000).optional(),
  contact_email: z.union([z.literal(""), z.string().email("Enter a valid email")]),
});

export async function saveSettings(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorised" };

  const parsed = settingsSchema.safeParse({
    site_title: formData.get("site_title"),
    site_tagline: formData.get("site_tagline") || "",
    site_description: formData.get("site_description") || "",
    about_body: formData.get("about_body") || "",
    contact_email: formData.get("contact_email") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  // `settings` is a key/value table, so each key upserts on its own.
  const entries = Object.entries(parsed.data).map(([key, value]) => ({
    key,
    value: value || null,
  }));

  const { error } = await supabase.from("settings").upsert(entries);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");

  return { success: "Settings saved" };
}

export async function markMessageReadAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorised" };

  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: "Invalid message" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ is_read: true })
    .eq("id", id.data);

  if (error) return { error: error.message };

  revalidatePath("/admin/messages");
  return { success: "Marked as read" };
}

export async function deleteMessageAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorised" };

  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: "Invalid message" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id.data);

  if (error) return { error: error.message };

  revalidatePath("/admin/messages");
  return { success: "Message deleted" };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}