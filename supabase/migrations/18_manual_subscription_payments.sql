CREATE TABLE IF NOT EXISTS public.subscription_payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('pro', 'business')),
  gateway TEXT NOT NULL CHECK (gateway IN ('easypaisa', 'jazzcash', 'sadapay')),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  transaction_id TEXT NOT NULL CHECK (btrim(transaction_id) <> ''),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  sender_name TEXT NOT NULL DEFAULT '',
  sender_number TEXT NOT NULL DEFAULT '',
  screenshot_url TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_payment_requests_gateway_tid
  ON public.subscription_payment_requests (gateway, transaction_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_payment_requests_one_pending_per_store
  ON public.subscription_payment_requests (store_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_subscription_payment_requests_status_created
  ON public.subscription_payment_requests (status, created_at DESC);

ALTER TABLE public.subscription_payment_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.subscription_payment_requests FROM anon, authenticated;
GRANT ALL ON public.subscription_payment_requests TO service_role;

INSERT INTO public.subscription_payment_requests (
  store_id,
  user_id,
  plan_id,
  gateway,
  amount,
  transaction_id,
  status,
  sender_name,
  sender_number,
  screenshot_url,
  created_at,
  updated_at
)
SELECT
  store.id,
  COALESCE(store.owner_id, store.user_id),
  details.value ->> 'target_plan',
  details.value ->> 'payment_method',
  CASE details.value ->> 'target_plan'
    WHEN 'business' THEN 4999
    WHEN 'pro' THEN 2499
  END,
  btrim(details.value ->> 'transaction_id'),
  'pending',
  COALESCE(details.value ->> 'sender_name', ''),
  COALESCE(details.value ->> 'sender_number', ''),
  NULLIF(details.value ->> 'screenshot_url', ''),
  COALESCE(store.created_at, now()),
  now()
FROM public.stores AS store
CROSS JOIN LATERAL (
  SELECT store.payment_details -> 'pending_upgrade' AS value
) AS details
WHERE jsonb_typeof(store.payment_details -> 'pending_upgrade') = 'object'
  AND details.value ->> 'target_plan' IN ('pro', 'business')
  AND details.value ->> 'payment_method' IN ('easypaisa', 'jazzcash', 'sadapay')
  AND NULLIF(btrim(details.value ->> 'transaction_id'), '') IS NOT NULL
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.review_subscription_payment_request(
  p_request_id UUID,
  p_action TEXT,
  p_admin_email TEXT
)
RETURNS public.subscription_payment_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payment_request public.subscription_payment_requests;
BEGIN
  IF p_action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Invalid payment review action.' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO payment_request
  FROM public.subscription_payment_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment request not found.' USING ERRCODE = 'P0002';
  END IF;

  IF payment_request.status <> 'pending' THEN
    RAISE EXCEPTION 'Payment request has already been reviewed.' USING ERRCODE = '55000';
  END IF;

  UPDATE public.subscription_payment_requests
  SET status = CASE WHEN p_action = 'approve' THEN 'approved' ELSE 'rejected' END,
      reviewed_by = NULLIF(btrim(p_admin_email), ''),
      reviewed_at = now(),
      updated_at = now()
  WHERE id = p_request_id
  RETURNING * INTO payment_request;

  IF p_action = 'approve' THEN
    UPDATE public.stores
    SET plan = payment_request.plan_id,
        selected_plan = payment_request.plan_id,
        payment_status = 'active'
    WHERE id = payment_request.store_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Store for payment request no longer exists.' USING ERRCODE = 'P0002';
    END IF;
  ELSE
    UPDATE public.stores
    SET payment_status = 'active'
    WHERE id = payment_request.store_id
      AND payment_status = 'pending_approval';
  END IF;

  RETURN payment_request;
END;
$$;

REVOKE ALL ON FUNCTION public.review_subscription_payment_request(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.review_subscription_payment_request(UUID, TEXT, TEXT) TO service_role;