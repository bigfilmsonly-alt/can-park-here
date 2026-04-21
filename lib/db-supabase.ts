/**
 * Supabase implementation of the database layer.
 * Matches the V2 schema (002_schema_upgrade.sql).
 *
 * Geography columns are excluded from selects to avoid WKB hex.
 * Spatial queries use RPC functions instead of bounding-box math.
 */

import { createClient } from "@/lib/supabase/client"
import type {
  DBUser,
  DBParkingCheck,
  DBParkingSession,
  DBSubscription,
  DBEnforcementSighting,
  DBSightingVote,
  DBMeterReport,
  DBPhotoEvidence,
  DBBadgeEarned,
  DBSavedLocation,
  DBProtectionClaim,
  DBFleetOrg,
  DBFleetVehicle,
  DBDataReport,
  DBReferral,
} from "./db-types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ONBOARDING_CACHE_KEY = "park_onboarding_complete"

/** Column lists that exclude the `location` geography column. */
const PARKING_CHECK_COLS =
  "id, user_id, latitude, longitude, address, street, city, status, result, confidence, created_at"

const SESSION_COLS =
  "id, user_id, check_id, latitude, longitude, address, status, result, is_protected, reminder_set, reminder_time, started_at, ends_at, ended_at, is_active"

const SIGHTING_COLS =
  "id, user_id, type, latitude, longitude, address, notes, upvotes, downvotes, expires_at, created_at"

const METER_COLS =
  "id, user_id, latitude, longitude, address, status, created_at"

const PHOTO_COLS =
  "id, user_id, storage_path, latitude, longitude, address, tags, notes, created_at"

const SAVED_LOCATION_COLS =
  "id, user_id, name, address, latitude, longitude, notes, last_result, created_at"

const DATA_REPORT_COLS =
  "id, user_id, latitude, longitude, address, issue_type, description, photo_path, status, created_at"

// ---------------------------------------------------------------------------
// 1. User / Profile
// ---------------------------------------------------------------------------

export async function getSupabaseUser(): Promise<DBUser | null> {
  const supabase = createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single()

  if (!profile) return null

  if (typeof window !== "undefined" && profile.onboarding_complete) {
    try {
      localStorage.setItem(ONBOARDING_CACHE_KEY, "1")
    } catch {
      /* ignore */
    }
  }

  return profile as DBUser
}

export async function updateSupabaseUser(
  updates: Partial<DBUser>,
): Promise<DBUser | null> {
  const supabase = createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) return null

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.name !== undefined) payload.name = updates.name
  if (updates.tier !== undefined) payload.tier = updates.tier
  if (updates.city !== undefined) payload.city = updates.city
  if (updates.karma !== undefined) payload.karma = updates.karma
  if (updates.level !== undefined) payload.level = updates.level
  if (updates.streak !== undefined) payload.streak = updates.streak
  if (updates.longest_streak !== undefined)
    payload.longest_streak = updates.longest_streak
  if (updates.last_check_date !== undefined)
    payload.last_check_date = updates.last_check_date
  if (updates.referral_code !== undefined)
    payload.referral_code = updates.referral_code
  if (updates.referred_by !== undefined)
    payload.referred_by = updates.referred_by
  if (updates.handicap_enabled !== undefined)
    payload.handicap_enabled = updates.handicap_enabled
  if (updates.handicap_type !== undefined)
    payload.handicap_type = updates.handicap_type
  if (updates.vehicle_plate !== undefined)
    payload.vehicle_plate = updates.vehicle_plate
  if (updates.vehicle_make !== undefined)
    payload.vehicle_make = updates.vehicle_make
  if (updates.vehicle_model !== undefined)
    payload.vehicle_model = updates.vehicle_model
  if (updates.stats !== undefined) payload.stats = updates.stats
  if (updates.accessibility !== undefined)
    payload.accessibility = updates.accessibility
  if (updates.onboarding_complete !== undefined)
    payload.onboarding_complete = updates.onboarding_complete
  if (updates.biometric_enabled !== undefined)
    payload.biometric_enabled = updates.biometric_enabled
  if (updates.notifications_enabled !== undefined)
    payload.notifications_enabled = updates.notifications_enabled
  if (updates.checks_used !== undefined)
    payload.checks_used = updates.checks_used
  if (updates.checks_reset_at !== undefined)
    payload.checks_reset_at = updates.checks_reset_at

  const { data } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", authUser.id)
    .select()
    .single()

  return data ? (data as DBUser) : null
}

