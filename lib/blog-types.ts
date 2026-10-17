export type BlogSeoMeta = {
  title?: string;
  description?: string;
  keywords?: string[];
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  published_at: string | null;
  cover_image: string | null;
  seo_meta: BlogSeoMeta;
  created_at: string;
  updated_at: string;
};

export type BlogPostInput = Omit<BlogPost, "id" | "created_at" | "updated_at">;
