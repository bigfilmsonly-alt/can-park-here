import { describe, it, expect, beforeEach } from "vitest"
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
  type UserProtection,
} from "@/lib/protection"

describe("getProtectionStatus", () => {
  it("returns default free tier when no data is stored", () => {
    const status = getProtectionStatus()

    expect(status.tier).toBe("free")
    expect(status.checksThisMonth).toBe(0)
    expect(status.checksLimit).toBe(10)
    expect(status.claimsThisYear).toBe(0)
    expect(status.claimsLimit).toBe(0)
    expect(status.maxClaimAmount).toBe(0)
  })

  it("persists default to localStorage on first access", () => {
    getProtectionStatus()

    const stored = localStorage.getItem("park_protection")
    expect(stored).not.toBeNull()

    const parsed = JSON.parse(stored!)
    expect(parsed.tier).toBe("free")
    expect(parsed.checksLimit).toBe(10)
  })

  it("returns stored data when present", () => {
    const custom: UserProtection = {
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
    expect(status.claimsLimit).toBe(3)
  })
})

describe("incrementCheckCount", () => {
  it("increments check count by 1", () => {
    const before = getProtectionStatus()
    expect(before.checksThisMonth).toBe(0)

    incrementCheckCount()

    const after = getProtectionStatus()
    expect(after.checksThisMonth).toBe(1)
  })

  it("increments correctly across multiple calls", () => {
    incrementCheckCount()
    incrementCheckCount()
    incrementCheckCount()

    const status = getProtectionStatus()
    expect(status.checksThisMonth).toBe(3)
  })

  it("preserves other fields when incrementing", () => {
    const custom: UserProtection = {
      tier: "pro",
      checksThisMonth: 10,
      checksLimit: -1,
      claimsThisYear: 2,
      claimsLimit: 3,
      maxClaimAmount: 100,
    }
    localStorage.setItem("park_protection", JSON.stringify(custom))

    incrementCheckCount()

    const status = getProtectionStatus()
    expect(status.tier).toBe("pro")
    expect(status.checksThisMonth).toBe(11)
    expect(status.claimsThisYear).toBe(2)
    expect(status.claimsLimit).toBe(3)
  })
})

describe("canMakeCheck", () => {
  it("returns true when free tier has remaining checks", () => {
    expect(canMakeCheck()).toBe(true)
  })

  it("returns true when free tier is below limit", () => {
    // Default limit is 10
    for (let i = 0; i < 9; i++) {
      incrementCheckCount()
    }
    expect(canMakeCheck()).toBe(true)
  })

  it("returns false when free tier has reached limit", () => {
    for (let i = 0; i < 10; i++) {
      incrementCheckCount()
    }
    expect(canMakeCheck()).toBe(false)
  })

  it("returns false when free tier has exceeded limit", () => {
    const status: UserProtection = {
      tier: "free",
      checksThisMonth: 15,
      checksLimit: 10,
      claimsThisYear: 0,
      claimsLimit: 0,
      maxClaimAmount: 0,
    }
    localStorage.setItem("park_protection", JSON.stringify(status))

    expect(canMakeCheck()).toBe(false)
  })

  it("always returns true for pro tier", () => {
    const proStatus: UserProtection = {
      tier: "pro",
      checksThisMonth: 999,
      checksLimit: -1,
      claimsThisYear: 0,
      claimsLimit: 3,
      maxClaimAmount: 100,
    }
    localStorage.setItem("park_protection", JSON.stringify(proStatus))

    expect(canMakeCheck()).toBe(true)
  })
})

describe("getRemainingChecks", () => {
  it("returns full limit for fresh free user", () => {
    expect(getRemainingChecks()).toBe(10)
  })

  it("returns correct remaining after some checks", () => {
    incrementCheckCount()
    incrementCheckCount()
    incrementCheckCount()

    expect(getRemainingChecks()).toBe(7)
  })

  it("returns 0 when limit reached", () => {
    for (let i = 0; i < 10; i++) {
      incrementCheckCount()
    }
    expect(getRemainingChecks()).toBe(0)
  })

  it("never returns negative values", () => {
    const status: UserProtection = {
      tier: "free",
      checksThisMonth: 20,
      checksLimit: 10,
      claimsThisYear: 0,
      claimsLimit: 0,
      maxClaimAmount: 0,
    }
    localStorage.setItem("park_protection", JSON.stringify(status))

    expect(getRemainingChecks()).toBe(0)
  })

  it("returns -1 for pro tier (unlimited)", () => {
    upgradeToProTier()
    expect(getRemainingChecks()).toBe(-1)
  })
})

describe("upgradeToProTier", () => {
  it("changes tier to pro", () => {
    upgradeToProTier()
    const status = getProtectionStatus()
    expect(status.tier).toBe("pro")
  })

  it("sets unlimited checks", () => {
    upgradeToProTier()
    const status = getProtectionStatus()
    expect(status.checksLimit).toBe(-1)
  })

  it("sets claims limit and amount", () => {
    upgradeToProTier()
    const status = getProtectionStatus()
    expect(status.claimsLimit).toBe(3)
    expect(status.maxClaimAmount).toBe(100)
  })

  it("preserves existing check count", () => {
    incrementCheckCount()
    incrementCheckCount()

    upgradeToProTier()

    const status = getProtectionStatus()
    expect(status.checksThisMonth).toBe(2)
    expect(status.tier).toBe("pro")
  })
})

describe("session management (sync)", () => {
  describe("getActiveSessionSync", () => {
    it("returns null when no sessions stored", () => {
      expect(getActiveSessionSync()).toBeNull()
    })

    it("returns null when sessions data is invalid JSON", () => {
      localStorage.setItem("park_db_sessions", "invalid-json")
      expect(getActiveSessionSync()).toBeNull()
    })

    it("returns null when all sessions are ended", () => {
      const startedAt = new Date(Date.now() - 3600000)
      const sessions = [
        {
          id: "sess-1",
          user_id: "u1",
          check_id: null,
          address: "123 Main St",
          latitude: 37.7749,
          longitude: -122.4194,
          status: "allowed",
          result: {},
          started_at: startedAt.toISOString(),
          ends_at: new Date(startedAt.getTime() + 120 * 60000).toISOString(),
          ended_at: new Date().toISOString(),
          is_active: false,
          is_protected: true,
          reminder_set: false,
          reminder_time: null,
        },
      ]
      localStorage.setItem("park_db_sessions", JSON.stringify(sessions))

      expect(getActiveSessionSync()).toBeNull()
    })

    it("returns active session when one exists", () => {
      const startedAt = new Date(Date.now() - 1800000)
      const sessions = [
        {
          id: "sess-active",
          user_id: "u1",
          check_id: null,
          address: "456 Oak Ave",
          latitude: 37.78,
          longitude: -122.41,
          status: "allowed",
          result: {},
          started_at: startedAt.toISOString(),
          ends_at: new Date(startedAt.getTime() + 120 * 60000).toISOString(),
          ended_at: null,
          is_active: true,
          is_protected: true,
          reminder_set: false,
          reminder_time: null,
        },
      ]
      localStorage.setItem("park_db_sessions", JSON.stringify(sessions))

      const session = getActiveSessionSync()
      expect(session).not.toBeNull()
      expect(session!.id).toBe("sess-active")
      expect(session!.locationAddress).toBe("456 Oak Ave")
      expect(session!.status).toBe("active")
    })
  })

  describe("clearSession", () => {
    it("ends all active sessions", () => {
      const startedAt1 = new Date(Date.now() - 3600000)
      const startedAt2 = new Date(Date.now() - 1800000)
      const sessions = [
        {
          id: "sess-1",
          user_id: "u1",
          check_id: null,
          address: "123 Main St",
          latitude: 37.77,
          longitude: -122.42,
          status: "allowed",
          result: {},
          started_at: startedAt1.toISOString(),
          ends_at: new Date(startedAt1.getTime() + 120 * 60000).toISOString(),
          ended_at: null,
          is_active: true,
          is_protected: true,
          reminder_set: false,
          reminder_time: null,
        },
        {
          id: "sess-2",
          user_id: "u1",
          check_id: null,
          address: "789 Elm St",
          latitude: 37.78,
          longitude: -122.41,
          status: "allowed",
          result: {},
          started_at: startedAt2.toISOString(),
          ends_at: new Date(startedAt2.getTime() + 120 * 60000).toISOString(),
          ended_at: null,
          is_active: true,
          is_protected: true,
          reminder_set: false,
          reminder_time: null,
        },
      ]
      localStorage.setItem("park_db_sessions", JSON.stringify(sessions))

      clearSession()

      const stored = JSON.parse(localStorage.getItem("park_db_sessions")!)
      expect(stored.every((s: { ended_at: string | null }) => s.ended_at !== null)).toBe(true)
    })

    it("does not error when no sessions exist", () => {
      expect(() => clearSession()).not.toThrow()
    })
  })

  describe("getSessionTimeRemaining", () => {
    it("returns null when no active session", () => {
      expect(getSessionTimeRemaining()).toBeNull()
    })

    it("returns remaining minutes for active session", () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
      const endsAt = new Date(thirtyMinutesAgo.getTime() + 120 * 60000)
      const sessions = [
        {
          id: "sess-time",
          user_id: "u1",
          check_id: null,
          address: "Test St",
          latitude: 37.77,
          longitude: -122.42,
          status: "allowed",
          result: {},
          started_at: thirtyMinutesAgo.toISOString(),
          ends_at: endsAt.toISOString(),
          ended_at: null,
          is_active: true,
          is_protected: true,
          reminder_set: false,
          reminder_time: null,
        },
      ]
      localStorage.setItem("park_db_sessions", JSON.stringify(sessions))

      const remaining = getSessionTimeRemaining()
      expect(remaining).not.toBeNull()
      // Started 30 min ago with 120 min limit = ~90 min remaining
      expect(remaining!).toBeGreaterThanOrEqual(89)
      expect(remaining!).toBeLessThanOrEqual(91)
    })

    it("returns 0 when session time is expired", () => {
      const threeHoursAgo = new Date(Date.now() - 180 * 60 * 1000)
      const endsAt = new Date(threeHoursAgo.getTime() + 120 * 60000)
      const sessions = [
        {
          id: "sess-expired",
          user_id: "u1",
          check_id: null,
          address: "Expired St",
          latitude: 37.77,
          longitude: -122.42,
          status: "allowed",
          result: {},
          started_at: threeHoursAgo.toISOString(),
          ends_at: endsAt.toISOString(),
          ended_at: null,
          is_active: true,
          is_protected: true,
          reminder_set: false,
          reminder_time: null,
        },
      ]
      localStorage.setItem("park_db_sessions", JSON.stringify(sessions))

      const remaining = getSessionTimeRemaining()
      expect(remaining).toBe(0)
    })
  })

  describe("isProtectionActive", () => {
    it("returns false when no session exists", () => {
      expect(isProtectionActive()).toBe(false)
    })

    it("returns true when active session exists", () => {
      const startedAt = new Date(Date.now() - 600000)
      const sessions = [
        {
          id: "sess-prot",
          user_id: "u1",
          check_id: null,
          address: "Protected St",
          latitude: 37.77,
          longitude: -122.42,
          status: "allowed",
          result: {},
          started_at: startedAt.toISOString(),
          ends_at: new Date(startedAt.getTime() + 120 * 60000).toISOString(),
          ended_at: null,
          is_active: true,
          is_protected: true,
          reminder_set: false,
          reminder_time: null,
        },
      ]
      localStorage.setItem("park_db_sessions", JSON.stringify(sessions))

      expect(isProtectionActive()).toBe(true)
    })

    it("returns false when all sessions are ended", () => {
      const startedAt = new Date(Date.now() - 3600000)
      const sessions = [
        {
          id: "sess-done",
          user_id: "u1",
          check_id: null,
          address: "Done St",
          latitude: 37.77,
          longitude: -122.42,
          status: "allowed",
          result: {},
          started_at: startedAt.toISOString(),
          ends_at: new Date(startedAt.getTime() + 120 * 60000).toISOString(),
          ended_at: new Date().toISOString(),
          is_active: false,
          is_protected: true,
          reminder_set: false,
          reminder_time: null,
        },
      ]
      localStorage.setItem("park_db_sessions", JSON.stringify(sessions))

      expect(isProtectionActive()).toBe(false)
    })
  })
})
