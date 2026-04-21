import { describe, it, expect, vi } from "vitest"
import {
  getProtectionStatus,
  incrementCheckCount,
  canMakeCheck,
  getRemainingChecks,
  upgradeToProTier,
  getActiveSessionSync,
  clearSession,
  getSessionTimeRemaining,
  isProtectionActive,
} from "../protection"

// Mock the db module since protection.ts imports from it
vi.mock("../db", () => ({
  dbGetUser: vi.fn().mockResolvedValue(null),
  dbGetActiveSession: vi.fn().mockResolvedValue(null),
  dbCreateSession: vi.fn().mockResolvedValue({ id: "mock-session" }),
  dbEndSession: vi.fn().mockResolvedValue(undefined),
  dbUpdateSession: vi.fn().mockResolvedValue(undefined),
  dbUpdateUserStats: vi.fn().mockResolvedValue(undefined),
}))

describe("getProtectionStatus", () => {
  it("returns default free tier when no stored data", () => {
    const status = getProtectionStatus()
    expect(status.tier).toBe("free")
    expect(status.checksThisMonth).toBe(0)
    expect(status.checksLimit).toBe(10)
    expect(status.claimsThisYear).toBe(0)
    expect(status.claimsLimit).toBe(0)
    expect(status.maxClaimAmount).toBe(0)
  })

  it("stores default in localStorage on first access", () => {
    getProtectionStatus()
    const stored = localStorage.getItem("park_protection")
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.tier).toBe("free")
  })

  it("returns stored protection status", () => {
    const custom = {
      tier: "pro",
      checksThisMonth: 5,
      checksLimit: -1,
      claimsThisYear: 1,
      claimsLimit: 3,
      maxClaimAmount: 100,
    }
    localStorage.setItem("park_protection", JSON.stringify(custom))
    const status = getProtectionStatus()
    expect(status.tier).toBe("pro")
    expect(status.checksThisMonth).toBe(5)
  })
})

describe("incrementCheckCount", () => {
  it("increments the check count by 1", () => {
    getProtectionStatus() // initialize
    incrementCheckCount()
    const status = getProtectionStatus()
    expect(status.checksThisMonth).toBe(1)
  })

  it("accumulates across multiple increments", () => {
    getProtectionStatus() // initialize
    incrementCheckCount()
    incrementCheckCount()
    incrementCheckCount()
    const status = getProtectionStatus()
    expect(status.checksThisMonth).toBe(3)
  })
})

describe("canMakeCheck", () => {
  it("returns true when checks remain on free tier", () => {
    expect(canMakeCheck()).toBe(true)
  })

  it("returns false when free tier limit reached", () => {
    const status = getProtectionStatus()
    status.checksThisMonth = 10
    localStorage.setItem("park_protection", JSON.stringify(status))
    expect(canMakeCheck()).toBe(false)
  })

  it("returns true for pro tier regardless of count", () => {
    upgradeToProTier()
    const status = getProtectionStatus()
    status.checksThisMonth = 999
    localStorage.setItem("park_protection", JSON.stringify(status))
    expect(canMakeCheck()).toBe(true)
  })
})

describe("getRemainingChecks", () => {
  it("returns full limit initially for free tier", () => {
    expect(getRemainingChecks()).toBe(10)
  })

  it("returns remaining count after checks made", () => {
    getProtectionStatus()
    incrementCheckCount()
    incrementCheckCount()
    expect(getRemainingChecks()).toBe(8)
  })

  it("returns 0 when limit reached", () => {
    const status = getProtectionStatus()
    status.checksThisMonth = 15
    localStorage.setItem("park_protection", JSON.stringify(status))
    expect(getRemainingChecks()).toBe(0)
  })

  it("returns -1 for pro tier (unlimited)", () => {
    upgradeToProTier()
    expect(getRemainingChecks()).toBe(-1)
  })
})

describe("upgradeToProTier", () => {
  it("upgrades to pro with correct limits", () => {
    upgradeToProTier()
    const status = getProtectionStatus()
    expect(status.tier).toBe("pro")
    expect(status.checksLimit).toBe(-1)
    expect(status.claimsLimit).toBe(3)
    expect(status.maxClaimAmount).toBe(100)
  })
})

