/**
 * Local storage implementation of the database layer.
 * Used when Supabase is not configured.
 * Supports all 15 V2 schema tables.
 */

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

const KEYS = {
  USER: "park_db_user",
  PARKING_CHECKS: "park_db_parking_checks",
  SESSIONS: "park_db_sessions",
  SUBSCRIPTIONS: "park_db_subscriptions",
  SIGHTINGS: "park_db_sightings",
  SIGHTING_VOTES: "park_db_sighting_votes",
  METERS: "park_db_meters",
  PHOTO_EVIDENCE: "park_db_photo_evidence",
  BADGES: "park_db_badges",
  SAVED_LOCATIONS: "park_db_saved_locations",
  CLAIMS: "park_db_claims",
  FLEET_ORGS: "park_db_fleet_orgs",
  FLEET_VEHICLES: "park_db_fleet_vehicles",
  DATA_REPORTS: "park_db_data_reports",
  REFERRALS: "park_db_referrals",
  ONBOARDING: "park_db_onboarding_complete",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "park_app_salt_v1")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error("Failed to save to localStorage:", e)
  }
}

// ---------------------------------------------------------------------------
// 1. User
// ---------------------------------------------------------------------------

export async function getLocalUser(): Promise<DBUser | null> {
  return safeGet<DBUser | null>(KEYS.USER, null)
}

export async function createLocalUser(email: string, name: string, password: string): Promise<DBUser> {
  const user: DBUser = {
    id: crypto.randomUUID(),
    email,
    name,
    tier: "free",
    city: "san_francisco",
    checks_used: 0,
    checks_reset_at: new Date().toISOString(),
    karma: 0,
    level: 0,
    streak: 0,
    longest_streak: 0,
    last_check_date: null,
    referral_code: crypto.randomUUID().substring(0, 8).toUpperCase(),
    referred_by: null,
    handicap_enabled: false,
    handicap_type: null,
    vehicle_plate: null,
    vehicle_make: null,
    vehicle_model: null,
    stats: { checks: 0, ticketsAvoided: 0, moneySaved: 0 },
    accessibility: { highContrast: false, largeText: false, reducedMotion: false, dyslexiaFont: false, screenReaderMode: false, language: "en" },
    onboarding_complete: false,
    biometric_enabled: false,
    notifications_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const users = safeGet<Record<string, { user: DBUser; passwordHash: string }>>("park_db_users", {})
  users[email] = { user, passwordHash: await hashPassword(password) }
  safeSet("park_db_users", users)
  safeSet(KEYS.USER, user)
  return user
}

export async function signInLocal(email: string, password: string): Promise<DBUser | null> {
  const users = safeGet<Record<string, { user: DBUser; passwordHash: string }>>("park_db_users", {})
  const record = users[email]
  if (!record || record.passwordHash !== (await hashPassword(password))) return null
  record.user.updated_at = new Date().toISOString()
  users[email] = record
  safeSet("park_db_users", users)
  safeSet(KEYS.USER, record.user)
  return record.user
}

export async function signOutLocal(): Promise<void> {
  if (typeof window === "undefined") return
  localStorage.removeItem(KEYS.USER)
}

export async function updateLocalUser(updates: Partial<DBUser>): Promise<DBUser | null> {
  const user = await getLocalUser()
  if (!user) return null
  const updated = { ...user, ...updates, updated_at: new Date().toISOString() }
  safeSet(KEYS.USER, updated)
  const users = safeGet<Record<string, { user: DBUser; passwordHash: string }>>("park_db_users", {})
  if (users[user.email]) {
    users[user.email].user = updated
    safeSet("park_db_users", users)
  }
  return updated
}

export async function updateLocalUserStats(stat: keyof DBUser["stats"], increment: number = 1): Promise<void> {
  const user = await getLocalUser()
  if (!user) return
  user.stats[stat] += increment
  await updateLocalUser({ stats: user.stats })
}

// ---------------------------------------------------------------------------
// 2. Parking Checks
// ---------------------------------------------------------------------------

export async function addLocalParkingCheck(
  check: Omit<DBParkingCheck, "id" | "user_id" | "created_at">
): Promise<DBParkingCheck> {
  const user = await getLocalUser()
  const newCheck: DBParkingCheck = {
    ...check,
    id: crypto.randomUUID(),
    user_id: user?.id ?? null,
    created_at: new Date().toISOString(),
  }
  const checks = safeGet<DBParkingCheck[]>(KEYS.PARKING_CHECKS, [])
  checks.unshift(newCheck)
  safeSet(KEYS.PARKING_CHECKS, checks.slice(0, 500))
  return newCheck
}

export async function getLocalParkingChecks(limit: number = 20): Promise<DBParkingCheck[]> {
  return safeGet<DBParkingCheck[]>(KEYS.PARKING_CHECKS, []).slice(0, limit)
}

// ---------------------------------------------------------------------------
// 3. Sessions
// ---------------------------------------------------------------------------

export async function getLocalActiveSessions(): Promise<DBParkingSession[]> {
  return safeGet<DBParkingSession[]>(KEYS.SESSIONS, []).filter((s) => s.is_active)
}

export async function getLocalActiveSession(): Promise<DBParkingSession | null> {
  const sessions = await getLocalActiveSessions()
  return sessions[0] || null
}

export async function createLocalSession(
  session: Omit<DBParkingSession, "id" | "user_id">
): Promise<DBParkingSession> {
  const user = await getLocalUser()
  const newSession: DBParkingSession = {
    ...session,
    id: crypto.randomUUID(),
    user_id: user?.id ?? null,
  }
  const sessions = safeGet<DBParkingSession[]>(KEYS.SESSIONS, [])
  sessions.unshift(newSession)
  safeSet(KEYS.SESSIONS, sessions)
  return newSession
}

export async function endLocalSession(sessionId: string): Promise<void> {
  const sessions = safeGet<DBParkingSession[]>(KEYS.SESSIONS, [])
  const index = sessions.findIndex((s) => s.id === sessionId)
  if (index !== -1) {
    sessions[index].ended_at = new Date().toISOString()
    sessions[index].is_active = false
    safeSet(KEYS.SESSIONS, sessions)
  }
}

export async function updateLocalSession(sessionId: string, updates: Partial<DBParkingSession>): Promise<void> {
  const sessions = safeGet<DBParkingSession[]>(KEYS.SESSIONS, [])
  const index = sessions.findIndex((s) => s.id === sessionId)
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...updates }
    safeSet(KEYS.SESSIONS, sessions)
  }
}

