import type { BlogPostInput, BlogSeoMeta } from "@/lib/blog-types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseBlogPostInput(value: unknown): BlogPostInput | null {
  if (!isRecord(value)) return null;

  const title = value.title;
  const slug = value.slug;
  const content = value.content;
  const excerpt = value.excerpt;
  const author = value.author;
  const coverImageValue = value.cover_image;
  if (
    typeof title !== "string"
    || typeof slug !== "string"
    || typeof content !== "string"
    || typeof excerpt !== "string"
    || typeof author !== "string"
    || (coverImageValue !== null && typeof coverImageValue !== "string")
    || !("published_at" in value)
    || !isRecord(value.seo_meta)
  ) return null;

  const cleanTitle = title.trim();
  const cleanSlug = slug.trim().toLowerCase();
  const cleanContent = content.trim();
  const cleanExcerpt = excerpt.trim();
  const cleanAuthor = author.trim();
  const coverImage = typeof coverImageValue === "string" ? coverImageValue.trim() : "";

  if (!cleanTitle || cleanTitle.length > 200) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug) || cleanSlug.length > 180) return null;
  if (!cleanContent || cleanContent.length > 200000) return null;
  if (cleanExcerpt.length > 500 || !cleanAuthor || cleanAuthor.length > 120) return null;
  if (coverImage && (coverImage.length > 2048 || !isHttpUrl(coverImage))) return null;

  let publishedAt: string | null = null;
  if (value.published_at !== null && value.published_at !== "") {
    if (typeof value.published_at !== "string" || !Number.isFinite(Date.parse(value.published_at))) return null;
    publishedAt = new Date(value.published_at).toISOString();
  }

  const seoMeta: BlogSeoMeta = {};
  const seoTitle = value.seo_meta.title;
  if (seoTitle !== undefined) {
    if (typeof seoTitle !== "string" || seoTitle.length > 200) return null;
    seoMeta.title = seoTitle.trim();
  }
  const seoDescription = value.seo_meta.description;
  if (seoDescription !== undefined) {
    if (typeof seoDescription !== "string" || seoDescription.length > 500) return null;
    seoMeta.description = seoDescription.trim();
  }
  const seoKeywords = value.seo_meta.keywords;
  if (seoKeywords !== undefined) {
    if (!Array.isArray(seoKeywords)) return null;
    const keywords: string[] = [];
    for (const keyword of seoKeywords) {
      if (typeof keyword !== "string" || keyword.length > 80) return null;
      if (keyword.trim()) keywords.push(keyword.trim());
    }
    seoMeta.keywords = keywords;
  }

  return {
    title: cleanTitle,
    slug: cleanSlug,
    content: cleanContent,
    excerpt: cleanExcerpt,
    author: cleanAuthor,
    published_at: publishedAt,
    cover_image: coverImage || null,
    seo_meta: seoMeta,
  };
}
