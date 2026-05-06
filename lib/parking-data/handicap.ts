import type { HandicapRules, CurbZoneRules, CityId } from "./types"

/**
 * Handicap/accessible parking rules by city.
 * California and Florida have different state laws.
 */
export const HANDICAP_RULES: Record<CityId, HandicapRules> = {
  // ── California cities ──
  // CA Vehicle Code 22511.5: Disabled placard holders may park:
  // - At any meter without paying, for unlimited time (unless posted otherwise)
  // - In blue zones
  // - In time-limit zones without time restriction
  // - In residential permit zones
  // - NOT in red, yellow, white, or green zones (unless actively loading)
  // - NOT in tow-away zones during posted hours
  sf: {
    city: "sf",
    freeMeters: true,
    meterTimeLimit: null, // unlimited in CA
    greenZoneAccess: false,
    rppExempt: true,
    notes: "CA law: park free at any meter for unlimited time. Cannot park in red, tow-away, or green zones. Street sweeping still applies.",
  },
  oakland: {
    city: "oakland",
    freeMeters: true,
    meterTimeLimit: null,
    greenZoneAccess: false,
    rppExempt: true,
    notes: "Same CA state rules as SF. Free metered parking, unlimited time.",
  },
  berkeley: {
    city: "berkeley",
    freeMeters: true,
    meterTimeLimit: null,
    greenZoneAccess: false,
    rppExempt: true,
    notes: "Same CA state rules. Note: some UC Berkeley campus lots have separate rules.",
  },
  "san-jose": {
    city: "san-jose",
    freeMeters: true,
    meterTimeLimit: null,
    greenZoneAccess: false,
    rppExempt: true,
    notes: "Same CA state rules. Downtown meters are free with placard.",
  },

  // ── Florida cities ──
  // FL Statute 316.1964: Disabled parking permit holders may:
  // - Park free at any meter
  // - Time limit at meters varies — state law doesn't cap it, but some cities enforce limits
  // - In Miami-Dade, placard holders get unlimited time at meters
  // - Cannot park in fire lanes, loading zones during enforcement, or no-parking zones
  // FL Statute 316.1964: Free metered parking for up to 4 HOURS (not unlimited).
  // Local governments may extend but default is 4 hours.
  miami: {
    city: "miami",
    freeMeters: true,
    meterTimeLimit: 240, // 4 hours per FL state law
    greenZoneAccess: false,
    rppExempt: true,
    notes: "FL law: park free at meters for up to 4 hours. Cannot park in bus zones, fire lanes, or ADA access aisles. Must display placard visibly.",
  },
  "miami-beach": {
    city: "miami-beach",
    freeMeters: true,
    meterTimeLimit: 240, // 4 hours per FL state law
    greenZoneAccess: false,
    rppExempt: true,
    notes: "FL law: 4 hours free at meters. Miami Beach enforces very strictly — placard must be clearly visible. Entertainment District meters are 24/7.",
  },
  "coral-gables": {
    city: "coral-gables",
    freeMeters: true,
    meterTimeLimit: 240, // 4 hours per FL state law
    greenZoneAccess: false,
    rppExempt: true,
    notes: "FL law: 4 hours free at meters. Coral Gables is known for strict enforcement — always display placard.",
  },
}

/**
 * Color curb zone rules (universal in California, similar in Florida)
 */
export const CURB_ZONES: CurbZoneRules[] = [
  {
    color: "red",
    meaning: "No stopping, standing, or parking at any time",
    timeLimit: 0,
    enforcedDays: [0, 1, 2, 3, 4, 5, 6],
    enforcedStart: "00:00",
    enforcedEnd: "23:59",
    openAfterHours: false,
  },
  {
    color: "yellow",
    meaning: "Commercial loading only",
    timeLimit: 30, // 30 minutes for commercial vehicles
    enforcedDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    enforcedStart: "07:00",
    enforcedEnd: "18:00",
    openAfterHours: true, // Can park freely after 6pm
  },
  {
    color: "white",
    meaning: "Passenger loading/unloading only",
    timeLimit: 5,
    enforcedDays: [0, 1, 2, 3, 4, 5, 6],
    enforcedStart: "00:00",
    enforcedEnd: "23:59",
    openAfterHours: false,
  },
  {
    color: "green",
    meaning: "Short-term metered parking",
    timeLimit: 15, // typically 10-30 minutes
    enforcedDays: [1, 2, 3, 4, 5, 6],
    enforcedStart: "09:00",
    enforcedEnd: "18:00",
    openAfterHours: true,
  },
  {
    color: "blue",
    meaning: "Handicap/accessible parking only — placard required",
    timeLimit: 0, // unlimited for placard holders
    enforcedDays: [0, 1, 2, 3, 4, 5, 6],
    enforcedStart: "00:00",
    enforcedEnd: "23:59",
    openAfterHours: false,
  },
]