// ---------------------------------------------------------------------------
// 4. Subscriptions
// ---------------------------------------------------------------------------

export async function getLocalSubscription(): Promise<DBSubscription | null> {
  const user = await getLocalUser()
  if (!user) return null
  const subs = safeGet<DBSubscription[]>(KEYS.SUBSCRIPTIONS, [])
  return subs.find((s) => s.user_id === user.id) ?? null
}

export async function updateLocalSubscription(updates: Partial<DBSubscription>): Promise<DBSubscription | null> {
  const user = await getLocalUser()
  if (!user) return null
  const subs = safeGet<DBSubscription[]>(KEYS.SUBSCRIPTIONS, [])
  const index = subs.findIndex((s) => s.user_id === user.id)
  if (index !== -1) {
    subs[index] = { ...subs[index], ...updates, updated_at: new Date().toISOString() }
    safeSet(KEYS.SUBSCRIPTIONS, subs)
    return subs[index]
  }
  // Create a new subscription record if none exists
  const newSub: DBSubscription = {
    id: crypto.randomUUID(),
    user_id: user.id,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    tier: "free",
    status: "active",
    current_period_start: null,
    current_period_end: null,
    cancel_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...updates,
  }
  subs.push(newSub)
  safeSet(KEYS.SUBSCRIPTIONS, subs)
  return newSub
}

// ---------------------------------------------------------------------------
// 5. Sightings (Enforcement)
// ---------------------------------------------------------------------------

export async function getLocalNearbySightings(
  lat: number,
  lng: number,
  radiusKm: number = 1
): Promise<DBEnforcementSighting[]> {
  const sightings = safeGet<DBEnforcementSighting[]>(KEYS.SIGHTINGS, [])
  const now = new Date()
  const latDelta = radiusKm / 111
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))
  return sightings.filter((s) => {
    if (new Date(s.expires_at) < now) return false
    return (
      Math.abs(s.latitude - lat) <= latDelta &&
      Math.abs(s.longitude - lng) <= lngDelta
    )
  })
}

