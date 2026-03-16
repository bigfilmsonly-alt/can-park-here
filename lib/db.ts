/**
 * Database Abstraction Layer
 * 
 * Currently uses localStorage for persistence.
 * Structured for easy migration to Supabase/PostgreSQL.
 * 
 * To migrate to Supabase:
 * 1. Install @supabase/supabase-js
 * 2. Replace localStorage calls with supabase client calls
 * 3. Update async methods to use real API calls
 */

// Types that mirror database schema
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

// Storage keys
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

// Helper to safely parse JSON from localStorage
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

// ============================================
// USER OPERATIONS
// ============================================

export async function dbGetUser(): Promise<DBUser | null> {
  return safeGet<DBUser | null>(KEYS.USER, null)
}

export async function dbCreateUser(email: string, name: string, password: string): Promise<DBUser> {
  // TODO: Replace with Supabase Auth in production (server-side bcrypt)
  const user: DBUser = {
    id: crypto.randomUUID(),
    email,
    name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    plan: "free",
    stats: {
      checks: 0,
      tickets_avoided: 0,
      money_saved: 0,
    },
    preferences: {
      notifications_enabled: true,
      city: "",
      handicap_enabled: false,
      biometric_enabled: false,
    },
  }
  
  const users = safeGet<Record<string, { user: DBUser; passwordHash: string }>>("park_db_users", {})
  users[email] = { user, passwordHash: await hashPassword(password) }
  safeSet("park_db_users", users)
  safeSet(KEYS.USER, user)
  
  return user
}

export async function dbSignIn(email: string, password: string): Promise<DBUser | null> {
  // TODO: Replace with Supabase Auth in production
  const users = safeGet<Record<string, { user: DBUser; passwordHash: string }>>("park_db_users", {})
  const record = users[email]
  
  if (!record) return null
  if (record.passwordHash !== await hashPassword(password)) return null
  
  record.user.updated_at = new Date().toISOString()
  users[email] = record
  safeSet("park_db_users", users)
  safeSet(KEYS.USER, record.user)
  
  return record.user
}

export async function dbSignOut(): Promise<void> {
  localStorage.removeItem(KEYS.USER)
}

export async function dbUpdateUser(updates: Partial<DBUser>): Promise<DBUser | null> {
  const user = await dbGetUser()
  if (!user) return null
  
  const updated = { ...user, ...updates, updated_at: new Date().toISOString() }
  safeSet(KEYS.USER, updated)
  
  // Also update in users collection
  const users = safeGet<Record<string, { user: DBUser; passwordHash: string }>>("park_db_users", {})
  if (users[user.email]) {
    users[user.email].user = updated
    safeSet("park_db_users", users)
  }
  
  return updated
}

export async function dbUpdateUserStats(stat: keyof DBUser["stats"], increment: number = 1): Promise<void> {
  const user = await dbGetUser()
  if (!user) return
  
  user.stats[stat] += increment
  await dbUpdateUser({ stats: user.stats })
}

export async function dbUpdateUserPreferences(prefs: Partial<DBUser["preferences"]>): Promise<void> {
  const user = await dbGetUser()
  if (!user) return
  
  await dbUpdateUser({ preferences: { ...user.preferences, ...prefs } })
}

// ============================================
// PARKING SESSIONS
// ============================================

export async function dbGetActiveSessions(): Promise<DBParkingSession[]> {
  const sessions = safeGet<DBParkingSession[]>(KEYS.SESSIONS, [])
  return sessions.filter((s) => !s.ended_at)
}

export async function dbGetActiveSession(): Promise<DBParkingSession | null> {
  const sessions = await dbGetActiveSessions()
  return sessions[0] || null
}

export async function dbCreateSession(session: Omit<DBParkingSession, "id" | "user_id">): Promise<DBParkingSession> {
  const user = await dbGetUser()
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

export async function dbEndSession(sessionId: string): Promise<void> {
  const sessions = safeGet<DBParkingSession[]>(KEYS.SESSIONS, [])
  const index = sessions.findIndex((s) => s.id === sessionId)
  
  if (index !== -1) {
    sessions[index].ended_at = new Date().toISOString()
    safeSet(KEYS.SESSIONS, sessions)
  }
}

export async function dbUpdateSession(sessionId: string, updates: Partial<DBParkingSession>): Promise<void> {
  const sessions = safeGet<DBParkingSession[]>(KEYS.SESSIONS, [])
  const index = sessions.findIndex((s) => s.id === sessionId)
  
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...updates }
    safeSet(KEYS.SESSIONS, sessions)
  }
}

