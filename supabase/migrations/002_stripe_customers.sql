-- Add Stripe billing columns to the profiles table.
-- These columns link each user to their Stripe customer and subscription
-- so the webhook handler can update plans and the portal route can look up
-- the customer without calling the Stripe search API.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Index on stripe_customer_id for fast lookups from webhook events.
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index on stripe_subscription_id for subscription event lookups.
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id
  ON public.profiles (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
