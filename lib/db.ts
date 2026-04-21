/**
 * Database Layer — Direct Supabase calls with sync cache for hydration.
 *
 * Async functions hit Supabase. Sync versions return the in-memory cache
 * (populated on auth state change via refreshCache). This avoids waterfalls
 * during initial render while keeping data fresh.
 */

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
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

export type {
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

function sb() {
  return createClient()
}

async function uid(): Promise<string | null> {
  const { data: { user } } = await sb().auth.getUser()
  return user?.id ?? null
}

async function requireUid(): Promise<string> {
  const id = await uid()
  if (!id) throw new Error("Not authenticated")
  return id
}

// ---------------------------------------------------------------------------
// Cache — populated on auth state change, read synchronously during render
// ---------------------------------------------------------------------------

let _userCache: DBUser | null = null
let _sessionCache: DBParkingSession | null = null
let _onboardingCache: boolean = false

export function dbGetUserSync(): DBUser | null {
  return _userCache
}

export function dbGetActiveSessionSync(): DBParkingSession | null {
  return _sessionCache
}

export function dbIsOnboardingComplete(): boolean {
  return _onboardingCache
}

/** Call on auth state change to warm all caches. */
export async function refreshCache(): Promise<void> {
  if (!isSupabaseConfigured()) return
  _userCache = await dbGetUser()
  _sessionCache = await dbGetActiveSession()
  _onboardingCache = _userCache?.onboarding_complete ?? false
}

export function clearCache(): void {
  _userCache = null
  _sessionCache = null
  _onboardingCache = false
}

// ===========================================================================
// USER
// ===========================================================================

export async function dbGetUser(): Promise<DBUser | null> {
  if (!isSupabaseConfigured()) return null
  const { data: { user } } = await sb().auth.getUser()
  if (!user) return null
  const { data } = await sb().from("profiles").select("*").eq("id", user.id).single()
  if (data) _userCache = data as DBUser
  return data as DBUser | null
}

export async function dbUpdateUser(updates: Partial<DBUser>): Promise<DBUser | null> {
  const id = await requireUid()
  const { data } = await sb()
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single()
  if (data) _userCache = data as DBUser
  return data as DBUser | null
}

export async function dbUpdateUserStats(
  stat: keyof DBUser["stats"],
  increment: number = 1,
): Promise<void> {
  const user = _userCache ?? await dbGetUser()
  if (!user) return
  const stats = { ...user.stats, [stat]: (user.stats[stat] ?? 0) + increment }
  await dbUpdateUser({ stats } as Partial<DBUser>)
}

// ===========================================================================
// AUTH (Supabase Auth handles sign-up/sign-in; these are thin wrappers)
// ===========================================================================

export async function dbSignOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    await sb().auth.signOut()
  }
  clearCache()
}

export async function dbCompleteOnboarding(): Promise<void> {
  _onboardingCache = true
  await dbUpdateUser({ onboarding_complete: true } as Partial<DBUser>)
}

export async function dbResetOnboarding(): Promise<void> {
  _onboardingCache = false
  await dbUpdateUser({ onboarding_complete: false } as Partial<DBUser>)
}

// ===========================================================================
// PARKING CHECKS
// ===========================================================================

export async function dbAddParkingCheck(
  check: Omit<DBParkingCheck, "id" | "user_id" | "created_at">,
): Promise<DBParkingCheck> {
  const id = await requireUid()
  const { data, error } = await sb()
    .from("parking_checks")
    .insert({ ...check, user_id: id })
    .select("*")
    .single()
  if (error) throw error
  return data as DBParkingCheck
}

export async function dbGetParkingChecks(limit: number = 20): Promise<DBParkingCheck[]> {
  const id = await uid()
  if (!id) return []
  const { data } = await sb()
    .from("parking_checks")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(limit)
  return (data ?? []) as DBParkingCheck[]
}

// ===========================================================================
// PARKING SESSIONS
// ===========================================================================

export async function dbGetActiveSessions(): Promise<DBParkingSession[]> {
  const id = await uid()
  if (!id) return []
  const { data } = await sb()
    .from("parking_sessions")
    .select("*")
    .eq("user_id", id)
    .eq("is_active", true)
    .order("started_at", { ascending: false })
  return (data ?? []) as DBParkingSession[]
}

export async function dbGetActiveSession(): Promise<DBParkingSession | null> {
  const id = await uid()
  if (!id) return null
  const { data } = await sb()
    .from("parking_sessions")
    .select("*")
    .eq("user_id", id)
    .eq("is_active", true)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (data) _sessionCache = data as DBParkingSession
  return data as DBParkingSession | null
}

export async function dbCreateSession(
  session: Omit<DBParkingSession, "id" | "user_id">,
): Promise<DBParkingSession> {
  const id = await requireUid()
  const { data, error } = await sb()
    .from("parking_sessions")
    .insert({ ...session, user_id: id })
    .select("*")
    .single()
  if (error) throw error
  _sessionCache = data as DBParkingSession
  return data as DBParkingSession
}

