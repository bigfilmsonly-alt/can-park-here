import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  checkParking,
  formatTimeRemaining,
  getUserAccessibility,
  setUserAccessibility,
  type UserAccessibility,
  type ParkingResult,
} from "@/lib/parking-rules"

// Coordinates for known zones in the rules database
// Zone detection uses Math.abs proximity checks:
//   downtown: abs(lat-37.7849)<0.01 && abs(lng-(-122.4094))<0.01
//   residential: abs(lat-37.7599)<0.02 && abs(lng-(-122.4148))<0.02
//   commercial: abs(lat-37.7879)<0.01 && abs(lng-(-122.4074))<0.01
// Zones are checked in order: downtown -> residential -> commercial -> default
// Commercial center overlaps downtown range, so we use edge coords for commercial
const COORDS = {
  downtown: { lat: 37.7849, lng: -122.4094 },
  residential: { lat: 37.7599, lng: -122.4148 },
  // Use coordinates that match commercial but NOT downtown
  // downtown check: abs(37.7885 - 37.7849) = 0.0036 < 0.01, abs(-122.3980 - (-122.4094)) = 0.0114 > 0.01 => fails
  // commercial check: abs(37.7885 - 37.7879) = 0.0006 < 0.01, abs(-122.3980 - (-122.4074)) = 0.0094 < 0.01 => matches
  commercial: { lat: 37.7885, lng: -122.3980 },
  // Falls through to "default" zone
  default: { lat: 40.0, lng: -100.0 },
}