export async function updateSupabaseUserStats(
  stat: keyof DBUser["stats"],
  increment: number = 1,
): Promise<void> {
  const user = await getSupabaseUser()
  if (!user) return
  const stats = { ...user.stats, [stat]: user.stats[stat] + increment }
  await updateSupabaseUser({ stats })
}

// ---------------------------------------------------------------------------
// 2. Parking Checks (replaces history)
// ---------------------------------------------------------------------------

export async function addSupabaseParkingCheck(
  check: Omit<DBParkingCheck, "id" | "user_id" | "created_at">,
): Promise<DBParkingCheck> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { data, error } = await supabase
    .from("parking_checks")
    .insert({
      user_id: user.id,
      latitude: check.latitude,
      longitude: check.longitude,
      address: check.address,
      street: check.street,
      city: check.city,
      status: check.status,
      result: check.result,
      confidence: check.confidence,
    })
    .select(PARKING_CHECK_COLS)
    .single()

  if (error) throw new Error(error.message)
  return data as DBParkingCheck
}

export async function getSupabaseParkingChecks(
  limit: number = 20,
): Promise<DBParkingCheck[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("parking_checks")
    .select(PARKING_CHECK_COLS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  return (data ?? []) as DBParkingCheck[]
}

// ---------------------------------------------------------------------------
// 3. Sessions
// ---------------------------------------------------------------------------

export async function getSupabaseActiveSessions(): Promise<DBParkingSession[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("parking_sessions")
    .select(SESSION_COLS)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("started_at", { ascending: false })

  return (data ?? []) as DBParkingSession[]
}

export async function getSupabaseActiveSession(): Promise<DBParkingSession | null> {
  const sessions = await getSupabaseActiveSessions()
  return sessions[0] ?? null
}

export async function createSupabaseSession(
  session: Omit<DBParkingSession, "id" | "user_id">,
): Promise<DBParkingSession> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required to start a parking session")

  const { data, error } = await supabase
    .from("parking_sessions")
    .insert({
      user_id: user.id,
      check_id: session.check_id,
      latitude: session.latitude,
      longitude: session.longitude,
      address: session.address,
      status: session.status,
      result: session.result,
      is_protected: session.is_protected,
      reminder_set: session.reminder_set,
      reminder_time: session.reminder_time,
      started_at: session.started_at,
      ends_at: session.ends_at,
      ended_at: session.ended_at,
      is_active: session.is_active,
    })
    .select(SESSION_COLS)
    .single()

  if (error) throw new Error(error.message)
  return data as DBParkingSession
}

export async function endSupabaseSession(sessionId: string): Promise<void> {
  const supabase = createClient()
  await supabase
    .from("parking_sessions")
    .update({ ended_at: new Date().toISOString(), is_active: false })
    .eq("id", sessionId)
}

export async function updateSupabaseSession(
  sessionId: string,
  updates: Partial<DBParkingSession>,
): Promise<void> {
  const supabase = createClient()
  const payload: Record<string, unknown> = {}
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.result !== undefined) payload.result = updates.result
  if (updates.is_protected !== undefined)
    payload.is_protected = updates.is_protected
  if (updates.reminder_set !== undefined)
    payload.reminder_set = updates.reminder_set
  if (updates.reminder_time !== undefined)
    payload.reminder_time = updates.reminder_time
  if (updates.ends_at !== undefined) payload.ends_at = updates.ends_at
  if (updates.ended_at !== undefined) payload.ended_at = updates.ended_at
  if (updates.is_active !== undefined) payload.is_active = updates.is_active

  await supabase.from("parking_sessions").update(payload).eq("id", sessionId)
}