export async function dbEndSession(sessionId: string): Promise<void> {
  await sb()
    .from("parking_sessions")
    .update({ is_active: false, ended_at: new Date().toISOString() })
    .eq("id", sessionId)
  _sessionCache = null
}

export async function dbUpdateSession(
  sessionId: string,
  updates: Partial<DBParkingSession>,
): Promise<void> {
  const { data } = await sb()
    .from("parking_sessions")
    .update(updates)
    .eq("id", sessionId)
    .select("*")
    .single()
  if (data && (data as DBParkingSession).is_active) {
    _sessionCache = data as DBParkingSession
  }
}

// ===========================================================================
// SUBSCRIPTIONS
// ===========================================================================

export async function dbGetSubscription(): Promise<DBSubscription | null> {
  const id = await uid()
  if (!id) return null
  const { data } = await sb()
    .from("subscriptions")
    .select("*")
    .eq("user_id", id)
    .in("status", ["active", "trialing"])
    .limit(1)
    .maybeSingle()
  return data as DBSubscription | null
}

export async function dbUpdateSubscription(
  updates: Partial<DBSubscription>,
): Promise<void> {
  const id = await requireUid()
  await sb()
    .from("subscriptions")
    .update(updates)
    .eq("user_id", id)
}

// ===========================================================================
// ENFORCEMENT SIGHTINGS (PostGIS spatial queries)
// ===========================================================================

export async function dbGetNearbySightings(
  lat: number,
  lng: number,
  radiusKm: number = 1,
): Promise<DBEnforcementSighting[]> {
  // Use the PostGIS function from schema
  const { data } = await sb().rpc("get_nearby_sightings", {
    lat,
    lng,
    radius_meters: radiusKm * 1000,
  })
  return (data ?? []) as DBEnforcementSighting[]
}

export async function dbAddSighting(
  sighting: Omit<DBEnforcementSighting, "id" | "user_id" | "upvotes" | "downvotes" | "created_at">,
): Promise<DBEnforcementSighting> {
  const id = await requireUid()
  const { data, error } = await sb()
    .from("enforcement_sightings")
    .insert({ ...sighting, user_id: id })
    .select("*")
    .single()
  if (error) throw error
  return data as DBEnforcementSighting
}

export async function dbVoteSighting(
  sightingId: string,
  vote: "up" | "down",
): Promise<void> {
  const id = await requireUid()

  // Upsert the vote
  await sb()
    .from("sighting_votes")
    .upsert(
      { sighting_id: sightingId, user_id: id, vote },
      { onConflict: "sighting_id,user_id" },
    )

  // Update the denormalized count
  const column = vote === "up" ? "upvotes" : "downvotes"
  const { data: sighting } = await sb()
    .from("enforcement_sightings")
    .select(column)
    .eq("id", sightingId)
    .single()

  if (sighting) {
    await sb()
      .from("enforcement_sightings")
      .update({ [column]: ((sighting as Record<string, number>)[column] ?? 0) + 1 })
      .eq("id", sightingId)
  }
}

// ===========================================================================
// METER REPORTS
// ===========================================================================

export async function dbGetNearbyMeters(
  lat: number,
  lng: number,
  radiusKm: number = 0.5,
): Promise<DBMeterReport[]> {
  const { data } = await sb().rpc("get_nearby_meters", {
    lat,
    lng,
    radius_meters: radiusKm * 1000,
  })
  return (data ?? []) as DBMeterReport[]
}

export async function dbAddMeterReport(
  report: Omit<DBMeterReport, "id" | "user_id" | "created_at">,
): Promise<DBMeterReport> {
  const id = await requireUid()
  const { data, error } = await sb()
    .from("meter_reports")
    .insert({ ...report, user_id: id })
    .select("*")
    .single()
  if (error) throw error
  return data as DBMeterReport
}

// ===========================================================================
// PHOTO EVIDENCE
// ===========================================================================

export async function dbGetPhotoEvidence(): Promise<DBPhotoEvidence[]> {
  const id = await uid()
  if (!id) return []
  const { data } = await sb()
    .from("photo_evidence")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
  return (data ?? []) as DBPhotoEvidence[]
}

export async function dbAddPhotoEvidence(
  evidence: Omit<DBPhotoEvidence, "id" | "user_id" | "created_at">,
): Promise<DBPhotoEvidence> {
  const id = await requireUid()
  const { data, error } = await sb()
    .from("photo_evidence")
    .insert({ ...evidence, user_id: id })
    .select("*")
    .single()
  if (error) throw error
  return data as DBPhotoEvidence
}

export async function dbDeletePhotoEvidence(evidenceId: string): Promise<void> {
  await sb().from("photo_evidence").delete().eq("id", evidenceId)
}

// ===========================================================================
// BADGES
// ===========================================================================

export async function dbGetBadges(): Promise<DBBadgeEarned[]> {
  const id = await uid()
  if (!id) return []
  const { data } = await sb()
    .from("badges_earned")
    .select("*")
    .eq("user_id", id)
    .order("earned_at", { ascending: false })
  return (data ?? []) as DBBadgeEarned[]
}

