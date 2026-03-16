/**
 * Local storage implementation of the database layer.
 * Used when Supabase is not configured.
 */

import type {
  DBUser,
  DBParkingSession,
  DBHistoryItem,
  DBSavedLocation,
  DBCommunityReport,
  DBPhotoEvidence,
} from "./db-types"

const KEYS = {
  USER: "park_db_user",
  SESSIONS: "park_db_sessions",
  HISTORY: "park_db_history",
  SAVED_LOCATIONS: "park_db_saved_locations",
  COMMUNITY_REPORTS: "park_db_community_reports",
  PHOTO_EVIDENCE: "park_db_photo_evidence",
  ONBOARDING: "park_db_onboarding_complete",
}

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

export async function getLocalUser(): Promise<DBUser | null> {
  return safeGet<DBUser | null>(KEYS.USER, null)
}

export async function createLocalUser(email: string, name: string, password: string): Promise<DBUser> {
  const user: DBUser = {
    id: crypto.randomUUID(),
    email,
    name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    plan: "free",
    stats: { checks: 0, tickets_avoided: 0, money_saved: 0 },
    preferences: { notifications_enabled: true, city: "", handicap_enabled: false, biometric_enabled: false },
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

export async function updateLocalUserPreferences(prefs: Partial<DBUser["preferences"]>): Promise<void> {
  const user = await getLocalUser()
  if (!user) return
  await updateLocalUser({ preferences: { ...user.preferences, ...prefs } })
}

export async function getLocalActiveSessions(): Promise<DBParkingSession[]> {
  return safeGet<DBParkingSession[]>(KEYS.SESSIONS, []).filter((s) => !s.ended_at)
}

export async function getLocalActiveSession(): Promise<DBParkingSession | null> {
  const sessions = await getLocalActiveSessions()
  return sessions[0] || null
}

export async function createLocalSession(session: Omit<DBParkingSession, "id" | "user_id">): Promise<DBParkingSession> {
  const user = await getLocalUser()
  const newSession: DBParkingSession = {
    ...session,
    id: crypto.randomUUID(),
    user_id: user?.id || "anonymous",
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

export async function getLocalHistory(limit: number = 20): Promise<DBHistoryItem[]> {
  return safeGet<DBHistoryItem[]>(KEYS.HISTORY, []).slice(0, limit)
}

export async function addLocalHistoryItem(item: Omit<DBHistoryItem, "id" | "user_id">): Promise<DBHistoryItem> {
  const user = await getLocalUser()
  const newItem: DBHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    user_id: user?.id || "anonymous",
  }
  const history = safeGet<DBHistoryItem[]>(KEYS.HISTORY, [])
  history.unshift(newItem)
  safeSet(KEYS.HISTORY, history.slice(0, 100))
  return newItem
}

export async function clearLocalHistory(): Promise<void> {
  safeSet(KEYS.HISTORY, [])
}

export async function getLocalSavedLocations(): Promise<DBSavedLocation[]> {
  return safeGet<DBSavedLocation[]>(KEYS.SAVED_LOCATIONS, [])
}

export async function saveLocalLocation(location: Omit<DBSavedLocation, "id" | "user_id" | "created_at">): Promise<DBSavedLocation> {
  const user = await getLocalUser()
  const newLocation: DBSavedLocation = {
    ...location,
    id: crypto.randomUUID(),
    user_id: user?.id || "anonymous",
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

export async function getLocalCommunityReports(lat: number, lng: number, radiusKm: number = 1): Promise<DBCommunityReport[]> {
  const reports = safeGet<DBCommunityReport[]>(KEYS.COMMUNITY_REPORTS, [])
  const now = new Date()
  return reports.filter((r) => {
    if (r.expires_at && new Date(r.expires_at) < now) return false
    const latDiff = Math.abs(r.coordinates_lat - lat)
    const lngDiff = Math.abs(r.coordinates_lng - lng)
    const approxKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111
    return approxKm <= radiusKm
  })
}

export async function addLocalCommunityReport(
  report: Omit<DBCommunityReport, "id" | "user_id" | "created_at" | "upvotes" | "downvotes">
): Promise<DBCommunityReport> {
  const user = await getLocalUser()
  const newReport: DBCommunityReport = {
    ...report,
    id: crypto.randomUUID(),
    user_id: user?.id || "anonymous",
    created_at: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
  }
  const reports = safeGet<DBCommunityReport[]>(KEYS.COMMUNITY_REPORTS, [])
  reports.unshift(newReport)
  safeSet(KEYS.COMMUNITY_REPORTS, reports)
  return newReport
}

export async function voteLocalCommunityReport(reportId: string, vote: "up" | "down"): Promise<void> {
  const reports = safeGet<DBCommunityReport[]>(KEYS.COMMUNITY_REPORTS, [])
  const index = reports.findIndex((r) => r.id === reportId)
  if (index !== -1) {
    if (vote === "up") reports[index].upvotes++
    else reports[index].downvotes++
    safeSet(KEYS.COMMUNITY_REPORTS, reports)
  }
}

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
    user_id: user?.id || "anonymous",
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

export function isLocalOnboardingComplete(): boolean {
  return safeGet<boolean>(KEYS.ONBOARDING, false)
}

export function completeLocalOnboarding(): void {
  safeSet(KEYS.ONBOARDING, true)
}

export function resetLocalOnboarding(): void {
  safeSet(KEYS.ONBOARDING, false)
}

export function exportLocalAll(): Record<string, unknown> {
  return {
    user: safeGet(KEYS.USER, null),
    sessions: safeGet(KEYS.SESSIONS, []),
    history: safeGet(KEYS.HISTORY, []),
    savedLocations: safeGet(KEYS.SAVED_LOCATIONS, []),
    communityReports: safeGet(KEYS.COMMUNITY_REPORTS, []),
    photoEvidence: safeGet(KEYS.PHOTO_EVIDENCE, []),
    onboardingComplete: safeGet(KEYS.ONBOARDING, false),
  }
}

export function clearLocalAll(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
  localStorage.removeItem("park_db_users")
}