// ---------------------------------------------------------------------------
// 4. Subscriptions
// ---------------------------------------------------------------------------

export async function getSupabaseSubscription(): Promise<DBSubscription | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return data ? (data as DBSubscription) : null
}

export async function updateSupabaseSubscription(
  updates: Partial<DBSubscription>,
): Promise<DBSubscription | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (updates.stripe_customer_id !== undefined)
    payload.stripe_customer_id = updates.stripe_customer_id
  if (updates.stripe_subscription_id !== undefined)
    payload.stripe_subscription_id = updates.stripe_subscription_id
  if (updates.tier !== undefined) payload.tier = updates.tier
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.current_period_start !== undefined)
    payload.current_period_start = updates.current_period_start
  if (updates.current_period_end !== undefined)
    payload.current_period_end = updates.current_period_end
  if (updates.cancel_at !== undefined) payload.cancel_at = updates.cancel_at

  const { data } = await supabase
    .from("subscriptions")
    .update(payload)
    .eq("user_id", user.id)
    .select()
    .single()

  return data ? (data as DBSubscription) : null
}

// ---------------------------------------------------------------------------
// 5. Enforcement Sightings
// ---------------------------------------------------------------------------

export async function getSupabaseNearbySightings(
  lat: number,
  lng: number,
  radiusMeters: number = 1000,
): Promise<DBEnforcementSighting[]> {
  const supabase = createClient()
  const { data } = await supabase.rpc("get_nearby_sightings", {
    user_lat: lat,
    user_lng: lng,
    radius_meters: radiusMeters,
  })

  return (data ?? []) as DBEnforcementSighting[]
}

export async function addSupabaseSighting(
  sighting: Omit<
    DBEnforcementSighting,
    "id" | "user_id" | "upvotes" | "downvotes" | "created_at"
  >,
): Promise<DBEnforcementSighting> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { data, error } = await supabase
    .from("enforcement_sightings")
    .insert({
      user_id: user.id,
      type: sighting.type,
      latitude: sighting.latitude,
      longitude: sighting.longitude,
      address: sighting.address,
      notes: sighting.notes,
      expires_at: sighting.expires_at,
    })
    .select(SIGHTING_COLS)
    .single()

  if (error) throw new Error(error.message)
  return data as DBEnforcementSighting
}

// ---------------------------------------------------------------------------
// 6. Sighting Votes
// ---------------------------------------------------------------------------

export async function voteSupabaseSighting(
  sightingId: string,
  vote: "up" | "down",
): Promise<void> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { error } = await supabase.rpc("vote_on_sighting", {
    p_sighting_id: sightingId,
    p_vote: vote,
  })

  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------------------
// 7. Meter Reports
// ---------------------------------------------------------------------------

export async function getSupabaseNearbyMeters(
  lat: number,
  lng: number,
  radiusMeters: number = 1000,
): Promise<DBMeterReport[]> {
  const supabase = createClient()
  const { data } = await supabase.rpc("get_nearby_meters", {
    user_lat: lat,
    user_lng: lng,
    radius_meters: radiusMeters,
  })

  return (data ?? []) as DBMeterReport[]
}

export async function addSupabaseMeterReport(
  report: Omit<DBMeterReport, "id" | "user_id" | "created_at">,
): Promise<DBMeterReport> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { data, error } = await supabase
    .from("meter_reports")
    .insert({
      user_id: user.id,
      latitude: report.latitude,
      longitude: report.longitude,
      address: report.address,
      status: report.status,
    })
    .select(METER_COLS)
    .single()

  if (error) throw new Error(error.message)
  return data as DBMeterReport
}

// ---------------------------------------------------------------------------
// 8. Photo Evidence
// ---------------------------------------------------------------------------