export async function addLocalSighting(
  sighting: Omit<DBEnforcementSighting, "id" | "user_id" | "upvotes" | "downvotes" | "created_at">
): Promise<DBEnforcementSighting> {
  const user = await getLocalUser()
  const newSighting: DBEnforcementSighting = {
    ...sighting,
    id: crypto.randomUUID(),
    user_id: user?.id ?? null,
    upvotes: 0,
    downvotes: 0,
    created_at: new Date().toISOString(),
  }
  const sightings = safeGet<DBEnforcementSighting[]>(KEYS.SIGHTINGS, [])
  sightings.unshift(newSighting)
  safeSet(KEYS.SIGHTINGS, sightings)
  return newSighting
}

// ---------------------------------------------------------------------------
// 6. Sighting Votes
// ---------------------------------------------------------------------------

export async function voteLocalSighting(sightingId: string, vote: "up" | "down"): Promise<void> {
  const user = await getLocalUser()
  const userId = user?.id ?? "anonymous"

  // Record the vote
  const votes = safeGet<DBSightingVote[]>(KEYS.SIGHTING_VOTES, [])
  const existing = votes.findIndex((v) => v.sighting_id === sightingId && v.user_id === userId)
  if (existing !== -1) {
    // User already voted; update their vote
    votes[existing].vote = vote
  } else {
    votes.push({
      id: crypto.randomUUID(),
      sighting_id: sightingId,
      user_id: userId,
      vote,
      created_at: new Date().toISOString(),
    })
  }
  safeSet(KEYS.SIGHTING_VOTES, votes)

  // Update upvotes/downvotes on the sighting itself
  const sightings = safeGet<DBEnforcementSighting[]>(KEYS.SIGHTINGS, [])
  const index = sightings.findIndex((s) => s.id === sightingId)
  if (index !== -1) {
    if (vote === "up") sightings[index].upvotes++
    else sightings[index].downvotes++
    safeSet(KEYS.SIGHTINGS, sightings)
  }
}

// ---------------------------------------------------------------------------
// 7. Meters
// ---------------------------------------------------------------------------

export async function getLocalNearbyMeters(
  lat: number,
  lng: number,
  radiusKm: number = 1
): Promise<DBMeterReport[]> {
  const meters = safeGet<DBMeterReport[]>(KEYS.METERS, [])
  const latDelta = radiusKm / 111
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))
  return meters.filter((m) =>
    Math.abs(m.latitude - lat) <= latDelta &&
    Math.abs(m.longitude - lng) <= lngDelta
  )
}

export async function addLocalMeterReport(
  report: Omit<DBMeterReport, "id" | "user_id" | "created_at">
): Promise<DBMeterReport> {
  const user = await getLocalUser()
  const newReport: DBMeterReport = {
    ...report,
    id: crypto.randomUUID(),
    user_id: user?.id ?? null,
    created_at: new Date().toISOString(),
  }
  const meters = safeGet<DBMeterReport[]>(KEYS.METERS, [])
  meters.unshift(newReport)
  safeSet(KEYS.METERS, meters)
  return newReport
}

// ---------------------------------------------------------------------------
// 8. Photos
// ---------------------------------------------------------------------------

export async function getLocalPhotoEvidence(): Promise<DBPhotoEvidence[]> {
  return safeGet<DBPhotoEvidence[]>(KEYS.PHOTO_EVIDENCE, [])
}

export async function addLocalPhotoEvidence(
  evidence: Omit<DBPhotoEvidence, "id" | "user_id" | "created_at">
): Promise<DBPhotoEvidence> {
  const user = await getLocalUser()
  const newEvidence: DBPhotoEvidence = {
    ...evidence,
    id: crypto.randomUUID(),
    user_id: user?.id ?? null,
    created_at: new Date().toISOString(),
  }
  const photos = safeGet<DBPhotoEvidence[]>(KEYS.PHOTO_EVIDENCE, [])
  photos.unshift(newEvidence)
  safeSet(KEYS.PHOTO_EVIDENCE, photos)
  return newEvidence
}

