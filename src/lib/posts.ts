import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { demoCategories, demoPosts } from "@/lib/demo";
import type { Category, Post, Profile } from "@/types/database";

export type PostWithRelations = Post & {
  category: Pick<Category, "id" | "slug" | "name"> | null;
  author: Pick<Profile, "display_name" | "avatar_url"> | null;
};

export type CategoryWithCount = Category & { post_count: number };

const POST_SELECT = `
  id, slug, title, excerpt, content, cover_image, cover_alt, category_id,
  author_id, tags, status, is_featured, reading_minutes, published_at,
  created_at, updated_at,
  category:categories(id, slug, name),
  author:profiles(display_name, avatar_url)
`;

export async function getPostCount(): Promise<number> {
  if (!isSupabaseConfigured) return demoPosts.length;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  if (error) {
    console.error("[posts] getPostCount failed:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function getPublishedPosts(options: {
  page?: number;
  perPage?: number;
  categorySlug?: string;
  tag?: string;
  query?: string;
} = {}): Promise<{
  posts: PostWithRelations[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
}> {
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.max(1, options.perPage ?? 9);

  const empty = { posts: [], total: 0, totalPages: 0, page, perPage };

  if (!isSupabaseConfigured) {
    let matching = demoPosts as PostWithRelations[];

    if (options.categorySlug) {
      matching = matching.filter(
        (post) => post.category?.slug === options.categorySlug
      );
    }

    if (options.tag) {
      matching = matching.filter((post) => post.tags.includes(options.tag!));
    }

    if (options.query) {
      const needle = options.query.toLowerCase();
      matching = matching.filter(
        (post) =>
          post.title.toLowerCase().includes(needle) ||
          post.excerpt?.toLowerCase().includes(needle) ||
          post.content.toLowerCase().includes(needle)
      );
    }

    const total = matching.length;
    const from = (page - 1) * perPage;

    return {
      posts: matching.slice(from, from + perPage),
      total,
      totalPages: Math.ceil(total / perPage),
      page,
      perPage,
    };
  }

  const supabase = await createClient();
  const from = (page - 1) * perPage;

  let query = supabase
    .from("posts")
    .select(POST_SELECT, { count: "exact" })
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (options.categorySlug) {
    // Filter through the embedded relation so the URL stays a clean slug.
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .maybeSingle();

    if (!category) return { ...empty, page, perPage };
    query = query.eq("category_id", category.id);
  }

  if (options.tag) {
    query = query.contains("tags", [options.tag]);
  }

  if (options.query) {
    // `ilike` with escaped wildcards so a literal % can't match everything.
    const term = options.query.replace(/[%_]/g, (char) => `\\${char}`);
    query = query.or(
      `title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    const isSkip = error.message?.includes("request skipped") || error.message?.includes("Supabase unreachable") || error.name === "AbortError";
    if (!isSkip) {
      console.error("[posts] getPublishedPosts failed:", error.message);
    }
    return { posts: [], total: 0, totalPages: 0, page, perPage };
  }

  const total = count ?? 0;

  return {
    posts: (data ?? []) as unknown as PostWithRelations[],
    total,
    totalPages: Math.ceil(total / perPage),
    page,
    perPage,
  };
}

export async function getPostBySlug(
  slug: string
): Promise<PostWithRelations | null> {
  if (!isSupabaseConfigured) {
    return (demoPosts as PostWithRelations[]).find((post) => post.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[posts] getPostBySlug failed:", error.message);
    return null;
  }

  return (data as unknown as PostWithRelations) ?? null;
}

export async function getFeaturedPosts(limit = 3): Promise<PostWithRelations[]> {
  if (!isSupabaseConfigured) {
    const featured = (demoPosts as PostWithRelations[]).filter(
      (post) => post.is_featured
    );
    return (featured.length ? featured : (demoPosts as PostWithRelations[])).slice(0, limit);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .eq("is_featured", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    const isSkip = error.message?.includes("request skipped") || error.message?.includes("Supabase unreachable") || error.name === "AbortError";
    if (!isSkip) {
      console.error("[posts] getFeaturedPosts failed:", error.message);
    }
    return [];
  }

  return (data ?? []) as unknown as PostWithRelations[];
}

export async function getRelatedPosts(
  post: Post,
  limit = 3
): Promise<PostWithRelations[]> {
  if (!isSupabaseConfigured) {
    const all = demoPosts as PostWithRelations[];
    return all
      .filter((candidate) => candidate.id !== post.id)
      .sort(
        (a, b) =>
          Number(b.category_id === post.category_id) -
          Number(a.category_id === post.category_id)
      )
      .slice(0, limit);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(limit * 3);

  if (error) {
    console.error("[posts] getRelatedPosts failed:", error.message);
    return [];
  }

  const all = (data ?? []) as unknown as PostWithRelations[];

  // Prefer same-category posts, then top up with the newest of the rest.
  const sameCategory = all.filter(
    (candidate) =>
      candidate.category_id &&
      candidate.category_id === post.category_id
  );
  const others = all.filter(
    (candidate) => candidate.category_id !== post.category_id
  );

  return [...sameCategory, ...others].slice(0, limit);
}

export async function getAllTags(): Promise<string[]> {
  if (!isSupabaseConfigured) {
    const counts = new Map<string, number>();
    for (const post of demoPosts) {
      for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("tags")
    .eq("status", "published");

  if (error) {
    const isSkip = error.message?.includes("request skipped") || error.message?.includes("Supabase unreachable") || error.name === "AbortError";
    if (!isSkip) {
      console.error("[posts] getAllTags failed:", error.message);
    }
    return [];
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    for (const tag of row.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  if (!isSupabaseConfigured) {
    return demoCategories.map((category) => ({
      ...category,
      post_count: demoPosts.filter((post) => post.category_id === category.id)
        .length,
    }));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, sort_order, created_at, posts(count)")
    .order("sort_order");

  if (error) {
    const isSkip = error.message?.includes("request skipped") || error.message?.includes("Supabase unreachable") || error.name === "AbortError";
    if (!isSkip) {
      console.error("[posts] getCategoriesWithCounts failed:", error.message);
    }
    return [];
  }

  return (data ?? []).map((row) => {
    const embedded = row.posts as { count: number } | null;
    const { posts: _posts, ...category } = row;
    return {
      ...category,
      post_count: embedded?.count ?? 0,
    };
  });
}

export async function getAllPostSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured) return demoPosts.map((post) => post.slug);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("slug")
    .eq("status", "published");

  if (error) {
    console.error("[posts] getAllPostSlugs failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.slug);
}