export async function dbAddBadge(
  badge: Omit<DBBadgeEarned, "id" | "earned_at">,
): Promise<DBBadgeEarned> {
  const { data, error } = await sb()
    .from("badges_earned")
    .upsert(badge, { onConflict: "user_id,badge_id" })
    .select("*")
    .single()
  if (error) throw error
  return data as DBBadgeEarned
}

// ===========================================================================
// SAVED LOCATIONS
// ===========================================================================

export async function dbGetSavedLocations(): Promise<DBSavedLocation[]> {
  const id = await uid()
  if (!id) return []
  const { data } = await sb()
    .from("saved_locations")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
  return (data ?? []) as DBSavedLocation[]
}

export async function dbSaveLocation(
  location: Omit<DBSavedLocation, "id" | "user_id" | "created_at">,
): Promise<DBSavedLocation> {
  const id = await requireUid()
  const { data, error } = await sb()
    .from("saved_locations")
    .insert({ ...location, user_id: id })
    .select("*")
    .single()
  if (error) throw error
  return data as DBSavedLocation
}

export async function dbRemoveSavedLocation(locationId: string): Promise<void> {
  await sb().from("saved_locations").delete().eq("id", locationId)
}

// ===========================================================================
// PROTECTION CLAIMS
// ===========================================================================

export async function dbGetClaims(): Promise<DBProtectionClaim[]> {
  const id = await uid()
  if (!id) return []
  const { data } = await sb()
    .from("protection_claims")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
  return (data ?? []) as DBProtectionClaim[]
}

export async function dbAddClaim(
  claim: Omit<DBProtectionClaim, "id" | "user_id" | "created_at">,
): Promise<DBProtectionClaim> {
  const id = await requireUid()
  const { data, error } = await sb()
    .from("protection_claims")
    .insert({ ...claim, user_id: id })
    .select("*")
    .single()
  if (error) throw error
  return data as DBProtectionClaim
}

// ===========================================================================
// FLEET
// ===========================================================================

export async function dbGetFleetOrg(): Promise<DBFleetOrg | null> {
  const id = await uid()
  if (!id) return null
  const { data } = await sb()
    .from("fleet_orgs")
    .select("*")
    .eq("owner_id", id)
    .limit(1)
    .maybeSingle()
  return data as DBFleetOrg | null
}

export async function dbGetFleetVehicles(orgId: string): Promise<DBFleetVehicle[]> {
  const { data } = await sb()
    .from("fleet_vehicles")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
  return (data ?? []) as DBFleetVehicle[]
}

export async function dbAddFleetVehicle(
  vehicle: Omit<DBFleetVehicle, "id" | "created_at">,
): Promise<DBFleetVehicle> {
  const { data, error } = await sb()
    .from("fleet_vehicles")
    .insert(vehicle)
    .select("*")
    .single()
  if (error) throw error
  return data as DBFleetVehicle
}

export async function dbRemoveFleetVehicle(vehicleId: string): Promise<void> {
  await sb().from("fleet_vehicles").delete().eq("id", vehicleId)
}

// ===========================================================================
// DATA REPORTS
// ===========================================================================

export async function dbAddDataReport(
  report: Omit<DBDataReport, "id" | "user_id" | "created_at">,
): Promise<DBDataReport> {
  const id = await requireUid()
  const { data, error } = await sb()
    .from("data_reports")
    .insert({ ...report, user_id: id })
    .select("*")
    .single()
  if (error) throw error
  return data as DBDataReport
}

// ===========================================================================
// REFERRALS
// ===========================================================================

export async function dbGetReferrals(): Promise<DBReferral[]> {
  const id = await uid()
  if (!id) return []
  const { data } = await sb()
    .from("referrals")
    .select("*")
    .or(`referrer_id.eq.${id},referred_id.eq.${id}`)
    .order("created_at", { ascending: false })
  return (data ?? []) as DBReferral[]
}

export async function dbAddReferral(
  referral: Omit<DBReferral, "id" | "created_at">,
): Promise<DBReferral> {
  const { data, error } = await sb()
    .from("referrals")
    .insert(referral)
    .select("*")
    .single()
  if (error) throw error
  return data as DBReferral
}

// ===========================================================================
// EXPORT / CLEAR
// ===========================================================================

export async function dbExportAll() {
  const id = await uid()
  if (!id) return null
  const [user, checks, sessions, photos, badges, saved, claims] = await Promise.all([
    dbGetUser(),
    dbGetParkingChecks(100),
    dbGetActiveSessions(),
    dbGetPhotoEvidence(),
    dbGetBadges(),
    dbGetSavedLocations(),
    dbGetClaims(),
  ])
  return { user, parkingChecks: checks, sessions, photos, badges, savedLocations: saved, claims }
}

export async function dbClearAll(): Promise<void> {
  const id = await uid()
  if (!id) return
  await Promise.all([
    sb().from("parking_checks").delete().eq("user_id", id),
    sb().from("parking_sessions").delete().eq("user_id", id),
    sb().from("photo_evidence").delete().eq("user_id", id),
    sb().from("badges_earned").delete().eq("user_id", id),
    sb().from("saved_locations").delete().eq("user_id", id),
    sb().from("data_reports").delete().eq("user_id", id),
  ])
  clearCache()
}
