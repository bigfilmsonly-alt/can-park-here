/**
 * Database types shared across db implementations.
 */

export interface DBUser {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
  plan: "free" | "pro" | "fleet"
  plan_expires_at?: string
  stats: {
    checks: number
    tickets_avoided: number
    money_saved: number
  }
  preferences: {
    notifications_enabled: boolean
    city: string
    handicap_enabled: boolean
    handicap_placard_type?: string
    biometric_enabled: boolean
  }
}

export interface DBParkingSession {
  id: string
  user_id: string
  location_address: string
  location_street: string
  coordinates_lat: number
  coordinates_lng: number
  status: "allowed" | "restricted" | "prohibited"
  started_at: string
  ended_at?: string
  time_limit_minutes?: number
  is_protected: boolean
  reminder_set: boolean
}

export interface DBHistoryItem {
  id: string
  user_id: string
  location_address: string
  location_street: string
  coordinates_lat: number
  coordinates_lng: number
  status: "allowed" | "restricted" | "prohibited"
  checked_at: string
  result_json: string
}

export interface DBSavedLocation {
  id: string
  user_id: string
  name: string
  address: string
  coordinates_lat: number
  coordinates_lng: number
  created_at: string
}

export interface DBCommunityReport {
  id: string
  user_id: string
  type: "enforcement" | "meter" | "issue"
  subtype: string
  coordinates_lat: number
  coordinates_lng: number
  address?: string
  description?: string
  created_at: string
  expires_at?: string
  upvotes: number
  downvotes: number
}

export interface DBPhotoEvidence {
  id: string
  user_id: string
  type: "sign" | "meter" | "ticket" | "receipt"
  photo_url: string
  coordinates_lat?: number
  coordinates_lng?: number
  address?: string
  notes?: string
  created_at: string
}