describe("getActiveSessionSync", () => {
  it("returns null when no sessions stored", () => {
    expect(getActiveSessionSync()).toBeNull()
  })

  it("returns null when sessions data is invalid", () => {
    localStorage.setItem("park_db_sessions", "not-json")
    expect(getActiveSessionSync()).toBeNull()
  })

  it("returns null when all sessions are ended", () => {
    const now = new Date()
    const sessions = [{
      id: "s1",
      user_id: "u1",
      check_id: null,
      address: "123 Main",
      latitude: 37.78,
      longitude: -122.41,
      status: "allowed",
      result: {},
      started_at: now.toISOString(),
      ends_at: new Date(now.getTime() + 120 * 60000).toISOString(),
      ended_at: now.toISOString(),
      is_active: false,
      is_protected: true,
      reminder_set: false,
      reminder_time: null,
    }]
    localStorage.setItem("park_db_sessions", JSON.stringify(sessions))
    expect(getActiveSessionSync()).toBeNull()
  })

  it("returns active session when one exists", () => {
    const now = new Date()
    const sessions = [{
      id: "s1",
      user_id: "u1",
      check_id: null,
      address: "123 Main",
      latitude: 37.78,
      longitude: -122.41,
      status: "allowed",
      result: {},
      started_at: now.toISOString(),
      ends_at: new Date(now.getTime() + 120 * 60000).toISOString(),
      ended_at: null,
      is_active: true,
      is_protected: true,
      reminder_set: false,
      reminder_time: null,
    }]
    localStorage.setItem("park_db_sessions", JSON.stringify(sessions))
    const session = getActiveSessionSync()
    expect(session).not.toBeNull()
    expect(session!.id).toBe("s1")
    expect(session!.locationAddress).toBe("123 Main")
    expect(session!.status).toBe("active")
  })
})

describe("clearSession", () => {
  it("ends all active sessions", () => {
    const now = new Date()
    const sessions = [{
      id: "s1",
      user_id: "u1",
      check_id: null,
      address: "123 Main",
      latitude: 37.78,
      longitude: -122.41,
      status: "allowed",
      result: {},
      started_at: now.toISOString(),
      ends_at: new Date(now.getTime() + 120 * 60000).toISOString(),
      ended_at: null,
      is_active: true,
      is_protected: true,
      reminder_set: false,
      reminder_time: null,
    }]
    localStorage.setItem("park_db_sessions", JSON.stringify(sessions))
    clearSession()
    expect(getActiveSessionSync()).toBeNull()
  })
})

describe("getSessionTimeRemaining", () => {
  it("returns null when no active session", () => {
    expect(getSessionTimeRemaining()).toBeNull()
  })

  it("returns remaining minutes for active session", () => {
    const startTime = new Date(Date.now() - 30 * 60 * 1000) // 30 min ago
    const endsAt = new Date(startTime.getTime() + 120 * 60000) // 120 min after start
    const sessions = [{
      id: "s1",
      user_id: "u1",
      check_id: null,
      address: "123 Main",
      latitude: 37.78,
      longitude: -122.41,
      status: "allowed",
      result: {},
      started_at: startTime.toISOString(),
      ends_at: endsAt.toISOString(),
      ended_at: null,
      is_active: true,
      is_protected: true,
      reminder_set: false,
      reminder_time: null,
    }]
    localStorage.setItem("park_db_sessions", JSON.stringify(sessions))
    const remaining = getSessionTimeRemaining()
    expect(remaining).not.toBeNull()
    expect(remaining!).toBeGreaterThan(85)
    expect(remaining!).toBeLessThanOrEqual(90)
  })
})

describe("isProtectionActive", () => {
  it("returns false when no session", () => {
    expect(isProtectionActive()).toBe(false)
  })

  it("returns true when active session exists", () => {
    const now = new Date()
    const sessions = [{
      id: "s1",
      user_id: "u1",
      check_id: null,
      address: "123 Main",
      latitude: 37.78,
      longitude: -122.41,
      status: "allowed",
      result: {},
      started_at: now.toISOString(),
      ends_at: new Date(now.getTime() + 120 * 60000).toISOString(),
      ended_at: null,
      is_active: true,
      is_protected: true,
      reminder_set: false,
      reminder_time: null,
    }]
    localStorage.setItem("park_db_sessions", JSON.stringify(sessions))
    expect(isProtectionActive()).toBe(true)
  })
})