export async function deleteLocalPhotoEvidence(evidenceId: string): Promise<void> {
  const photos = safeGet<DBPhotoEvidence[]>(KEYS.PHOTO_EVIDENCE, [])
  safeSet(KEYS.PHOTO_EVIDENCE, photos.filter((p) => p.id !== evidenceId))
}

// ---------------------------------------------------------------------------
// 9. Badges
// ---------------------------------------------------------------------------

export async function getLocalBadges(): Promise<DBBadgeEarned[]> {
  const user = await getLocalUser()
  if (!user) return []
  return safeGet<DBBadgeEarned[]>(KEYS.BADGES, []).filter((b) => b.user_id === user.id)
}

export async function addLocalBadge(badgeId: string): Promise<DBBadgeEarned> {
  const user = await getLocalUser()
  const badge: DBBadgeEarned = {
    id: crypto.randomUUID(),
    user_id: user?.id ?? "anonymous",
    badge_id: badgeId,
    earned_at: new Date().toISOString(),
  }
  const badges = safeGet<DBBadgeEarned[]>(KEYS.BADGES, [])
  badges.push(badge)
  safeSet(KEYS.BADGES, badges)
  return badge
}

// ---------------------------------------------------------------------------
// 10. Saved Locations
// ---------------------------------------------------------------------------

export async function getLocalSavedLocations(): Promise<DBSavedLocation[]> {
  return safeGet<DBSavedLocation[]>(KEYS.SAVED_LOCATIONS, [])
}

export async function saveLocalLocation(
  location: Omit<DBSavedLocation, "id" | "user_id" | "created_at">
): Promise<DBSavedLocation> {
  const user = await getLocalUser()
  const newLocation: DBSavedLocation = {
    ...location,
    id: crypto.randomUUID(),
    user_id: user?.id ?? null,
    created_at: new Date().toISOString(),
  }
  const locations = safeGet<DBSavedLocation[]>(KEYS.SAVED_LOCATIONS, [])
  locations.push(newLocation)
  safeSet(KEYS.SAVED_LOCATIONS, locations)
  return newLocation
}

export async function removeLocalSavedLocation(locationId: string): Promise<void> {
  const locations = safeGet<DBSavedLocation[]>(KEYS.SAVED_LOCATIONS, [])
  safeSet(KEYS.SAVED_LOCATIONS, locations.filter((l) => l.id !== locationId))
}

// ---------------------------------------------------------------------------
// 11. Claims (Protection)
// ---------------------------------------------------------------------------

export async function getLocalClaims(): Promise<DBProtectionClaim[]> {
  const user = await getLocalUser()
  if (!user) return []
  return safeGet<DBProtectionClaim[]>(KEYS.CLAIMS, []).filter((c) => c.user_id === user.id)
}

export async function addLocalClaim(
  claim: Omit<DBProtectionClaim, "id" | "user_id" | "status" | "payout_amount" | "resolved_at" | "created_at">
): Promise<DBProtectionClaim> {
  const user = await getLocalUser()
  const newClaim: DBProtectionClaim = {
    ...claim,
    id: crypto.randomUUID(),
    user_id: user?.id ?? null,
    status: "submitted",
    payout_amount: null,
    resolved_at: null,
    created_at: new Date().toISOString(),
  }
  const claims = safeGet<DBProtectionClaim[]>(KEYS.CLAIMS, [])
  claims.unshift(newClaim)
  safeSet(KEYS.CLAIMS, claims)
  return newClaim
}

// ---------------------------------------------------------------------------
// 12. Fleet
// ---------------------------------------------------------------------------

export async function getLocalFleetOrg(): Promise<DBFleetOrg | null> {
  const user = await getLocalUser()
  if (!user) return null
  const orgs = safeGet<DBFleetOrg[]>(KEYS.FLEET_ORGS, [])
  return orgs.find((o) => o.owner_id === user.id) ?? null
}

export async function getLocalFleetVehicles(orgId: string): Promise<DBFleetVehicle[]> {
  return safeGet<DBFleetVehicle[]>(KEYS.FLEET_VEHICLES, []).filter((v) => v.org_id === orgId)
}