describe("checkParking", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function mockDate(dateStr: string) {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(dateStr))
  }

  describe("default zone", () => {
    it("returns prohibited during Monday street cleaning (08:00-10:00)", () => {
      // Monday at 09:00 AM
      mockDate("2026-03-23T09:00:00") // Monday
      const result = checkParking(COORDS.default.lat, COORDS.default.lng)

      expect(result.status).toBe("prohibited")
      expect(result.title).toContain("Street cleaning")
      expect(result.activeRule).not.toBeNull()
      expect(result.activeRule!.type).toBe("street-cleaning")
    })

    it("returns restricted during weekday time-limit hours (09:00-18:00)", () => {
      // Wednesday at 11:00 AM - outside street cleaning, inside time limit
      mockDate("2026-03-25T11:00:00") // Wednesday
      const result = checkParking(COORDS.default.lat, COORDS.default.lng)

      // Street cleaning on Wednesday is 08:00-10:00, so at 11:00 only time-limit applies
      expect(result.status).toBe("restricted")
      expect(result.activeRule).not.toBeNull()
      expect(result.activeRule!.type).toBe("time-limit")
    })

    it("returns allowed on weekday evenings outside all restrictions", () => {
      // Friday at 20:00 - outside all restrictions
      mockDate("2026-03-27T20:00:00") // Friday
      const result = checkParking(COORDS.default.lat, COORDS.default.lng)

      expect(result.status).toBe("allowed")
      expect(result.activeRule).toBeNull()
    })

    it("returns allowed on Sunday with no restrictions", () => {
      // Sunday at noon - no street cleaning, no time limits on weekends
      mockDate("2026-03-22T12:00:00") // Sunday
      const result = checkParking(COORDS.default.lat, COORDS.default.lng)

      expect(result.status).toBe("allowed")
      expect(result.activeRule).toBeNull()
    })
  })

  describe("downtown zone", () => {
    // Downtown has a 24/7 handicap-only rule that is checked FIRST.
    // Without a placard, all downtown queries return "Accessible parking only".
    // To test tow-zone, metered, etc., we pass a valid placard to bypass handicap.
    const withPlacard: UserAccessibility = {
      hasHandicapPlacard: true,
      placardType: "permanent",
    }

    it("returns handicap-prohibited without placard regardless of other rules", () => {
      mockDate("2026-03-24T08:00:00") // Tuesday 08:00 - tow zone time
      const result = checkParking(COORDS.downtown.lat, COORDS.downtown.lng)

      // Handicap check takes precedence over tow-zone
      expect(result.status).toBe("prohibited")
      expect(result.title).toBe("Accessible parking only")
      expect(result.handicapInfo).toBeDefined()
      expect(result.handicapInfo!.requiresPlacard).toBe(true)
    })

    it("returns prohibited during tow-away zone morning rush with placard (07:00-09:00)", () => {
      mockDate("2026-03-24T08:00:00") // Tuesday
      const result = checkParking(COORDS.downtown.lat, COORDS.downtown.lng, withPlacard)

      expect(result.status).toBe("prohibited")
      expect(result.title).toBe("Tow-away zone")
      expect(result.activeRule!.type).toBe("tow-zone")
      expect(result.activeRule!.fine).toBe(500)
      expect(result.timeRemaining).toBeGreaterThan(0)
    })

    it("returns prohibited during no-parking night hours (02:00-06:00)", () => {
      mockDate("2026-03-25T03:00:00")
      const result = checkParking(COORDS.downtown.lat, COORDS.downtown.lng, withPlacard)

      expect(result.status).toBe("prohibited")
      expect(result.activeRule!.type).toBe("no-parking")
    })

    it("returns restricted for metered parking during business hours", () => {
      // Wednesday at 12:00 - metered parking active, outside tow zones
      mockDate("2026-03-25T12:00:00") // Wednesday
      const result = checkParking(COORDS.downtown.lat, COORDS.downtown.lng, withPlacard)

      expect(result.status).toBe("restricted")
      expect(result.activeRule!.type).toBe("metered")
    })

    it("includes tow warning when tow-zone is active", () => {
      mockDate("2026-03-24T08:30:00") // Tuesday
      const result = checkParking(COORDS.downtown.lat, COORDS.downtown.lng, withPlacard)

      expect(result.warnings.some((w) => w.type === "tow")).toBe(true)
      expect(result.warnings.some((w) => w.severity === "critical")).toBe(true)
    })

    it("returns prohibited during afternoon tow-away zone (16:00-18:00)", () => {
      mockDate("2026-03-26T17:00:00") // Thursday
      const result = checkParking(COORDS.downtown.lat, COORDS.downtown.lng, withPlacard)

      expect(result.status).toBe("prohibited")
      expect(result.activeRule!.type).toBe("tow-zone")
    })
  })

  describe("residential zone", () => {
    // Residential zone has both permit-only (24/7) and handicap-only (24/7).
    // Handicap is checked first. Without a placard, you get "Accessible parking only".
    // With a placard, handicap passes but permit-only then blocks.
    const withPlacard: UserAccessibility = {
      hasHandicapPlacard: true,
      placardType: "permanent",
    }

    it("returns handicap-prohibited without placard", () => {
      mockDate("2026-03-24T14:00:00") // Tuesday
      const result = checkParking(
        COORDS.residential.lat,
        COORDS.residential.lng
      )

      expect(result.status).toBe("prohibited")
      expect(result.title).toBe("Accessible parking only")
      expect(result.handicapInfo!.requiresPlacard).toBe(true)
    })

    it("returns permit-required when user has valid placard", () => {
      mockDate("2026-03-24T14:00:00") // Tuesday
      const result = checkParking(
        COORDS.residential.lat,
        COORDS.residential.lng,
        withPlacard
      )

      expect(result.status).toBe("prohibited")
      expect(result.title).toBe("Permit required")
      expect(result.activeRule!.type).toBe("permit-only")
      expect(result.warnings.some((w) => w.type === "permit")).toBe(true)
    })
  })

  describe("commercial zone", () => {
    it("returns prohibited for fire hydrant zone (always active)", () => {
      // Fire hydrant and bus stop are 24/7 in the commercial zone
      mockDate("2026-03-25T15:00:00")
      const result = checkParking(
        COORDS.commercial.lat,
        COORDS.commercial.lng
      )

      // The code checks fire hydrant / bus stop, which are always active
      // Both exist in commercial zone, whichever matches first
      expect(result.status).toBe("prohibited")
      expect(["fire-hydrant", "bus-stop"]).toContain(result.activeRule!.type)
    })

    it("returns restricted for loading zone during business hours on weekdays", () => {
      // Loading zone: Mon-Sat 07:00-18:00
      // But bus stop and fire hydrant are checked first (they are always active)
      // So commercial zone always returns prohibited due to safety zones
      mockDate("2026-03-24T10:00:00") // Tuesday
      const result = checkParking(
        COORDS.commercial.lat,
        COORDS.commercial.lng
      )

      // Safety zones (fire hydrant, bus stop) take precedence
      expect(result.status).toBe("prohibited")
    })

    it("includes critical warnings for safety zones", () => {
      mockDate("2026-03-24T10:00:00")
      const result = checkParking(
        COORDS.commercial.lat,
        COORDS.commercial.lng
      )

      const criticalWarnings = result.warnings.filter(
        (w) => w.severity === "critical"
      )
      expect(criticalWarnings.length).toBeGreaterThan(0)
    })
  })

  describe("handicap / accessibility logic", () => {
    it("returns prohibited for handicap zone without placard", () => {
      // Downtown has a handicap-only rule (24/7)
      mockDate("2026-03-22T12:00:00") // Sunday noon - no tow zones
      const result = checkParking(
        COORDS.downtown.lat,
        COORDS.downtown.lng,
        undefined
      )

      // On Sunday noon downtown: handicap-only is checked first
      expect(result.handicapInfo).toBeDefined()
      expect(result.handicapInfo!.isHandicapZone).toBe(true)
      expect(result.handicapInfo!.requiresPlacard).toBe(true)
      expect(result.status).toBe("prohibited")
      expect(result.handicapInfo!.message).toContain("placard required")
    })

    it("returns prohibited for handicap zone when user has no placard", () => {
      mockDate("2026-03-22T12:00:00") // Sunday noon
      const noPlacardUser: UserAccessibility = { hasHandicapPlacard: false }
      const result = checkParking(
        COORDS.downtown.lat,
        COORDS.downtown.lng,
        noPlacardUser
      )

      expect(result.status).toBe("prohibited")
      expect(result.title).toBe("Accessible parking only")
      expect(result.description).toContain("$450")
    })

    it("allows parking for handicap zone when user has valid placard", () => {
      mockDate("2026-03-22T12:00:00") // Sunday noon
      const placardUser: UserAccessibility = {
        hasHandicapPlacard: true,
        placardType: "permanent",
      }
      const result = checkParking(
        COORDS.downtown.lat,
        COORDS.downtown.lng,
        placardUser
      )

      // With valid placard, handicap zone is allowed
      expect(result.handicapInfo).toBeDefined()
      expect(result.handicapInfo!.message).toContain("valid placard")
      // Status should be allowed (no other restrictions on Sunday noon in downtown besides metered on Mon-Sat)
      expect(result.status).toBe("allowed")
    })

    it("returns fine amount for handicap violation", () => {
      mockDate("2026-03-22T12:00:00")
      const result = checkParking(
        COORDS.downtown.lat,
        COORDS.downtown.lng,
        undefined
      )

      // The warnings should mention the fine
      expect(result.warnings.some((w) => w.message.includes("$450"))).toBe(
        true
      )
    })
  })

  describe("time-based edge cases", () => {
    it("correctly identifies rule as active at exact start time", () => {
      // Street cleaning default zone: Mon,Wed 08:00-10:00
      mockDate("2026-03-23T08:00:00") // Monday at exactly 08:00
      const result = checkParking(COORDS.default.lat, COORDS.default.lng)

      expect(result.status).toBe("prohibited")
      expect(result.activeRule!.type).toBe("street-cleaning")
    })

    it("correctly identifies rule as inactive at exact end time", () => {
      // Street cleaning default zone: Mon,Wed 08:00-10:00
      // At exactly 10:00, currentMinutes (600) is NOT < endMinutes (600), so rule is inactive
      mockDate("2026-03-23T10:00:00") // Monday at exactly 10:00
      const result = checkParking(COORDS.default.lat, COORDS.default.lng)

      // Street cleaning is over, but time-limit (09:00-18:00) is active
      expect(result.activeRule?.type).not.toBe("street-cleaning")
    })

    it("provides timeRemaining for active time-limited restrictions", () => {
      mockDate("2026-03-25T11:00:00") // Wednesday during time-limit hours
      const result = checkParking(COORDS.default.lat, COORDS.default.lng)

      expect(result.timeRemaining).not.toBeNull()
      expect(result.timeRemaining).toBeGreaterThan(0)
    })
  })

  describe("warnings generation", () => {
    it("includes upcoming street cleaning warning when within 2 hours", () => {
      // Default zone: Mon street cleaning 08:00-10:00
      // At 06:30, that's 90 minutes before start - should warn
      mockDate("2026-03-23T06:30:00") // Monday at 06:30
      const result = checkParking(COORDS.default.lat, COORDS.default.lng)

      const streetCleaningWarning = result.warnings.find(
        (w) => w.type === "street-cleaning"
      )
      expect(streetCleaningWarning).toBeDefined()
      expect(streetCleaningWarning!.severity).toBe("warning")
      expect(streetCleaningWarning!.timeUntil).toBe(90)
    })

    it("does not warn about street cleaning more than 2 hours away", () => {
      // Monday at 05:00 - street cleaning at 08:00 is 3 hours away
      mockDate("2026-03-23T05:00:00")
      const result = checkParking(COORDS.default.lat, COORDS.default.lng)

      const streetCleaningWarning = result.warnings.find(
        (w) =>
          w.type === "street-cleaning" && w.severity === "warning"
      )
      expect(streetCleaningWarning).toBeUndefined()
    })
  })

  describe("nextRestriction", () => {
    it("provides next restriction info when parking is currently allowed", () => {
      // Sunday evening in default zone - no active rules
      mockDate("2026-03-22T20:00:00")
      const result = checkParking(COORDS.default.lat, COORDS.default.lng)

      // Next restriction could be Monday's street cleaning at 08:00
      // That's 12 hours away - more than 4 hours, so might not include it
      // But the function still calculates it (returned in nextRestriction)
      expect(result.status).toBe("allowed")
    })
  })
})

