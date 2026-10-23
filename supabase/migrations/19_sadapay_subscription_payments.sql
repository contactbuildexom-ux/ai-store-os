ALTER TABLE public.subscription_payment_requests
  DROP CONSTRAINT IF EXISTS subscription_payment_requests_gateway_check;

ALTER TABLE public.subscription_payment_requests
  ADD CONSTRAINT subscription_payment_requests_gateway_check
  CHECK (gateway IN ('easypaisa', 'jazzcash', 'sadapay'));
