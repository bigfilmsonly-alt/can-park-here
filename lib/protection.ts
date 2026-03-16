/**
 * Protection & Sessions Layer
 * Uses the database abstraction layer for persistence.
 */

import {
  dbGetUser,
  dbGetActiveSession,
  dbCreateSession,
  dbEndSession,
  dbUpdateSession,
  dbUpdateUserStats,
  type DBParkingSession,
} from "./db"

export interface ProtectionSession {
  id: string
  locationAddress: string
  locationStreet: string
  coordinates: { lat: number; lng: number }
  startTime: Date
  endTime: Date | null
  maxDuration: number
  status: "active" | "completed" | "expired" | "ticketed"
  reminder: {
    enabled: boolean
    scheduledFor: Date | null
    sent: boolean
  }
}

export interface ProtectionClaim {
  id: string
  sessionId: string
  ticketAmount: number
  ticketDate: Date
  ticketPhoto: string | null
  status: "pending" | "reviewing" | "approved" | "denied"
  submittedAt: Date
}

export interface UserProtection {
  tier: "free" | "pro"
  checksThisMonth: number
  checksLimit: number
  claimsThisYear: number
  claimsLimit: number
  maxClaimAmount: number
}

// Convert DB session to app session
function toAppSession(dbSession: DBParkingSession): ProtectionSession {
  return {
    id: dbSession.id,
    locationAddress: dbSession.location_address,
    locationStreet: dbSession.location_street,
    coordinates: {
      lat: dbSession.coordinates_lat,
      lng: dbSession.coordinates_lng,
    },
    startTime: new Date(dbSession.started_at),
    endTime: dbSession.ended_at ? new Date(dbSession.ended_at) : null,
    maxDuration: dbSession.time_limit_minutes || 480,
    status: dbSession.ended_at ? "completed" : "active",
    reminder: {
      enabled: dbSession.reminder_set,
      scheduledFor: null,
      sent: false,
    },
  }
}

const STORAGE_KEY = "park_protection"

export function getProtectionStatus(): UserProtection {
  if (typeof window === "undefined") {
    return getDefaultProtection()
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }

  const defaultProtection = getDefaultProtection()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProtection))
  return defaultProtection
}

function getDefaultProtection(): UserProtection {
  return {
    tier: "free",
    checksThisMonth: 0,
    checksLimit: 10,
    claimsThisYear: 0,
    claimsLimit: 0,
    maxClaimAmount: 0,
  }
}

export function incrementCheckCount(): void {
  const protection = getProtectionStatus()
  protection.checksThisMonth++
  localStorage.setItem(STORAGE_KEY, JSON.stringify(protection))
}

export function canMakeCheck(): boolean {
  const protection = getProtectionStatus()
  return protection.tier === "pro" || protection.checksThisMonth < protection.checksLimit
}

export function getRemainingChecks(): number {
  const protection = getProtectionStatus()
  if (protection.tier === "pro") return -1
  return Math.max(0, protection.checksLimit - protection.checksThisMonth)
}

export function upgradeToProTier(): void {
  const protection = getProtectionStatus()
  protection.tier = "pro"
  protection.checksLimit = -1
  protection.claimsLimit = 3
  protection.maxClaimAmount = 100
  localStorage.setItem(STORAGE_KEY, JSON.stringify(protection))
}

// Active Session Management
export async function startParkingSession(
  address: string,
  street: string,
  coordinates: { lat: number; lng: number },
  maxDuration: number | null
): Promise<ProtectionSession> {
  const dbSession = await dbCreateSession({
    location_address: address,
    location_street: street,
    coordinates_lat: coordinates.lat,
    coordinates_lng: coordinates.lng,
    status: "allowed",
    started_at: new Date().toISOString(),
    time_limit_minutes: maxDuration || 480,
    is_protected: true,
    reminder_set: false,
  })

  incrementCheckCount()
  await dbUpdateUserStats("checks", 1)

  return toAppSession(dbSession)
}

export async function getActiveSession(): Promise<ProtectionSession | null> {
  const dbSession = await dbGetActiveSession()
  if (!dbSession) return null

  const session = toAppSession(dbSession)

  // Check if session has expired
  const now = new Date()
  const elapsedMinutes = (now.getTime() - session.startTime.getTime()) / 60000

  if (session.status === "active" && elapsedMinutes >= session.maxDuration) {
    session.status = "expired"
    await dbEndSession(dbSession.id)
  }

  return session
}

// Synchronous version for backward compatibility
export function getActiveSessionSync(): ProtectionSession | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem("park_db_sessions")
  if (!stored) return null

  try {
    const sessions: DBParkingSession[] = JSON.parse(stored)
    const active = sessions.find((s) => !s.ended_at)
    return active ? toAppSession(active) : null
  } catch {
    return null
  }
}

export async function endParkingSession(): Promise<void> {
  const session = await getActiveSession()
  if (session) {
    await dbEndSession(session.id)
    await dbUpdateUserStats("tickets_avoided", 1)
    await dbUpdateUserStats("money_saved", 75)
  }
}

export function clearSession(): void {
  // For backward compatibility
  const sessions = localStorage.getItem("park_db_sessions")
  if (sessions) {
    const parsed: DBParkingSession[] = JSON.parse(sessions)
    const updated = parsed.map((s) => ({
      ...s,
      ended_at: s.ended_at || new Date().toISOString(),
    }))
    localStorage.setItem("park_db_sessions", JSON.stringify(updated))
  }
}

export async function setSessionReminder(reminderTime: Date): Promise<void> {
  const session = await getActiveSession()
  if (session) {
    await dbUpdateSession(session.id, { reminder_set: true })
  }
}

export function getSessionTimeRemaining(): number | null {
  const session = getActiveSessionSync()
  if (!session || session.status !== "active") return null

  const now = new Date()
  const elapsedMinutes = (now.getTime() - session.startTime.getTime()) / 60000
  const remaining = Math.max(0, session.maxDuration - elapsedMinutes)

  return Math.round(remaining)
}

export function isProtectionActive(): boolean {
  const session = getActiveSessionSync()
  return session !== null && session.status === "active"
}
