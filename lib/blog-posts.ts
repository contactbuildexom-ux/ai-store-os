import "server-only";
import { unstable_cache } from "next/cache";
import type { BlogPost } from "@/lib/blog-types";
import { createAdminClient } from "@/lib/supabase/admin";

export const BLOG_POSTS_CACHE_TAG = "blog-posts";

async function queryPublishedPosts(): Promise<BlogPost[]> {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("The blog database is not configured.");

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, content, excerpt, author, published_at, cover_image, seo_meta, created_at, updated_at")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(`Unable to load blog posts: ${error.message}`);
  return (data ?? []) as BlogPost[];
}

export const getPublishedBlogPosts = unstable_cache(
  queryPublishedPosts,
  ["published-blog-posts-v1"],
  { tags: [BLOG_POSTS_CACHE_TAG], revalidate: 300 },
);

export const getPublishedBlogPost = unstable_cache(
  async (slug: string): Promise<BlogPost | null> => {
    const supabase = createAdminClient();
    if (!supabase) throw new Error("The blog database is not configured.");

    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, content, excerpt, author, published_at, cover_image, seo_meta, created_at, updated_at")
      .eq("slug", slug)
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .maybeSingle();

    if (error) throw new Error(`Unable to load blog post: ${error.message}`);
    return data as BlogPost | null;
  },
  ["published-blog-post-by-slug-v1"],
  { tags: [BLOG_POSTS_CACHE_TAG], revalidate: 300 },
);
