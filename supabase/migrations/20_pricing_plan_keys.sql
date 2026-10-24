ALTER TABLE public.pricing_plans
  ADD COLUMN IF NOT EXISTS plan_key TEXT;

WITH named_plans AS (
  SELECT
    id,
    CASE LOWER(TRIM(name))
      WHEN 'free' THEN 'basic'
      WHEN 'basic' THEN 'basic'
      WHEN 'free starter' THEN 'basic'
      WHEN 'pro' THEN 'pro'
      WHEN 'business' THEN 'business'
      WHEN 'advanced' THEN 'business'
      WHEN 'advance' THEN 'business'
      ELSE NULL
    END AS plan_key,
    ROW_NUMBER() OVER (
      PARTITION BY CASE LOWER(TRIM(name))
        WHEN 'free' THEN 'basic'
        WHEN 'basic' THEN 'basic'
        WHEN 'free starter' THEN 'basic'
        WHEN 'pro' THEN 'pro'
        WHEN 'business' THEN 'business'
        WHEN 'advanced' THEN 'business'
        WHEN 'advance' THEN 'business'
        ELSE NULL
      END
      ORDER BY is_active DESC, created_at ASC, id ASC
    ) AS match_rank
  FROM public.pricing_plans
)
UPDATE public.pricing_plans AS plans
SET plan_key = named_plans.plan_key
FROM named_plans
WHERE plans.id = named_plans.id
  AND plans.plan_key IS NULL
  AND named_plans.plan_key IS NOT NULL
  AND named_plans.match_rank = 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'pricing_plans_plan_key_check'
  ) THEN
    ALTER TABLE public.pricing_plans
      ADD CONSTRAINT pricing_plans_plan_key_check
      CHECK (plan_key IS NULL OR plan_key IN ('basic', 'pro', 'business'));
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pricing_plans_active_key
  ON public.pricing_plans (plan_key)
  WHERE is_active = TRUE AND plan_key IS NOT NULL;
