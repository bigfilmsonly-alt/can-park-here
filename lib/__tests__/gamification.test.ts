import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  calculateLevel,
  getKarmaForNextLevel,
  getGamificationState,
  addKarma,
  updateStreak,
  incrementGamificationStat,
  getUserBadges,
  getBadgeProgress,
  applyReferralCode,
  getReferralStats,
  getMoneySavedStats,
  KARMA_ACTIONS,
  BADGES,
} from "../gamification"

// Mock the db import to avoid Supabase dependency
vi.mock("../db", () => ({
  dbGetUser: vi.fn().mockResolvedValue({ name: "Test User" }),
}))

describe("calculateLevel", () => {
  it("returns level 1 for 0 karma", () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it("returns level 2 for 50 karma", () => {
    expect(calculateLevel(50)).toBe(2)
  })

  it("returns level 3 for 200 karma", () => {
    expect(calculateLevel(200)).toBe(3)
  })

  it("returns higher levels for large karma values", () => {
    expect(calculateLevel(5000)).toBe(11)
  })

  it("returns level 1 for small non-zero karma", () => {
    expect(calculateLevel(10)).toBe(1)
  })
})

describe("getKarmaForNextLevel", () => {
  it("returns 50 for level 1", () => {
    expect(getKarmaForNextLevel(1)).toBe(50)
  })

  it("returns 200 for level 2", () => {
    expect(getKarmaForNextLevel(2)).toBe(200)
  })

  it("scales quadratically", () => {
    expect(getKarmaForNextLevel(5)).toBe(1250)
  })
})

describe("getGamificationState", () => {
  it("returns default state when no stored data", () => {
    const state = getGamificationState()
    expect(state.karma).toBe(0)
    expect(state.level).toBe(1)
    expect(state.currentStreak).toBe(0)
    expect(state.totalChecks).toBe(0)
    expect(state.unlockedBadges).toEqual([])
    expect(state.referralCode).toMatch(/^PARK[A-Z0-9]{6}$/)
  })

  it("stores default state in localStorage on first access", () => {
    getGamificationState()
    const stored = localStorage.getItem("park_gamification")
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.karma).toBe(0)
  })

  it("returns stored state when present", () => {
    const customState = {
      karma: 100,
      level: 2,
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: null,
      totalChecks: 10,
      totalReports: 2,
      totalReferrals: 0,
      ticketsAvoided: 3,
      moneySaved: 225,
      unlockedBadges: ["first_check"],
      referralCode: "PARKTEST01",
      referredBy: null,
    }
    localStorage.setItem("park_gamification", JSON.stringify(customState))
    const state = getGamificationState()
    expect(state.karma).toBe(100)
    expect(state.level).toBe(2)
    expect(state.totalChecks).toBe(10)
  })
})

describe("addKarma", () => {
  it("adds parking check karma correctly", () => {
    const result = addKarma("parkingCheck")
    expect(result.karma).toBe(KARMA_ACTIONS.parkingCheck)
    const state = getGamificationState()
    expect(state.karma).toBe(KARMA_ACTIONS.parkingCheck)
  })

  it("accumulates karma across multiple calls", () => {
    addKarma("parkingCheck")
    addKarma("reportEnforcement")
    const state = getGamificationState()
    expect(state.karma).toBe(KARMA_ACTIONS.parkingCheck + KARMA_ACTIONS.reportEnforcement)
  })

  it("updates level when enough karma earned", () => {
    addKarma("referralSignup")
    const state = getGamificationState()
    expect(state.level).toBeGreaterThanOrEqual(2)
  })
})

