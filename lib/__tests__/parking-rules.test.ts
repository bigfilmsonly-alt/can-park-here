import { describe, it, expect, vi, afterEach } from "vitest"
import { checkParking, formatTimeRemaining, getUserAccessibility, setUserAccessibility } from "../parking-rules"

describe("checkParking", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns 'allowed' for default zone when no rules are active", () => {
    // Saturday March 28, 00:00 -- no default rules are active then
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 28, 0, 0))
    const result = checkParking(40, -80) // random coords -> default zone
    expect(result.status).toBe("allowed")
    expect(result.title).toBe("Yes, you can park here")
    expect(result.activeRule).toBeNull()
  })

  it("returns 'prohibited' during street cleaning hours on Monday in default zone", () => {
    vi.useFakeTimers()
    // Monday March 23 2026 at 09:00 -- street-cleaning-1 is active (Mon 08:00-10:00)
    vi.setSystemTime(new Date(2026, 2, 23, 9, 0))
    const result = checkParking(40, -80) // default zone
    expect(result.status).toBe("prohibited")
    expect(result.activeRule).not.toBeNull()
    expect(result.activeRule!.type).toBe("street-cleaning")
  })

  it("returns 'restricted' during time-limit hours on a weekday in default zone", () => {
    vi.useFakeTimers()
    // Wednesday March 25 2026 at 12:00 -- time-limit-1 active (weekdays 09:00-18:00)
    vi.setSystemTime(new Date(2026, 2, 25, 12, 0))
    const result = checkParking(40, -80) // default zone
    expect(result.status).toBe("restricted")
    expect(result.activeRule).not.toBeNull()
    expect(result.activeRule!.type).toBe("time-limit")
  })

  it("returns 'prohibited' for downtown tow-zone during rush hour (with placard)", () => {
    vi.useFakeTimers()
    // Monday March 23 2026 at 08:00 -- tow-zone-1 active (weekdays 07:00-09:00)
    // Downtown has a 24/7 handicap-only rule checked first; pass a placard to bypass it
    vi.setSystemTime(new Date(2026, 2, 23, 8, 0))
    const result = checkParking(37.7849, -122.4094, { hasHandicapPlacard: true, placardType: "permanent" })
    expect(result.status).toBe("prohibited")
    expect(result.title).toBe("Tow-away zone")
    expect(result.activeRule!.type).toBe("tow-zone")
    expect(result.timeRemaining).toBeGreaterThan(0)
  })

  it("returns 'prohibited' for handicap zone without placard", () => {
    vi.useFakeTimers()
    // Sunday March 22 2026 at 12:00 -- handicap-only is 24/7 in downtown, no tow zones on Sunday
    vi.setSystemTime(new Date(2026, 2, 22, 12, 0))
    const result = checkParking(37.7849, -122.4094, { hasHandicapPlacard: false })
    expect(result.status).toBe("prohibited")
    expect(result.handicapInfo).toBeDefined()
    expect(result.handicapInfo!.requiresPlacard).toBe(true)
  })

  it("returns 'prohibited' for residential permit-only zone", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 25, 12, 0))
    const result = checkParking(37.7599, -122.4148)
    expect(result.status).toBe("prohibited")
  })

  it("returns 'prohibited' for fire hydrant zone in commercial area", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 25, 12, 0))
    // Use coords that match commercial but NOT downtown
    // downtown: abs(lat-37.7849)<0.01, abs(lng-(-122.4094))<0.01
    // commercial: abs(lat-37.7879)<0.01, abs(lng-(-122.4074))<0.01
    // lat 37.7885, lng -122.3980 fails downtown check (lng diff 0.0114>0.01) but passes commercial
    const result = checkParking(37.7885, -122.3980)
    expect(result.status).toBe("prohibited")
    expect(["Fire hydrant zone", "Bus stop"]).toContain(result.title)
  })

  it("includes warnings when rules generate them", () => {
    vi.useFakeTimers()
    // Monday at 08:30 -- street cleaning active in default zone
    vi.setSystemTime(new Date(2026, 2, 23, 8, 30))
    const result = checkParking(40, -80)
    expect(result.warnings.length).toBeGreaterThan(0)
  })
})

describe("formatTimeRemaining", () => {
  it("formats minutes-only correctly", () => {
    expect(formatTimeRemaining(45)).toBe("45m")
  })

  it("formats hours and minutes correctly", () => {
    expect(formatTimeRemaining(90)).toBe("1h 30m")
  })

  it("formats exact hours correctly", () => {
    expect(formatTimeRemaining(120)).toBe("2h 00m")
  })

  it("formats zero minutes correctly", () => {
    expect(formatTimeRemaining(0)).toBe("0m")
  })
})

describe("getUserAccessibility / setUserAccessibility", () => {
  it("returns default when nothing stored", () => {
    const result = getUserAccessibility()
    expect(result.hasHandicapPlacard).toBe(false)
  })

  it("round-trips stored settings", () => {
    setUserAccessibility({ hasHandicapPlacard: true, placardType: "permanent" })
    const result = getUserAccessibility()
    expect(result.hasHandicapPlacard).toBe(true)
    expect(result.placardType).toBe("permanent")
  })

  it("returns default when stored value is invalid JSON", () => {
    localStorage.setItem("park_accessibility", "not-json")
    const result = getUserAccessibility()
    expect(result.hasHandicapPlacard).toBe(false)
  })
})
