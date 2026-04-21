/**
 * Protection & Sessions Layer
 * Uses the database abstraction layer for persistence.
 */

import {
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
  // Calculate max duration from started_at and ends_at
  const startedAt = new Date(dbSession.started_at)
  const endsAt = dbSession.ends_at ? new Date(dbSession.ends_at) : null
  const maxDuration = endsAt
    ? Math.round((endsAt.getTime() - startedAt.getTime()) / 60000)
    : 480

  return {
    id: dbSession.id,
    locationAddress: dbSession.address,
    locationStreet: dbSession.address,
    coordinates: {
      lat: dbSession.latitude,
      lng: dbSession.longitude,
    },
    startTime: startedAt,
    endTime: dbSession.ended_at ? new Date(dbSession.ended_at) : null,
    maxDuration,
    status: dbSession.ended_at ? "completed" : "active",
    reminder: {
      enabled: dbSession.reminder_set,
      scheduledFor: dbSession.reminder_time ? new Date(dbSession.reminder_time) : null,
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
  if (typeof window === "undefined") return
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
  if (typeof window === "undefined") return
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
  const now = new Date()
  const durationMinutes = maxDuration || 480
  const endsAt = new Date(now.getTime() + durationMinutes * 60000)

  const dbSession = await dbCreateSession({
    check_id: null,
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    address,
    status: "allowed",
    result: {},
    started_at: now.toISOString(),
    ends_at: endsAt.toISOString(),
    ended_at: null,
    is_protected: true,
    is_active: true,
    reminder_set: false,
    reminder_time: null,
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
    const active = sessions.find((s) => s.is_active)
    return active ? toAppSession(active) : null
  } catch {
    return null
  }
}

export async function endParkingSession(): Promise<void> {
  const session = await getActiveSession()
  if (session) {
    await dbEndSession(session.id)
    await dbUpdateUserStats("ticketsAvoided", 1)
    await dbUpdateUserStats("moneySaved", 75)
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  // For backward compatibility
  const sessions = localStorage.getItem("park_db_sessions")
  if (sessions) {
    try {
      const parsed: DBParkingSession[] = JSON.parse(sessions)
      const updated = parsed.map((s) => ({
        ...s,
        ended_at: s.ended_at || new Date().toISOString(),
        is_active: false,
      }))
      localStorage.setItem("park_db_sessions", JSON.stringify(updated))
    } catch {
      // Ignore corrupt data
    }
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
