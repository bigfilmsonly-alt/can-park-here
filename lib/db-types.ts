/**
 * Database types matching the V2 schema (002_schema_upgrade.sql).
 * All geography columns are represented as latitude/longitude numbers.
 */

export interface DBUser {
  id: string
  email: string
  name: string | null
  tier: "free" | "pro" | "fleet"
  city: string
  checks_used: number
  checks_reset_at: string
  karma: number
  level: number
  streak: number
  longest_streak: number
  last_check_date: string | null
  referral_code: string | null
  referred_by: string | null
  handicap_enabled: boolean
  handicap_type: string | null
  vehicle_plate: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  stats: {
    checks: number
    ticketsAvoided: number
    moneySaved: number
  }
  accessibility: {
    highContrast: boolean
    largeText: boolean
    reducedMotion: boolean
    dyslexiaFont: boolean
    screenReaderMode: boolean
    language: string
  }
  onboarding_complete: boolean
  biometric_enabled: boolean
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

export interface DBParkingCheck {
  id: string
  user_id: string | null
  latitude: number
  longitude: number
  address: string
  street: string | null
  city: string | null
  status: "allowed" | "restricted" | "prohibited"
  result: Record<string, unknown>
  confidence: number | null
  created_at: string
}

export interface DBParkingSession {
  id: string
  user_id: string | null
  check_id: string | null
  latitude: number
  longitude: number
  address: string
  status: string
  result: Record<string, unknown>
  is_protected: boolean
  reminder_set: boolean
  reminder_time: string | null
  started_at: string
  ends_at: string | null
  ended_at: string | null
  is_active: boolean
}

export interface DBSubscription {
  id: string
  user_id: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  tier: string
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete"
  current_period_start: string | null
  current_period_end: string | null
  cancel_at: string | null
  created_at: string
  updated_at: string
}

export interface DBEnforcementSighting {
  id: string
  user_id: string | null
  type: "parking_officer" | "tow_truck" | "meter_maid" | "police"
  latitude: number
  longitude: number
  address: string | null
  notes: string | null
  upvotes: number
  downvotes: number
  expires_at: string
  created_at: string
}

export interface DBSightingVote {
  id: string
  sighting_id: string
  user_id: string
  vote: "up" | "down"
  created_at: string
}

export interface DBMeterReport {
  id: string
  user_id: string | null
  latitude: number
  longitude: number
  address: string | null
  status: "working" | "broken" | "card_only" | "coins_only" | "free"
  created_at: string
}

export interface DBPhotoEvidence {
  id: string
  user_id: string | null
  storage_path: string
  latitude: number | null
  longitude: number | null
  address: string | null
  tags: string[]
  notes: string | null
  created_at: string
}

export interface DBBadgeEarned {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
}

export interface DBSavedLocation {
  id: string
  user_id: string | null
  name: string | null
  address: string
  latitude: number
  longitude: number
  notes: string | null
  last_result: Record<string, unknown> | null
  created_at: string
}

export interface DBProtectionClaim {
  id: string
  user_id: string | null
  session_id: string | null
  ticket_amount: number | null
  ticket_photo_path: string | null
  ticket_number: string | null
  description: string | null
  status: "submitted" | "reviewing" | "approved" | "denied" | "paid"
  payout_amount: number | null
  resolved_at: string | null
  created_at: string
}

export interface DBFleetOrg {
  id: string
  name: string
  owner_id: string
  tier: "starter" | "professional" | "enterprise"
  stripe_subscription_id: string | null
  vehicle_limit: number
  created_at: string
}

export interface DBFleetVehicle {
  id: string
  org_id: string
  plate: string
  make: string | null
  model: string | null
  year: number | null
  driver_id: string | null
  created_at: string
}

export interface DBDataReport {
  id: string
  user_id: string | null
  latitude: number | null
  longitude: number | null
  address: string | null
  issue_type: string
  description: string
  photo_path: string | null
  status: string
  created_at: string
}

export interface DBReferral {
  id: string
  referrer_id: string
  referred_id: string
  code: string
  bonus_applied: boolean
  created_at: string
}
