import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { parseBlogPostInput } from "@/lib/blog-validation";
import { BLOG_POSTS_CACHE_TAG } from "@/lib/blog-posts";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BlogPostInput } from "@/lib/blog-types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Blog database is not configured." }, { status: 503 });

  let input: BlogPostInput | null;
  try {
    input = parseBlogPostInput(await request.json());
  } catch {
    return NextResponse.json({ error: "Request body is invalid." }, { status: 400 });
  }
  if (!input) return NextResponse.json({ error: "Enter valid blog post details." }, { status: 400 });

  const { id } = await params;
  const { data, error } = await supabase
    .from("blog_posts")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, title, slug, content, excerpt, author, published_at, cover_image, seo_meta, created_at, updated_at")
    .maybeSingle();
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "That blog slug is already in use." }, { status: 409 });
    const message = error.code === "42P01" || error.code === "PGRST205"
      ? "Apply supabase/migrations/11_blogs_and_seo_settings.sql to enable blog management."
      : "Unable to update blog post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Blog post not found." }, { status: 404 });

  revalidateTag(BLOG_POSTS_CACHE_TAG, { expire: 0 });
  return NextResponse.json({ post: data });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Blog database is not configured." }, { status: 503 });

  const { id } = await params;
  const { data, error } = await supabase.from("blog_posts").delete().eq("id", id).select("id").maybeSingle();
  if (error) {
    const message = error.code === "42P01" || error.code === "PGRST205"
      ? "Apply supabase/migrations/11_blogs_and_seo_settings.sql to enable blog management."
      : "Unable to delete blog post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Blog post not found." }, { status: 404 });

  revalidateTag(BLOG_POSTS_CACHE_TAG, { expire: 0 });
  return NextResponse.json({ deleted: true });
}
