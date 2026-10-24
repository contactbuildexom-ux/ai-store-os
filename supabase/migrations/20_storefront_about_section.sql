ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS hero_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS about_title TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_text TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_image TEXT NOT NULL DEFAULT '';

GRANT SELECT (hero_images, about_title, about_text, about_image)
  ON public.store_settings TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
