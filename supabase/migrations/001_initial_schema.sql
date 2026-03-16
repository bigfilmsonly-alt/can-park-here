-- Park App: Initial Schema
-- Run this in your Supabase SQL Editor after creating a project.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles: extends auth.users with app-specific data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'fleet')),
  plan_expires_at TIMESTAMPTZ,
  stats JSONB NOT NULL DEFAULT '{"checks":0,"tickets_avoided":0,"money_saved":0}',
  preferences JSONB NOT NULL DEFAULT '{"notifications_enabled":true,"city":"","handicap_enabled":false,"biometric_enabled":false}',
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Parking sessions
CREATE TABLE public.parking_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_address TEXT NOT NULL,
  location_street TEXT NOT NULL,
  coordinates_lat DOUBLE PRECISION NOT NULL,
  coordinates_lng DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('allowed', 'restricted', 'prohibited')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  time_limit_minutes INT,
  is_protected BOOLEAN NOT NULL DEFAULT false,
  reminder_set BOOLEAN NOT NULL DEFAULT false
);

-- History
CREATE TABLE public.history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_address TEXT NOT NULL,
  location_street TEXT NOT NULL,
  coordinates_lat DOUBLE PRECISION NOT NULL,
  coordinates_lng DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('allowed', 'restricted', 'prohibited')),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  result_json TEXT NOT NULL
);

-- Saved locations
CREATE TABLE public.saved_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  coordinates_lat DOUBLE PRECISION NOT NULL,
  coordinates_lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community reports
CREATE TABLE public.community_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('enforcement', 'meter', 'issue')),
  subtype TEXT NOT NULL,
  coordinates_lat DOUBLE PRECISION NOT NULL,
  coordinates_lng DOUBLE PRECISION NOT NULL,
  address TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  upvotes INT NOT NULL DEFAULT 0,
  downvotes INT NOT NULL DEFAULT 0
);

-- Photo evidence
CREATE TABLE public.photo_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sign', 'meter', 'ticket', 'receipt')),
  photo_url TEXT NOT NULL,
  coordinates_lat DOUBLE PRECISION,
  coordinates_lng DOUBLE PRECISION,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_parking_sessions_user_active ON public.parking_sessions(user_id) WHERE ended_at IS NULL;
CREATE INDEX idx_history_user_checked ON public.history(user_id, checked_at DESC);
CREATE INDEX idx_community_reports_created ON public.community_reports(created_at DESC);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_evidence ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Sessions: users can CRUD own
CREATE POLICY sessions_all ON public.parking_sessions FOR ALL USING (auth.uid() = user_id);

-- History: users can CRUD own
CREATE POLICY history_all ON public.history FOR ALL USING (auth.uid() = user_id);

-- Saved locations: users can CRUD own
CREATE POLICY saved_locations_all ON public.saved_locations FOR ALL USING (auth.uid() = user_id);

-- Community reports: anyone can read, auth users can insert/update (vote)
CREATE POLICY community_reports_select ON public.community_reports FOR SELECT USING (true);
CREATE POLICY community_reports_insert ON public.community_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY community_reports_update ON public.community_reports FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Photo evidence: users can CRUD own
CREATE POLICY photo_evidence_all ON public.photo_evidence FOR ALL USING (auth.uid() = user_id);