// ============================================
// HISTORY
// ============================================

export async function dbGetHistory(limit: number = 20): Promise<DBHistoryItem[]> {
  const history = safeGet<DBHistoryItem[]>(KEYS.HISTORY, [])
  return history.slice(0, limit)
}

export async function dbAddHistoryItem(item: Omit<DBHistoryItem, "id" | "user_id">): Promise<DBHistoryItem> {
  const user = await dbGetUser()
  const newItem: DBHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    user_id: user?.id || "anonymous",
  }
  
  const history = safeGet<DBHistoryItem[]>(KEYS.HISTORY, [])
  history.unshift(newItem)
  
  // Keep only last 100 items
  safeSet(KEYS.HISTORY, history.slice(0, 100))
  
  return newItem
}

export async function dbClearHistory(): Promise<void> {
  safeSet(KEYS.HISTORY, [])
}

// ============================================
// SAVED LOCATIONS
// ============================================

export async function dbGetSavedLocations(): Promise<DBSavedLocation[]> {
  return safeGet<DBSavedLocation[]>(KEYS.SAVED_LOCATIONS, [])
}

export async function dbSaveLocation(location: Omit<DBSavedLocation, "id" | "user_id" | "created_at">): Promise<DBSavedLocation> {
  const user = await dbGetUser()
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

export async function dbRemoveSavedLocation(locationId: string): Promise<void> {
  const locations = safeGet<DBSavedLocation[]>(KEYS.SAVED_LOCATIONS, [])
  safeSet(KEYS.SAVED_LOCATIONS, locations.filter((l) => l.id !== locationId))
}

// ============================================
// COMMUNITY REPORTS
// ============================================

export async function dbGetCommunityReports(lat: number, lng: number, radiusKm: number = 1): Promise<DBCommunityReport[]> {
  const reports = safeGet<DBCommunityReport[]>(KEYS.COMMUNITY_REPORTS, [])
  const now = new Date()
  
  // Filter by location (approximate) and not expired
  return reports.filter((r) => {
    // Check expiry
    if (r.expires_at && new Date(r.expires_at) < now) return false
    
    // Simple distance check (not accurate but good enough for demo)
    const latDiff = Math.abs(r.coordinates_lat - lat)
    const lngDiff = Math.abs(r.coordinates_lng - lng)
    const approxKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111 // rough conversion
    
    return approxKm <= radiusKm
  })
}

export async function dbAddCommunityReport(report: Omit<DBCommunityReport, "id" | "user_id" | "created_at" | "upvotes" | "downvotes">): Promise<DBCommunityReport> {
  const user = await dbGetUser()
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

export async function dbVoteCommunityReport(reportId: string, vote: "up" | "down"): Promise<void> {
  const reports = safeGet<DBCommunityReport[]>(KEYS.COMMUNITY_REPORTS, [])
  const index = reports.findIndex((r) => r.id === reportId)
  
  if (index !== -1) {
    if (vote === "up") {
      reports[index].upvotes++
    } else {
      reports[index].downvotes++
    }
    safeSet(KEYS.COMMUNITY_REPORTS, reports)
  }
}

// ============================================
// PHOTO EVIDENCE
// ============================================

export async function dbGetPhotoEvidence(): Promise<DBPhotoEvidence[]> {
  return safeGet<DBPhotoEvidence[]>(KEYS.PHOTO_EVIDENCE, [])
}

export async function dbAddPhotoEvidence(evidence: Omit<DBPhotoEvidence, "id" | "user_id" | "created_at">): Promise<DBPhotoEvidence> {
  const user = await dbGetUser()
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

export async function dbDeletePhotoEvidence(evidenceId: string): Promise<void> {
  const photos = safeGet<DBPhotoEvidence[]>(KEYS.PHOTO_EVIDENCE, [])
  safeSet(KEYS.PHOTO_EVIDENCE, photos.filter((p) => p.id !== evidenceId))
}

// ============================================
// ONBOARDING
// ============================================

export function dbIsOnboardingComplete(): boolean {
  return safeGet<boolean>(KEYS.ONBOARDING, false)
}

export function dbCompleteOnboarding(): void {
  safeSet(KEYS.ONBOARDING, true)
}

export function dbResetOnboarding(): void {
  safeSet(KEYS.ONBOARDING, false)
}

// ============================================
// DATA EXPORT (for debugging/migration)
// ============================================

export function dbExportAll(): Record<string, unknown> {
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

export function dbClearAll(): void {
  Object.values(KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
  localStorage.removeItem("park_db_users")
}
