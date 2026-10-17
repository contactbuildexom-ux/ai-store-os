ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS seo_settings JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'Buildexom Team',
  published_at TIMESTAMPTZ,
  cover_image TEXT,
  seo_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at
  ON public.blog_posts (published_at DESC)
  WHERE published_at IS NOT NULL;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.blog_posts FROM anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;