export async function addLocalFleetVehicle(
  vehicle: Omit<DBFleetVehicle, "id" | "created_at">
): Promise<DBFleetVehicle> {
  const newVehicle: DBFleetVehicle = {
    ...vehicle,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }
  const vehicles = safeGet<DBFleetVehicle[]>(KEYS.FLEET_VEHICLES, [])
  vehicles.push(newVehicle)
  safeSet(KEYS.FLEET_VEHICLES, vehicles)
  return newVehicle
}

export async function removeLocalFleetVehicle(vehicleId: string): Promise<void> {
  const vehicles = safeGet<DBFleetVehicle[]>(KEYS.FLEET_VEHICLES, [])
  safeSet(KEYS.FLEET_VEHICLES, vehicles.filter((v) => v.id !== vehicleId))
}

// ---------------------------------------------------------------------------
// 13. Data Reports
// ---------------------------------------------------------------------------

export async function addLocalDataReport(
  report: Omit<DBDataReport, "id" | "user_id" | "status" | "created_at">
): Promise<DBDataReport> {
  const user = await getLocalUser()
  const newReport: DBDataReport = {
    ...report,
    id: crypto.randomUUID(),
    user_id: user?.id ?? null,
    status: "pending",
    created_at: new Date().toISOString(),
  }
  const reports = safeGet<DBDataReport[]>(KEYS.DATA_REPORTS, [])
  reports.unshift(newReport)
  safeSet(KEYS.DATA_REPORTS, reports)
  return newReport
}

// ---------------------------------------------------------------------------
// 14. Referrals
// ---------------------------------------------------------------------------

export async function getLocalReferrals(): Promise<DBReferral[]> {
  const user = await getLocalUser()
  if (!user) return []
  return safeGet<DBReferral[]>(KEYS.REFERRALS, []).filter((r) => r.referrer_id === user.id)
}

export async function addLocalReferral(
  referral: Omit<DBReferral, "id" | "bonus_applied" | "created_at">
): Promise<DBReferral> {
  const newReferral: DBReferral = {
    ...referral,
    id: crypto.randomUUID(),
    bonus_applied: false,
    created_at: new Date().toISOString(),
  }
  const referrals = safeGet<DBReferral[]>(KEYS.REFERRALS, [])
  referrals.push(newReferral)
  safeSet(KEYS.REFERRALS, referrals)
  return newReferral
}

// ---------------------------------------------------------------------------
// 15. Onboarding
// ---------------------------------------------------------------------------

export function isLocalOnboardingComplete(): boolean {
  return safeGet<boolean>(KEYS.ONBOARDING, false)
}

export function completeLocalOnboarding(): void {
  safeSet(KEYS.ONBOARDING, true)
}

export function resetLocalOnboarding(): void {
  safeSet(KEYS.ONBOARDING, false)
}

// ---------------------------------------------------------------------------
// 16. Export / Clear
// ---------------------------------------------------------------------------

export function exportLocalAll(): Record<string, unknown> {
  return {
    user: safeGet(KEYS.USER, null),
    parkingChecks: safeGet(KEYS.PARKING_CHECKS, []),
    sessions: safeGet(KEYS.SESSIONS, []),
    subscriptions: safeGet(KEYS.SUBSCRIPTIONS, []),
    sightings: safeGet(KEYS.SIGHTINGS, []),
    sightingVotes: safeGet(KEYS.SIGHTING_VOTES, []),
    meters: safeGet(KEYS.METERS, []),
    photoEvidence: safeGet(KEYS.PHOTO_EVIDENCE, []),
    badges: safeGet(KEYS.BADGES, []),
    savedLocations: safeGet(KEYS.SAVED_LOCATIONS, []),
    claims: safeGet(KEYS.CLAIMS, []),
    fleetOrgs: safeGet(KEYS.FLEET_ORGS, []),
    fleetVehicles: safeGet(KEYS.FLEET_VEHICLES, []),
    dataReports: safeGet(KEYS.DATA_REPORTS, []),
    referrals: safeGet(KEYS.REFERRALS, []),
    onboardingComplete: safeGet(KEYS.ONBOARDING, false),
  }
}

export function clearLocalAll(): void {
  if (typeof window === "undefined") return
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
  localStorage.removeItem("park_db_users")
}
