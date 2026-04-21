-- 002_schema_upgrade.sql
-- Major schema upgrade: PostGIS, 15 tables, expanded features
-- Replaces the V1 schema from 001_initial_schema.sql

-- ============================================================
-- 1. DROP V1 TABLES
-- ============================================================
DROP TABLE IF EXISTS public.photo_evidence CASCADE;
DROP TABLE IF EXISTS public.community_reports CASCADE;
DROP TABLE IF EXISTS public.saved_locations CASCADE;
DROP TABLE IF EXISTS public.history CASCADE;
DROP TABLE IF EXISTS public.parking_sessions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================================
-- 2. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- 3. HELPER: auto-compute geography from lat/lng columns
-- ============================================================
CREATE OR REPLACE FUNCTION public.compute_location_geography()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_MakePoint(NEW.longitude, NEW.latitude)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. TABLES
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'fleet')),
  city TEXT DEFAULT 'san_francisco',
  checks_used INTEGER DEFAULT 0,
  checks_reset_at TIMESTAMPTZ DEFAULT NOW(),
  karma INTEGER DEFAULT 0,
  level INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_check_date DATE,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  handicap_enabled BOOLEAN DEFAULT FALSE,
  handicap_type TEXT,
  vehicle_plate TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  stats JSONB DEFAULT '{"checks":0,"ticketsAvoided":0,"moneySaved":0}'::jsonb,
  accessibility JSONB DEFAULT '{"highContrast":false,"largeText":false,"reducedMotion":false,"dyslexiaFont":false,"screenReaderMode":false,"language":"en"}'::jsonb,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  biometric_enabled BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parking checks
CREATE TABLE public.parking_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  address TEXT NOT NULL,
  street TEXT,
  city TEXT,
  status TEXT NOT NULL CHECK (status IN ('allowed','restricted','prohibited')),
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_parking_checks_geo BEFORE INSERT OR UPDATE ON public.parking_checks
  FOR EACH ROW EXECUTE FUNCTION public.compute_location_geography();

CREATE INDEX idx_checks_user ON public.parking_checks(user_id, created_at DESC);
CREATE INDEX idx_checks_location ON public.parking_checks USING GIST(location);

-- Parking sessions
CREATE TABLE public.parking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_id UUID REFERENCES public.parking_checks(id),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  address TEXT NOT NULL,
  status TEXT NOT NULL,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_protected BOOLEAN DEFAULT FALSE,
  reminder_set BOOLEAN DEFAULT FALSE,
  reminder_time TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TRIGGER trg_parking_sessions_geo BEFORE INSERT OR UPDATE ON public.parking_sessions
  FOR EACH ROW EXECUTE FUNCTION public.compute_location_geography();

CREATE INDEX idx_sessions_active ON public.parking_sessions(user_id) WHERE is_active = TRUE;

-- Subscriptions (Stripe sync)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','canceled','past_due','trialing','incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enforcement sightings (community)
CREATE TABLE public.enforcement_sightings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('parking_officer','tow_truck','meter_maid','police')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  notes TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_sightings_geo BEFORE INSERT OR UPDATE ON public.enforcement_sightings
  FOR EACH ROW EXECUTE FUNCTION public.compute_location_geography();

CREATE INDEX idx_sightings_location ON public.enforcement_sightings USING GIST(location);
CREATE INDEX idx_sightings_active ON public.enforcement_sightings(expires_at) WHERE expires_at > NOW();