describe("incrementGamificationStat", () => {
  it("increments check count and adds karma", () => {
    incrementGamificationStat("checks")
    const state = getGamificationState()
    expect(state.totalChecks).toBe(1)
    expect(state.karma).toBe(KARMA_ACTIONS.parkingCheck + KARMA_ACTIONS.firstCheck)
  })

  it("awards milestone bonus at 10 checks", () => {
    const initial = getGamificationState()
    initial.totalChecks = 9
    initial.karma = 0
    localStorage.setItem("park_gamification", JSON.stringify(initial))

    incrementGamificationStat("checks")
    const state = getGamificationState()
    expect(state.totalChecks).toBe(10)
    expect(state.karma).toBe(KARMA_ACTIONS.parkingCheck + KARMA_ACTIONS.tenthCheck)
  })

  it("increments reports and adds karma", () => {
    incrementGamificationStat("reports")
    const state = getGamificationState()
    expect(state.totalReports).toBe(1)
    expect(state.karma).toBe(KARMA_ACTIONS.reportEnforcement)
  })

  it("increments tickets avoided and tracks money saved", () => {
    incrementGamificationStat("ticketsAvoided", 2)
    const state = getGamificationState()
    expect(state.ticketsAvoided).toBe(2)
    expect(state.moneySaved).toBe(150)
  })

  it("unlocks badges when requirements are met", () => {
    const result = incrementGamificationStat("checks")
    expect(result.newBadges.some((b) => b.id === "first_check")).toBe(true)
  })
})

describe("updateStreak", () => {
  it("starts a new streak on first use", () => {
    const result = updateStreak()
    expect(result.streakUpdated).toBe(true)
    const state = getGamificationState()
    expect(state.currentStreak).toBe(1)
  })

  it("does not update streak if already updated today", () => {
    updateStreak()
    const result = updateStreak()
    expect(result.streakUpdated).toBe(false)
  })

  it("continues streak from yesterday", () => {
    vi.useFakeTimers()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    vi.setSystemTime(yesterday)
    updateStreak()

    vi.setSystemTime(new Date(yesterday.getTime() + 24 * 60 * 60 * 1000))
    const result = updateStreak()
    expect(result.streakUpdated).toBe(true)
    const state = getGamificationState()
    expect(state.currentStreak).toBe(2)
    vi.useRealTimers()
  })
})

describe("getUserBadges", () => {
  it("returns all badges as locked initially", () => {
    const { unlocked, locked } = getUserBadges()
    expect(unlocked.length).toBe(0)
    expect(locked.length).toBe(BADGES.length)
  })
})

describe("getBadgeProgress", () => {
  it("returns 0 for unstarted badge", () => {
    const checksBadge = BADGES.find((b) => b.id === "ten_checks")!
    expect(getBadgeProgress(checksBadge)).toBe(0)
  })

  it("returns fractional progress", () => {
    incrementGamificationStat("checks")
    const checksBadge = BADGES.find((b) => b.id === "ten_checks")!
    expect(getBadgeProgress(checksBadge)).toBeCloseTo(0.1)
  })

  it("caps at 1.0 when requirement exceeded", () => {
    const initial = getGamificationState()
    initial.totalChecks = 20
    localStorage.setItem("park_gamification", JSON.stringify(initial))
    const checksBadge = BADGES.find((b) => b.id === "ten_checks")!
    expect(getBadgeProgress(checksBadge)).toBe(1)
  })
})

describe("applyReferralCode", () => {
  it("applies a valid referral code and adds karma", () => {
    const result = applyReferralCode("PARKFRIEND")
    expect(result).toBe(true)
    const state = getGamificationState()
    expect(state.referredBy).toBe("PARKFRIEND")
    expect(state.karma).toBe(50)
  })

  it("rejects duplicate referral", () => {
    applyReferralCode("PARKFRIEND")
    const result = applyReferralCode("PARKANOTHER")
    expect(result).toBe(false)
  })

  it("rejects own referral code", () => {
    const state = getGamificationState()
    const result = applyReferralCode(state.referralCode)
    expect(result).toBe(false)
  })
})

describe("getReferralStats", () => {
  it("returns referral info from state", () => {
    const stats = getReferralStats()
    expect(stats.code).toMatch(/^PARK/)
    expect(stats.referrals).toBe(0)
    expect(stats.earnings).toBe(0)
  })
})

describe("getMoneySavedStats", () => {
  it("returns money saved info from state", () => {
    incrementGamificationStat("ticketsAvoided", 3)
    const stats = getMoneySavedStats()
    expect(stats.total).toBe(225)
    expect(stats.ticketsAvoided).toBe(3)
  })
})
