-- =============================================================================
-- Park App — Full Supabase Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enable PostGIS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS postgis;

-- ---------------------------------------------------------------------------
-- 2. profiles (extends auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'fleet')),
  city TEXT NOT NULL DEFAULT '',
  checks_used INTEGER NOT NULL DEFAULT 0,
  checks_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  karma INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_check_date DATE,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  handicap_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  handicap_type TEXT,
  vehicle_plate TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  stats JSONB NOT NULL DEFAULT '{"checks": 0, "ticketsAvoided": 0, "moneySaved": 0}'::jsonb,
  accessibility JSONB NOT NULL DEFAULT '{"highContrast": false, "largeText": false, "reducedMotion": false, "dyslexiaFont": false, "screenReaderMode": false, "language": "en"}'::jsonb,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  biometric_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles (email);
CREATE INDEX idx_profiles_referral_code ON public.profiles (referral_code) WHERE referral_code IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. parking_checks
-- ---------------------------------------------------------------------------
CREATE TABLE public.parking_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  location GEOGRAPHY(POINT, 4326),
  address TEXT NOT NULL DEFAULT '',
  street TEXT,
  city TEXT,
  status TEXT NOT NULL CHECK (status IN ('allowed', 'restricted', 'prohibited')),
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parking_checks_user_id ON public.parking_checks (user_id);
CREATE INDEX idx_parking_checks_location ON public.parking_checks USING GIST (location);

-- ---------------------------------------------------------------------------
-- 4. parking_sessions
-- ---------------------------------------------------------------------------
CREATE TABLE public.parking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  check_id UUID REFERENCES public.parking_checks(id) ON DELETE SET NULL,
  location GEOGRAPHY(POINT, 4326),
  address TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_protected BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_set BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_time TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_parking_sessions_user_id ON public.parking_sessions (user_id);
CREATE INDEX idx_parking_sessions_active ON public.parking_sessions (user_id, is_active) WHERE is_active = TRUE;

-- ---------------------------------------------------------------------------
-- 5. subscriptions
-- ---------------------------------------------------------------------------
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'fleet')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions (stripe_customer_id);

-- ---------------------------------------------------------------------------
-- 6. enforcement_sightings
-- ---------------------------------------------------------------------------
CREATE TABLE public.enforcement_sightings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('parking_officer', 'tow_truck', 'meter_maid', 'police')),
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  notes TEXT,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_enforcement_sightings_location ON public.enforcement_sightings USING GIST (location);
CREATE INDEX idx_enforcement_sightings_active ON public.enforcement_sightings (expires_at) WHERE expires_at > NOW();

-- ---------------------------------------------------------------------------
-- 7. sighting_votes
-- ---------------------------------------------------------------------------
CREATE TABLE public.sighting_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sighting_id UUID NOT NULL REFERENCES public.enforcement_sightings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sighting_id, user_id)
);

CREATE INDEX idx_sighting_votes_sighting ON public.sighting_votes (sighting_id);

-- ---------------------------------------------------------------------------
-- 8. meter_reports
-- ---------------------------------------------------------------------------
CREATE TABLE public.meter_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  status TEXT NOT NULL CHECK (status IN ('working', 'broken', 'card_only', 'coins_only', 'free')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meter_reports_location ON public.meter_reports USING GIST (location);

-- ---------------------------------------------------------------------------
-- 9. photo_evidence
-- ---------------------------------------------------------------------------
CREATE TABLE public.photo_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_photo_evidence_user_id ON public.photo_evidence (user_id);

-- ---------------------------------------------------------------------------
-- 10. badges_earned
-- ---------------------------------------------------------------------------
CREATE TABLE public.badges_earned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

CREATE INDEX idx_badges_earned_user ON public.badges_earned (user_id);

-- ---------------------------------------------------------------------------
-- 11. saved_locations
-- ---------------------------------------------------------------------------
CREATE TABLE public.saved_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  notes TEXT,
  last_result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_locations_user_id ON public.saved_locations (user_id);

-- ---------------------------------------------------------------------------
-- 12. protection_claims
-- ---------------------------------------------------------------------------
CREATE TABLE public.protection_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.parking_sessions(id) ON DELETE SET NULL,
  ticket_amount NUMERIC(10, 2),
  ticket_photo_path TEXT,
  ticket_number TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'approved', 'denied', 'paid')),
  payout_amount NUMERIC(10, 2),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_protection_claims_user ON public.protection_claims (user_id);

-- ---------------------------------------------------------------------------
-- 13. fleet_orgs
-- ---------------------------------------------------------------------------
CREATE TABLE public.fleet_orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'starter' CHECK (tier IN ('starter', 'professional', 'enterprise')),
  stripe_subscription_id TEXT,
  vehicle_limit INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fleet_orgs_owner ON public.fleet_orgs (owner_id);