-- Sighting votes
CREATE TABLE public.sighting_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sighting_id UUID REFERENCES public.enforcement_sightings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('up','down')),
  UNIQUE(sighting_id, user_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meter reports
CREATE TABLE public.meter_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  status TEXT NOT NULL CHECK (status IN ('working','broken','card_only','coins_only','free')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_meters_geo BEFORE INSERT OR UPDATE ON public.meter_reports
  FOR EACH ROW EXECUTE FUNCTION public.compute_location_geography();

CREATE INDEX idx_meters_location ON public.meter_reports USING GIST(location);

-- Photo evidence
CREATE TABLE public.photo_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_photos_geo BEFORE INSERT OR UPDATE ON public.photo_evidence
  FOR EACH ROW EXECUTE FUNCTION public.compute_location_geography();

-- Badges earned
CREATE TABLE public.badges_earned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Saved locations
CREATE TABLE public.saved_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  notes TEXT,
  last_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_saved_locations_geo BEFORE INSERT OR UPDATE ON public.saved_locations
  FOR EACH ROW EXECUTE FUNCTION public.compute_location_geography();

-- Protection claims
CREATE TABLE public.protection_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.parking_sessions(id),
  ticket_amount DECIMAL(10,2),
  ticket_photo_path TEXT,
  ticket_number TEXT,
  description TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','reviewing','approved','denied','paid')),
  payout_amount DECIMAL(10,2),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fleet orgs
CREATE TABLE public.fleet_orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT DEFAULT 'starter' CHECK (tier IN ('starter','professional','enterprise')),
  stripe_subscription_id TEXT,
  vehicle_limit INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fleet vehicles
CREATE TABLE public.fleet_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.fleet_orgs(id) ON DELETE CASCADE,
  plate TEXT NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  driver_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data issue reports
CREATE TABLE public.data_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_path TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_data_reports_geo BEFORE INSERT OR UPDATE ON public.data_reports
  FOR EACH ROW EXECUTE FUNCTION public.compute_location_geography();

-- Referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  bonus_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================
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

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================
CREATE POLICY "own_profile_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own_profile_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "own_checks" ON public.parking_checks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_sessions" ON public.parking_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "view_active_sightings" ON public.enforcement_sightings FOR SELECT USING (expires_at > NOW());
CREATE POLICY "insert_sightings" ON public.enforcement_sightings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_sighting_votes" ON public.sighting_votes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "view_meters" ON public.meter_reports FOR SELECT USING (TRUE);
CREATE POLICY "insert_meters" ON public.meter_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_saved" ON public.saved_locations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_photos" ON public.photo_evidence FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_badges" ON public.badges_earned FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_claims" ON public.protection_claims FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_fleet_org" ON public.fleet_orgs FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "fleet_vehicles_org_owner" ON public.fleet_vehicles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.fleet_orgs WHERE id = org_id AND owner_id = auth.uid()));
CREATE POLICY "own_data_reports" ON public.data_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- ============================================================
-- 7. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 8. SPATIAL QUERY FUNCTIONS
-- ============================================================

-- Nearby enforcement sightings
CREATE OR REPLACE FUNCTION get_nearby_sightings(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 1609
) RETURNS TABLE (
  id UUID, type TEXT, latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
  address TEXT, notes TEXT, upvotes INTEGER, downvotes INTEGER,
  distance_meters DOUBLE PRECISION, created_at TIMESTAMPTZ, expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY SELECT s.id, s.type,
    s.latitude, s.longitude,
    s.address, s.notes, s.upvotes, s.downvotes,
    ST_Distance(s.location, ST_MakePoint(user_lng, user_lat)::geography),
    s.created_at, s.expires_at
  FROM public.enforcement_sightings s
  WHERE s.expires_at > NOW()
    AND ST_DWithin(s.location, ST_MakePoint(user_lng, user_lat)::geography, radius_meters)
  ORDER BY 9 ASC;
END;
$$ LANGUAGE plpgsql;

-- Nearby meter reports
CREATE OR REPLACE FUNCTION get_nearby_meters(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 1609
) RETURNS TABLE (
  id UUID, latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
  address TEXT, status TEXT, distance_meters DOUBLE PRECISION, created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY SELECT m.id,
    m.latitude, m.longitude,
    m.address, m.status,
    ST_Distance(m.location, ST_MakePoint(user_lng, user_lat)::geography),
    m.created_at
  FROM public.meter_reports m
  WHERE ST_DWithin(m.location, ST_MakePoint(user_lng, user_lat)::geography, radius_meters)
  ORDER BY 6 ASC;
END;
$$ LANGUAGE plpgsql;

-- Update sighting vote counts (atomic)
CREATE OR REPLACE FUNCTION vote_on_sighting(
  p_sighting_id UUID,
  p_vote TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.sighting_votes (sighting_id, user_id, vote)
  VALUES (p_sighting_id, auth.uid(), p_vote)
  ON CONFLICT (sighting_id, user_id) DO UPDATE SET vote = p_vote;

  UPDATE public.enforcement_sightings SET
    upvotes = (SELECT COUNT(*) FROM public.sighting_votes WHERE sighting_id = p_sighting_id AND vote = 'up'),
    downvotes = (SELECT COUNT(*) FROM public.sighting_votes WHERE sighting_id = p_sighting_id AND vote = 'down')
  WHERE id = p_sighting_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