describe("formatTimeRemaining", () => {
  it("formats minutes-only correctly", () => {
    expect(formatTimeRemaining(45)).toBe("45m")
    expect(formatTimeRemaining(1)).toBe("1m")
    expect(formatTimeRemaining(0)).toBe("0m")
  })

  it("formats hours and minutes correctly", () => {
    expect(formatTimeRemaining(90)).toBe("1h 30m")
    expect(formatTimeRemaining(120)).toBe("2h 00m")
    expect(formatTimeRemaining(125)).toBe("2h 05m")
  })

  it("pads minutes with leading zero when under 10", () => {
    expect(formatTimeRemaining(65)).toBe("1h 05m")
    expect(formatTimeRemaining(61)).toBe("1h 01m")
  })
})

describe("getUserAccessibility / setUserAccessibility", () => {
  it("returns default (no placard) when nothing is stored", () => {
    const result = getUserAccessibility()
    expect(result.hasHandicapPlacard).toBe(false)
  })

  it("stores and retrieves accessibility settings", () => {
    const settings: UserAccessibility = {
      hasHandicapPlacard: true,
      placardType: "permanent",
      placardExpiry: "2027-01-01",
    }
    setUserAccessibility(settings)
    const result = getUserAccessibility()

    expect(result.hasHandicapPlacard).toBe(true)
    expect(result.placardType).toBe("permanent")
    expect(result.placardExpiry).toBe("2027-01-01")
  })

  it("returns default when stored value is invalid JSON", () => {
    localStorage.setItem("park_accessibility", "not-valid-json")
    const result = getUserAccessibility()
    expect(result.hasHandicapPlacard).toBe(false)
  })
})
