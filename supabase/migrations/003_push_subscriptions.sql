-- Push notification subscriptions for web-push
-- Stores browser push subscription details per user.

CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate subscriptions for the same user + endpoint
ALTER TABLE public.push_subscriptions
  ADD CONSTRAINT push_subscriptions_user_endpoint_unique UNIQUE (user_id, endpoint);

-- Fast lookup by user
CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);

-- RLS: users can CRUD own subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY push_subscriptions_all
  ON public.push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id);