export async function getSupabasePhotoEvidence(): Promise<DBPhotoEvidence[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("photo_evidence")
    .select(PHOTO_COLS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (data ?? []) as DBPhotoEvidence[]
}

export async function addSupabasePhotoEvidence(
  evidence: Omit<DBPhotoEvidence, "id" | "user_id" | "created_at">,
): Promise<DBPhotoEvidence> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { data, error } = await supabase
    .from("photo_evidence")
    .insert({
      user_id: user.id,
      storage_path: evidence.storage_path,
      latitude: evidence.latitude,
      longitude: evidence.longitude,
      address: evidence.address,
      tags: evidence.tags,
      notes: evidence.notes,
    })
    .select(PHOTO_COLS)
    .single()

  if (error) throw new Error(error.message)
  return data as DBPhotoEvidence
}

export async function deleteSupabasePhotoEvidence(
  evidenceId: string,
): Promise<void> {
  const supabase = createClient()
  await supabase.from("photo_evidence").delete().eq("id", evidenceId)
}

// ---------------------------------------------------------------------------
// 9. Badges
// ---------------------------------------------------------------------------

export async function getSupabaseBadges(): Promise<DBBadgeEarned[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("badges_earned")
    .select("*")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })

  return (data ?? []) as DBBadgeEarned[]
}

export async function addSupabaseBadge(badgeId: string): Promise<DBBadgeEarned> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { data, error } = await supabase
    .from("badges_earned")
    .insert({
      user_id: user.id,
      badge_id: badgeId,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as DBBadgeEarned
}

// ---------------------------------------------------------------------------
// 10. Saved Locations
// ---------------------------------------------------------------------------

export async function getSupabaseSavedLocations(): Promise<DBSavedLocation[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("saved_locations")
    .select(SAVED_LOCATION_COLS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (data ?? []) as DBSavedLocation[]
}

export async function saveSupabaseLocation(
  location: Omit<DBSavedLocation, "id" | "user_id" | "created_at">,
): Promise<DBSavedLocation> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { data, error } = await supabase
    .from("saved_locations")
    .insert({
      user_id: user.id,
      name: location.name,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      notes: location.notes,
      last_result: location.last_result,
    })
    .select(SAVED_LOCATION_COLS)
    .single()

  if (error) throw new Error(error.message)
  return data as DBSavedLocation
}

export async function removeSupabaseSavedLocation(
  locationId: string,
): Promise<void> {
  const supabase = createClient()
  await supabase.from("saved_locations").delete().eq("id", locationId)
}

// ---------------------------------------------------------------------------
// 11. Protection Claims
// ---------------------------------------------------------------------------

export async function getSupabaseClaims(): Promise<DBProtectionClaim[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("protection_claims")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (data ?? []) as DBProtectionClaim[]
}

export async function addSupabaseClaim(
  claim: Omit<
    DBProtectionClaim,
    "id" | "user_id" | "status" | "payout_amount" | "resolved_at" | "created_at"
  >,
): Promise<DBProtectionClaim> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { data, error } = await supabase
    .from("protection_claims")
    .insert({
      user_id: user.id,
      session_id: claim.session_id,
      ticket_amount: claim.ticket_amount,
      ticket_photo_path: claim.ticket_photo_path,
      ticket_number: claim.ticket_number,
      description: claim.description,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as DBProtectionClaim
}

// ---------------------------------------------------------------------------
// 12. Fleet
// ---------------------------------------------------------------------------

export async function getSupabaseFleetOrg(): Promise<DBFleetOrg | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("fleet_orgs")
    .select("*")
    .eq("owner_id", user.id)
    .single()

  return data ? (data as DBFleetOrg) : null
}

export async function getSupabaseFleetVehicles(
  orgId: string,
): Promise<DBFleetVehicle[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("fleet_vehicles")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })

  return (data ?? []) as DBFleetVehicle[]
}

