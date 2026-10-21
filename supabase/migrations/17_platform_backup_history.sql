CREATE TABLE IF NOT EXISTS public.platform_backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL CHECK (backup_type IN ('database', 'full_site')),
  actor_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes >= 0)
);

CREATE INDEX IF NOT EXISTS idx_platform_backup_history_created_at
  ON public.platform_backup_history (created_at DESC);

ALTER TABLE public.platform_backup_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.platform_backup_history FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.platform_backup_history TO service_role;
