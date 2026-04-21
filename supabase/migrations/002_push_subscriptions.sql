-- Push Subscriptions table
-- Stores Web Push API subscriptions so the server can send notifications.

CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Each endpoint should only exist once (a device can only belong to one user)
CREATE UNIQUE INDEX idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);

-- Fast lookup by user
CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY push_subscriptions_select
  ON public.push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY push_subscriptions_insert
  ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own subscriptions
CREATE POLICY push_subscriptions_delete
  ON public.push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- The server-side send API reads subscriptions via the service role key,
-- which bypasses RLS. No additional policy is needed for that path.