export async function addSupabaseFleetVehicle(
  vehicle: Omit<DBFleetVehicle, "id" | "created_at">,
): Promise<DBFleetVehicle> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { data, error } = await supabase
    .from("fleet_vehicles")
    .insert({
      org_id: vehicle.org_id,
      plate: vehicle.plate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      driver_id: vehicle.driver_id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as DBFleetVehicle
}

export async function removeSupabaseFleetVehicle(
  vehicleId: string,
): Promise<void> {
  const supabase = createClient()
  await supabase.from("fleet_vehicles").delete().eq("id", vehicleId)
}

// ---------------------------------------------------------------------------
// 13. Data Reports
// ---------------------------------------------------------------------------

export async function addSupabaseDataReport(
  report: Omit<DBDataReport, "id" | "user_id" | "status" | "created_at">,
): Promise<DBDataReport> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { data, error } = await supabase
    .from("data_reports")
    .insert({
      user_id: user.id,
      latitude: report.latitude,
      longitude: report.longitude,
      address: report.address,
      issue_type: report.issue_type,
      description: report.description,
      photo_path: report.photo_path,
    })
    .select(DATA_REPORT_COLS)
    .single()

  if (error) throw new Error(error.message)
  return data as DBDataReport
}

// ---------------------------------------------------------------------------
// 14. Referrals
// ---------------------------------------------------------------------------

export async function getSupabaseReferrals(): Promise<DBReferral[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false })

  return (data ?? []) as DBReferral[]
}

export async function addSupabaseReferral(
  referral: Omit<DBReferral, "id" | "bonus_applied" | "created_at">,
): Promise<DBReferral> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Sign in required")

  const { data, error } = await supabase
    .from("referrals")
    .insert({
      referrer_id: referral.referrer_id,
      referred_id: referral.referred_id,
      code: referral.code,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as DBReferral
}

// ---------------------------------------------------------------------------
// 15. Onboarding
// ---------------------------------------------------------------------------

export async function completeSupabaseOnboarding(): Promise<void> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from("profiles")
    .update({ onboarding_complete: true })
    .eq("id", user.id)

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ONBOARDING_CACHE_KEY, "1")
    } catch {
      /* ignore */
    }
  }
}

export async function resetSupabaseOnboarding(): Promise<void> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from("profiles")
    .update({ onboarding_complete: false })
    .eq("id", user.id)

  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(ONBOARDING_CACHE_KEY)
    } catch {
      /* ignore */
    }
  }
}

export function getSupabaseOnboardingCompleteSync(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(ONBOARDING_CACHE_KEY) === "1"
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// 16. Export / Clear
// ---------------------------------------------------------------------------

export async function exportSupabaseAll(): Promise<Record<string, unknown>> {
  const supabase = createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) return {}

  const [
    user,
    parkingChecks,
    sessions,
    subscription,
    photoEvidence,
    badges,
    savedLocations,
    claims,
    referrals,
  ] = await Promise.all([
    getSupabaseUser(),
    getSupabaseParkingChecks(100),
    getSupabaseActiveSessions(),
    getSupabaseSubscription(),
    getSupabasePhotoEvidence(),
    getSupabaseBadges(),
    getSupabaseSavedLocations(),
    getSupabaseClaims(),
    getSupabaseReferrals(),
  ])

  return {
    user,
    parkingChecks,
    sessions,
    subscription,
    photoEvidence,
    badges,
    savedLocations,
    claims,
    referrals,
    onboardingComplete: user?.onboarding_complete ?? false,
  }
}

export async function clearSupabaseAll(): Promise<void> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await Promise.all([
    supabase.from("parking_sessions").delete().eq("user_id", user.id),
    supabase.from("parking_checks").delete().eq("user_id", user.id),
    supabase.from("saved_locations").delete().eq("user_id", user.id),
    supabase.from("photo_evidence").delete().eq("user_id", user.id),
    supabase.from("enforcement_sightings").delete().eq("user_id", user.id),
    supabase.from("meter_reports").delete().eq("user_id", user.id),
    supabase.from("badges_earned").delete().eq("user_id", user.id),
    supabase.from("protection_claims").delete().eq("user_id", user.id),
    supabase.from("data_reports").delete().eq("user_id", user.id),
    supabase.from("referrals").delete().eq("referrer_id", user.id),
  ])

  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(ONBOARDING_CACHE_KEY)
    } catch {
      /* ignore */
    }
  }
}