-- ---------------------------------------------------------------------------
-- 14. fleet_vehicles
-- ---------------------------------------------------------------------------
CREATE TABLE public.fleet_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.fleet_orgs(id) ON DELETE CASCADE,
  plate TEXT NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fleet_vehicles_org ON public.fleet_vehicles (org_id);

-- ---------------------------------------------------------------------------
-- 15. data_reports
-- ---------------------------------------------------------------------------
CREATE TABLE public.data_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_data_reports_user ON public.data_reports (user_id);

-- ---------------------------------------------------------------------------
-- 16. referrals
-- ---------------------------------------------------------------------------
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  bonus_applied BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON public.referrals (referrer_id);
CREATE INDEX idx_referrals_code ON public.referrals (code);

-- ---------------------------------------------------------------------------
-- 17. push_subscriptions (for web push notifications)
-- ---------------------------------------------------------------------------
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions (user_id);

-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enforcement_sightings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sighting_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges_earned ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protection_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles: users read/update their own row
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- parking_checks: users manage their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can read own checks"
  ON public.parking_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checks"
  ON public.parking_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- parking_sessions: users manage their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can read own sessions"
  ON public.parking_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.parking_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.parking_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- subscriptions: users read their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- enforcement_sightings: anyone reads active, authenticated users insert
-- ---------------------------------------------------------------------------
CREATE POLICY "Anyone can read active sightings"
  ON public.enforcement_sightings FOR SELECT
  USING (expires_at > NOW());

CREATE POLICY "Authenticated users can insert sightings"
  ON public.enforcement_sightings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sightings"
  ON public.enforcement_sightings FOR UPDATE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- sighting_votes: users manage their own votes
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can read own votes"
  ON public.sighting_votes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own votes"
  ON public.sighting_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON public.sighting_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON public.sighting_votes FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- meter_reports: anyone reads, authenticated users insert
-- ---------------------------------------------------------------------------
CREATE POLICY "Anyone can read meter reports"
  ON public.meter_reports FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can insert meter reports"
  ON public.meter_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- photo_evidence: users manage their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can read own photos"
  ON public.photo_evidence FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON public.photo_evidence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON public.photo_evidence FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- badges_earned: users read their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can read own badges"
  ON public.badges_earned FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON public.badges_earned FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- saved_locations: users manage their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can read own saved locations"
  ON public.saved_locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved locations"
  ON public.saved_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved locations"
  ON public.saved_locations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved locations"
  ON public.saved_locations FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- protection_claims: users manage their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can read own claims"
  ON public.protection_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own claims"
  ON public.protection_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- fleet_orgs: owners manage their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Owners can read own fleet org"
  ON public.fleet_orgs FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert fleet org"
  ON public.fleet_orgs FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own fleet org"
  ON public.fleet_orgs FOR UPDATE
  USING (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- fleet_vehicles: org owners manage vehicles
-- ---------------------------------------------------------------------------
CREATE POLICY "Org owners can read vehicles"
  ON public.fleet_vehicles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.fleet_orgs WHERE id = fleet_vehicles.org_id AND owner_id = auth.uid()
  ));

CREATE POLICY "Org owners can insert vehicles"
  ON public.fleet_vehicles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.fleet_orgs WHERE id = fleet_vehicles.org_id AND owner_id = auth.uid()
  ));

CREATE POLICY "Org owners can update vehicles"
  ON public.fleet_vehicles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.fleet_orgs WHERE id = fleet_vehicles.org_id AND owner_id = auth.uid()
  ));

CREATE POLICY "Org owners can delete vehicles"
  ON public.fleet_vehicles FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.fleet_orgs WHERE id = fleet_vehicles.org_id AND owner_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- data_reports: users manage their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can read own data reports"
  ON public.data_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert data reports"
  ON public.data_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- referrals: users read their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can read own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_id);

-- ---------------------------------------------------------------------------
-- push_subscriptions: users manage their own
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can read own push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================================================
-- TRIGGER: Auto-create profile on auth.users insert
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    'PARK-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================================================
-- TRIGGER: Auto-update updated_at on profiles
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===========================================================================
-- FUNCTION: get_nearby_sightings (PostGIS spatial query)
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.get_nearby_sightings(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 1000
)
RETURNS SETOF public.enforcement_sightings AS $$
  SELECT *
  FROM public.enforcement_sightings
  WHERE expires_at > NOW()
    AND ST_DWithin(
      location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_meters
    )
  ORDER BY location <-> ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;
$$ LANGUAGE sql STABLE;

-- ===========================================================================
-- FUNCTION: get_nearby_meters (PostGIS spatial query)
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.get_nearby_meters(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 500
)
RETURNS SETOF public.meter_reports AS $$
  SELECT *
  FROM public.meter_reports
  WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_meters
  )
  ORDER BY created_at DESC;
$$ LANGUAGE sql STABLE;

-- ===========================================================================
-- Done. 16 tables, RLS on all, 2 triggers, 2 spatial functions.
-- ===========================================================================
