export type ParkingStatus = "allowed" | "restricted" | "prohibited"

export type RuleType =
  | "street-cleaning"
  | "permit-only"
  | "time-limit"
  | "no-parking"
  | "metered"
  | "handicap-only"
  | "tow-zone"
  | "loading-zone"
  | "fire-hydrant"
  | "bus-stop"

export interface ParkingRule {
  id: string
  type: RuleType
  days: number[] // 0 = Sunday, 6 = Saturday
  startTime: string // "HH:MM" 24-hour format
  endTime: string // "HH:MM" 24-hour format
  description: string
  towRisk?: "high" | "medium" | "low"
  fine?: number
}

export interface ParkingResult {
  status: ParkingStatus
  /** Plain-English headline — e.g. "Yes — park here." */
  headline: string
  /** Explanation sentence */
  reason: string
  /** Confidence 0-100 based on data quality */
  confidence: number
  /** Seconds until current rule expires, or null */
  timeRemaining: number | null
  /** Active restriction labels */
  restrictions: string[]
  /** Human-readable warning strings */
  warnings: ParkingWarning[]
  /** Geocoded street name */
  streetName: string
  /** Geocoded city */
  city: string

  // --- backward-compat aliases (consumed by app-context & status-screen) ---
  /** @deprecated Use headline */
  title: string
  /** @deprecated Use reason */
  description: string
  activeRule: ParkingRule | null
  nextRestriction: { rule: ParkingRule; startsIn: number } | null
  handicapInfo?: HandicapInfo
}

export interface ParkingWarning {
  type: "tow" | "street-cleaning" | "permit" | "time-limit" | "hydrant" | "bus-stop"
  severity: "critical" | "warning" | "info"
  message: string
  timeUntil?: number // minutes
}

export interface HandicapInfo {
  isHandicapZone: boolean
  requiresPlacard: boolean
  timeLimit?: number // minutes, null = unlimited
  message: string
}

export interface UserAccessibility {
  hasHandicapPlacard: boolean
  placardType?: "permanent" | "temporary" | "disabled-veteran"
  placardExpiry?: string // ISO date
}

// ---------------------------------------------------------------------------
// Major SF streets for rush-hour tow-away detection
// ---------------------------------------------------------------------------
const MAJOR_STREETS = ["market", "van ness", "mission", "geary", "19th avenue", "park presidio"]

function isMajorStreet(street: string): boolean {
  const normalized = street.toLowerCase()
  return MAJOR_STREETS.some((s) => normalized.includes(s))
}

// ---------------------------------------------------------------------------
// Address number parity — used to determine street-cleaning day
// ---------------------------------------------------------------------------
function getAddressNumber(street: string): number | null {
  const match = street.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

function isEvenSide(street: string): boolean {
  const num = getAddressNumber(street)
  if (num !== null) return num % 2 === 0
  // Fallback: hash the street name to get a deterministic even/odd
  let hash = 0
  for (let i = 0; i < street.length; i++) {
    hash = ((hash << 5) - hash + street.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 2 === 0
}

// Sample rules database - in production this would come from a real data source
const rulesDatabase: Record<string, ParkingRule[]> = {
  default: [
    {
      id: "street-cleaning-1",
      type: "street-cleaning",
      days: [1, 3], // Monday, Wednesday
      startTime: "08:00",
      endTime: "10:00",
      description: "Street cleaning in effect",
      towRisk: "high",
      fine: 75,
    },
    {
      id: "street-cleaning-2",
      type: "street-cleaning",
      days: [2, 4], // Tuesday, Thursday
      startTime: "14:00",
      endTime: "16:00",
      description: "Street cleaning in effect",
      towRisk: "high",
      fine: 75,
    },
    {
      id: "time-limit-1",
      type: "time-limit",
      days: [1, 2, 3, 4, 5], // Weekdays
      startTime: "09:00",
      endTime: "18:00",
      description: "2-hour parking limit",
      towRisk: "low",
      fine: 65,
    },
  ],
  downtown: [
    {
      id: "metered-1",
      type: "metered",
      days: [1, 2, 3, 4, 5, 6], // Mon-Sat
      startTime: "08:00",
      endTime: "20:00",
      description: "Metered parking - pay at kiosk",
      towRisk: "low",
      fine: 85,
    },
    {
      id: "no-parking-night",
      type: "no-parking",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "02:00",
      endTime: "06:00",
      description: "No parking - street cleaning",
      towRisk: "high",
      fine: 95,
    },
    {
      id: "tow-zone-1",
      type: "tow-zone",
      days: [1, 2, 3, 4, 5], // Weekdays
      startTime: "07:00",
      endTime: "09:00",
      description: "Tow-away zone - rush hour",
      towRisk: "high",
      fine: 500,
    },
    {
      id: "tow-zone-2",
      type: "tow-zone",
      days: [1, 2, 3, 4, 5], // Weekdays
      startTime: "16:00",
      endTime: "18:00",
      description: "Tow-away zone - rush hour",
      towRisk: "high",
      fine: 500,
    },
    {
      id: "handicap-1",
      type: "handicap-only",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "00:00",
      endTime: "23:59",
      description: "Handicap parking only - placard required",
      towRisk: "medium",
      fine: 450,
    },
  ],
  residential: [
    {
      id: "permit-only-1",
      type: "permit-only",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "00:00",
      endTime: "23:59",
      description: "Permit parking only - Area A",
      towRisk: "medium",
      fine: 95,
    },
    {
      id: "handicap-2",
      type: "handicap-only",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "00:00",
      endTime: "23:59",
      description: "Accessible parking - placard required",
      towRisk: "medium",
      fine: 450,
    },
  ],
  commercial: [
    {
      id: "loading-zone-1",
      type: "loading-zone",
      days: [1, 2, 3, 4, 5, 6], // Mon-Sat
      startTime: "07:00",
      endTime: "18:00",
      description: "Commercial loading zone - 30 min limit",
      towRisk: "medium",
      fine: 110,
    },
    {
      id: "bus-stop-1",
      type: "bus-stop",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "00:00",
      endTime: "23:59",
      description: "Bus stop - no parking",
      towRisk: "high",
      fine: 285,
    },
    {
      id: "fire-hydrant-1",
      type: "fire-hydrant",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "00:00",
      endTime: "23:59",
      description: "Fire hydrant zone - 15ft clearance required",
      towRisk: "high",
      fine: 115,
    },
  ],
  valencia: [
    {
      id: "valencia-time-limit",
      type: "time-limit",
      days: [1, 2, 3, 4, 5], // Weekdays
      startTime: "08:00",
      endTime: "18:00",
      description: "2-hour parking limit",
      towRisk: "low",
      fine: 65,
    },
    {
      id: "valencia-street-cleaning",
      type: "street-cleaning",
      days: [2], // Tuesday
      startTime: "08:00",
      endTime: "10:00",
      description: "Street cleaning in effect",
      towRisk: "high",
      fine: 75,
    },
    {
      id: "valencia-metered",
      type: "metered",
      days: [1, 2, 3, 4, 5, 6], // Mon-Sat
      startTime: "09:00",
      endTime: "18:00",
      description: "Metered parking - pay at kiosk",
      towRisk: "low",
      fine: 85,
    },
    {
      id: "valencia-permit-evening",
      type: "permit-only",
      days: [1, 2, 3, 4, 5, 6, 0], // Every day
      startTime: "18:00",
      endTime: "23:59",
      description: "Permit parking only - Zone Q evenings",
      towRisk: "medium",
      fine: 95,
    },
  ],
  mission: [
    {
      id: "mission-time-limit",
      type: "time-limit",
      days: [1, 2, 3, 4, 5], // Weekdays
      startTime: "08:00",
      endTime: "18:00",
      description: "2-hour parking limit",
      towRisk: "low",
      fine: 65,
    },
    {
      id: "mission-street-cleaning-mon",
      type: "street-cleaning",
      days: [1], // Monday
      startTime: "08:00",
      endTime: "10:00",
      description: "Street cleaning in effect",
      towRisk: "high",
      fine: 75,
    },
    {
      id: "mission-street-cleaning-thu",
      type: "street-cleaning",
      days: [4], // Thursday
      startTime: "08:00",
      endTime: "10:00",
      description: "Street cleaning in effect",
      towRisk: "high",
      fine: 75,
    },
    {
      id: "mission-no-parking-overnight",
      type: "no-parking",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "02:00",
      endTime: "06:00",
      description: "No parking 2 AM – 6 AM",
      towRisk: "high",
      fine: 95,
    },
    {
      id: "mission-tow-zone-rush",
      type: "tow-zone",
      days: [1, 2, 3, 4, 5], // Weekdays
      startTime: "07:00",
      endTime: "09:00",
      description: "Tow-away zone - rush hour",
      towRisk: "high",
      fine: 500,
    },
  ],
  soma: [
    {
      id: "soma-metered",
      type: "metered",
      days: [1, 2, 3, 4, 5, 6], // Mon-Sat
      startTime: "07:00",
      endTime: "18:00",
      description: "Metered parking - pay at kiosk",
      towRisk: "low",
      fine: 85,
    },
    {
      id: "soma-time-limit",
      type: "time-limit",
      days: [1, 2, 3, 4, 5, 6], // Mon-Sat
      startTime: "07:00",
      endTime: "18:00",
      description: "1-hour parking limit",
      towRisk: "low",
      fine: 65,
    },
    {
      id: "soma-tow-zone-evening",
      type: "tow-zone",
      days: [1, 2, 3, 4, 5], // Weekdays
      startTime: "16:00",
      endTime: "18:00",
      description: "Tow-away zone - evening rush",
      towRisk: "high",
      fine: 500,
    },
    {
      id: "soma-no-parking-overnight",
      type: "no-parking",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "00:00",
      endTime: "06:00",
      description: "No parking 12 AM – 6 AM",
      towRisk: "high",
      fine: 95,
    },
  ],
  castro: [
    {
      id: "castro-permit",
      type: "permit-only",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "00:00",
      endTime: "23:59",
      description: "Permit parking only - Zone S",
      towRisk: "medium",
      fine: 95,
    },
    {
      id: "castro-time-limit",
      type: "time-limit",
      days: [1, 2, 3, 4, 5], // Weekdays
      startTime: "08:00",
      endTime: "18:00",
      description: "2-hour limit for non-residents",
      towRisk: "low",
      fine: 65,
    },
    {
      id: "castro-street-cleaning",
      type: "street-cleaning",
      days: [3], // Wednesday
      startTime: "08:00",
      endTime: "10:00",
      description: "Street cleaning in effect",
      towRisk: "high",
      fine: 75,
    },
  ],
  marina: [
    {
      id: "marina-time-limit",
      type: "time-limit",
      days: [1, 2, 3, 4, 5, 6], // Mon-Sat
      startTime: "08:00",
      endTime: "18:00",
      description: "2-hour parking limit",
      towRisk: "low",
      fine: 65,
    },
    {
      id: "marina-permit-evening",
      type: "permit-only",
      days: [1, 2, 3, 4, 5, 6, 0], // Every day
      startTime: "18:00",
      endTime: "23:59",
      description: "Permit parking only - Zone K evenings/weekends",
      towRisk: "medium",
      fine: 95,
    },
    {
      id: "marina-street-cleaning",
      type: "street-cleaning",
      days: [5], // Friday
      startTime: "08:00",
      endTime: "10:00",
      description: "Street cleaning in effect",
      towRisk: "high",
      fine: 75,
    },
  ],
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const parts = timeStr.split(":").map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  return { hours, minutes }
}

function timeToMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes
}

function getMinutesUntilTime(
  targetHours: number,
  targetMinutes: number,
  currentDate: Date
): number {
  const currentMinutes = timeToMinutes(
    currentDate.getHours(),
    currentDate.getMinutes()
  )
  const targetTotalMinutes = timeToMinutes(targetHours, targetMinutes)

  if (targetTotalMinutes > currentMinutes) {
    return targetTotalMinutes - currentMinutes
  }

  // Target is tomorrow
  return 24 * 60 - currentMinutes + targetTotalMinutes
}

function isRuleActive(rule: ParkingRule, date: Date): boolean {
  const dayOfWeek = date.getDay()

  if (!rule.days.includes(dayOfWeek)) {
    return false
  }

  const currentMinutes = timeToMinutes(date.getHours(), date.getMinutes())
  const start = parseTime(rule.startTime)
  const end = parseTime(rule.endTime)
  const startMinutes = timeToMinutes(start.hours, start.minutes)
  const endMinutes = timeToMinutes(end.hours, end.minutes)

  // Handle overnight ranges (e.g., 22:00 - 06:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes
}

function getTimeRemainingForRule(rule: ParkingRule, date: Date): number {
  const end = parseTime(rule.endTime)
  return getMinutesUntilTime(end.hours, end.minutes, date)
}

function getNextRestrictionStart(
  rules: ParkingRule[],
  date: Date
): { rule: ParkingRule; startsIn: number } | null {
  const dayOfWeek = date.getDay()
  const currentMinutes = timeToMinutes(date.getHours(), date.getMinutes())

  let nearestRestriction: { rule: ParkingRule; startsIn: number } | null = null

  for (const rule of rules) {
    // Check today
    if (rule.days.includes(dayOfWeek)) {
      const start = parseTime(rule.startTime)
      const startMinutes = timeToMinutes(start.hours, start.minutes)

      if (startMinutes > currentMinutes) {
        const startsIn = startMinutes - currentMinutes

        if (!nearestRestriction || startsIn < nearestRestriction.startsIn) {
          nearestRestriction = { rule, startsIn }
        }
      }
    }

    // Check tomorrow
    const tomorrow = (dayOfWeek + 1) % 7
    if (rule.days.includes(tomorrow)) {
      const start = parseTime(rule.startTime)
      const startsIn =
        24 * 60 - currentMinutes + timeToMinutes(start.hours, start.minutes)

      if (!nearestRestriction || startsIn < nearestRestriction.startsIn) {
        nearestRestriction = { rule, startsIn }
      }
    }
  }

  return nearestRestriction
}

function getZoneForLocation(lat: number, lng: number): string {
  // Simple zone detection based on coordinates
  // In production, this would use proper geofencing or address lookup

  // Downtown zone (roughly central area)
  if (
    Math.abs(lat - 37.7849) < 0.01 &&
    Math.abs(lng - -122.4094) < 0.01
  ) {
    return "downtown"
  }

  // Residential zone (example area)
  if (
    Math.abs(lat - 37.7599) < 0.02 &&
    Math.abs(lng - -122.4148) < 0.02
  ) {
    return "residential"
  }

  // Commercial zone
  if (
    Math.abs(lat - 37.7879) < 0.01 &&
    Math.abs(lng - -122.4074) < 0.01
  ) {
    return "commercial"
  }

  return "default"
}

export function getZoneFromAddress(street?: string, city?: string): string {
  if (!street) return "default"

  const normalized = street.toLowerCase()

  // SF street-name patterns mapped to zones
  const streetPatterns: { patterns: string[]; zone: string }[] = [
    { patterns: ["market"], zone: "downtown" },
    { patterns: ["valencia", "mission", "guerrero"], zone: "mission" },
    { patterns: ["noe", "castro", "sanchez"], zone: "castro" },
    { patterns: ["howard", "folsom", "harrison"], zone: "soma" },
    { patterns: ["chestnut", "lombard", "fillmore", "marina"], zone: "marina" },
  ]

  for (const { patterns, zone } of streetPatterns) {
    for (const pattern of patterns) {
      if (normalized.includes(pattern)) {
        // "valencia" street matches the valencia zone specifically
        if (pattern === "valencia") return "valencia"
        return zone
      }
    }
  }

  return "default"
}

function generateWarnings(rules: ParkingRule[], date: Date): ParkingWarning[] {
  const warnings: ParkingWarning[] = []
  
  for (const rule of rules) {
    // Check for upcoming street cleaning
    if (rule.type === "street-cleaning") {
      if (isRuleActive(rule, date)) {
        warnings.push({
          type: "street-cleaning",
          severity: "critical",
          message: "Street cleaning now - move immediately",
        })
      } else {
        // Check if starting soon
        const dayOfWeek = date.getDay()
        if (rule.days.includes(dayOfWeek)) {
          const start = parseTime(rule.startTime)
          const currentMinutes = timeToMinutes(date.getHours(), date.getMinutes())
          const startMinutes = timeToMinutes(start.hours, start.minutes)
          const minutesUntil = startMinutes - currentMinutes
          
          if (minutesUntil > 0 && minutesUntil <= 120) {
            warnings.push({
              type: "street-cleaning",
              severity: "warning",
              message: `Street cleaning starts in ${formatMinutes(minutesUntil)}`,
              timeUntil: minutesUntil,
            })
          }
        }
      }
    }
    
    // Check for tow zones
    if (rule.type === "tow-zone" && isRuleActive(rule, date)) {
      warnings.push({
        type: "tow",
        severity: "critical",
        message: `Tow-away zone active - $${rule.fine} fine + tow fees`,
      })
    }
    
    // Check for fire hydrant / bus stop
    if (rule.type === "fire-hydrant" || rule.type === "bus-stop") {
      warnings.push({
        type: rule.type === "fire-hydrant" ? "hydrant" : "bus-stop",
        severity: "critical",
        message: rule.description,
      })
    }
  }
  
  return warnings
}

// ---------------------------------------------------------------------------
// Helper: build a full ParkingResult with backward-compat aliases
// ---------------------------------------------------------------------------
function buildResult(fields: {
  status: ParkingStatus
  headline: string
  reason: string
  confidence: number
  timeRemaining: number | null
  restrictions: string[]
  warnings: ParkingWarning[]
  streetName: string
  city: string
  activeRule?: ParkingRule | null
  nextRestriction?: { rule: ParkingRule; startsIn: number } | null
  handicapInfo?: HandicapInfo
}): ParkingResult {
  return {
    status: fields.status,
    headline: fields.headline,
    reason: fields.reason,
    confidence: fields.confidence,
    timeRemaining: fields.timeRemaining,
    restrictions: fields.restrictions,
    warnings: fields.warnings,
    streetName: fields.streetName,
    city: fields.city,
    // backward-compat
    title: fields.headline,
    description: fields.reason,
    activeRule: fields.activeRule ?? null,
    nextRestriction: fields.nextRestriction ?? null,
    handicapInfo: fields.handicapInfo,
  }
}

// ---------------------------------------------------------------------------
// Seconds remaining until a clock time today (or tomorrow if already passed)
// ---------------------------------------------------------------------------
function secondsUntilTime(targetHour: number, targetMin: number, now: Date): number {
  const target = new Date(now)
  target.setHours(targetHour, targetMin, 0, 0)
  let diff = (target.getTime() - now.getTime()) / 1000
  if (diff <= 0) diff += 24 * 3600 // wraps to tomorrow
  return Math.round(diff)
}

export function checkParking(
  lat: number,
  lng: number,
  userAccessibility?: UserAccessibility,
  street?: string,
  city?: string,
): ParkingResult {
  const now = new Date()
  const day = now.getDay()        // 0 = Sunday
  const hour = now.getHours()
  const minute = now.getMinutes()
  const isWeekday = day >= 1 && day <= 5
  const isSaturday = day === 6
  const isSunday = day === 0

  const resolvedStreet = street || "Unknown street"
  const resolvedCity = city || "San Francisco"
  const confidence = street ? 93 : 78

  // --- legacy zone/rules lookup for handicap + safety checks ---
  const addressZone = getZoneFromAddress(street, city)
  const zone = addressZone !== "default" ? addressZone : getZoneForLocation(lat, lng)
  const rules = rulesDatabase[zone] || rulesDatabase.default
  const legacyWarnings = generateWarnings(rules, now)

  // ---------------------------------------------------------------
  // 1) Handicap zone check (uses legacy rules DB)
  // ---------------------------------------------------------------
  const handicapRule = rules.find(
    (rule) => rule.type === "handicap-only" && isRuleActive(rule, now)
  )
  let handicapInfo: HandicapInfo | undefined
  if (handicapRule) {
    const hasValidPlacard = userAccessibility?.hasHandicapPlacard === true
    handicapInfo = {
      isHandicapZone: true,
      requiresPlacard: true,
      message: hasValidPlacard
        ? "You have a valid placard - parking allowed"
        : "Handicap placard required to park here",
    }
    if (!hasValidPlacard) {
      return buildResult({
        status: "prohibited",
        headline: "Don't park here.",
        reason: `This spot requires a handicap placard. Fine: $${handicapRule.fine}.`,
        confidence,
        timeRemaining: null,
        restrictions: ["Handicap placard required"],
        warnings: [{ type: "tow", severity: "critical", message: `$${handicapRule.fine} fine - placard required` }],
        streetName: resolvedStreet,
        city: resolvedCity,
        activeRule: handicapRule,
        handicapInfo,
      })
    }
  }

  // ---------------------------------------------------------------
  // 2) Fire hydrant / bus stop — always prohibited (uses legacy DB)
  // ---------------------------------------------------------------
  const safetyZone = rules.find(
    (rule) =>
      (rule.type === "fire-hydrant" || rule.type === "bus-stop") &&
      isRuleActive(rule, now)
  )
  if (safetyZone) {
    const label = safetyZone.type === "fire-hydrant" ? "Fire hydrant zone" : "Bus stop"
    return buildResult({
      status: "prohibited",
      headline: "Don't park here.",
      reason: `${safetyZone.description}. Fine: $${safetyZone.fine}.`,
      confidence: 99,
      timeRemaining: null,
      restrictions: [label],
      warnings: legacyWarnings,
      streetName: resolvedStreet,
      city: resolvedCity,
      activeRule: safetyZone,
      handicapInfo,
    })
  }

  // ---------------------------------------------------------------
  // 3) Rush hour tow-away — Mon-Fri 3-7 PM on major streets
  // ---------------------------------------------------------------
  const onMajorStreet = street ? isMajorStreet(street) : false
  if (isWeekday && hour >= 15 && hour < 19 && onMajorStreet) {
    const secsLeft = secondsUntilTime(19, 0, now)
    // Also look up the legacy tow-zone rule if it exists
    const towRule = rules.find((r) => r.type === "tow-zone" && isRuleActive(r, now))
    return buildResult({
      status: "prohibited",
      headline: "Don't park here.",
      reason: `Rush hour tow-away zone active until 7 PM on ${resolvedStreet}. Your car will be towed.`,
      confidence: 95,
      timeRemaining: secsLeft,
      restrictions: ["Rush hour tow-away zone", "Active until 7 PM"],
      warnings: [
        { type: "tow", severity: "critical", message: "Tow-away zone active — $500+ fine plus towing fees" },
        ...legacyWarnings.filter((w) => w.type !== "tow"),
      ],
      streetName: resolvedStreet,
      city: resolvedCity,
      activeRule: towRule ?? null,
      handicapInfo,
    })
  }

  // ---------------------------------------------------------------
  // 4) Legacy tow-zone check (for zones like SOMA evening rush)
  // ---------------------------------------------------------------
  const towZone = rules.find(
    (rule) => rule.type === "tow-zone" && isRuleActive(rule, now)
  )
  if (towZone) {
    const timeRemainingMins = getTimeRemainingForRule(towZone, now)
    return buildResult({
      status: "prohibited",
      headline: "Don't park here.",
      reason: `Your car will be towed. Fine: $${towZone.fine} plus towing fees.`,
      confidence,
      timeRemaining: timeRemainingMins * 60,
      restrictions: ["Tow-away zone"],
      warnings: legacyWarnings,
      streetName: resolvedStreet,
      city: resolvedCity,
      activeRule: towZone,
      handicapInfo,
    })
  }

  // ---------------------------------------------------------------
  // 5) Street cleaning — varies by block
  //    Even addresses → Tuesday 8-10 AM
  //    Odd addresses  → Thursday 8-10 AM
  // ---------------------------------------------------------------
  const evenSide = isEvenSide(resolvedStreet)
  const cleaningDay = evenSide ? 2 : 4  // Tuesday or Thursday
  const isCleaningTime = day === cleaningDay && hour >= 8 && hour < 10

  if (isCleaningTime) {
    const secsLeft = secondsUntilTime(10, 0, now)
    const cleaningRule = rules.find((r) => r.type === "street-cleaning" && isRuleActive(r, now))
    return buildResult({
      status: "prohibited",
      headline: "Don't park here.",
      reason: "Street cleaning in progress. You will be ticketed and possibly towed.",
      confidence: 95,
      timeRemaining: secsLeft,
      restrictions: ["Street cleaning in progress"],
      warnings: [
        { type: "street-cleaning", severity: "critical", message: "Street cleaning now — move immediately" },
        ...legacyWarnings.filter((w) => w.type !== "street-cleaning"),
      ],
      streetName: resolvedStreet,
      city: resolvedCity,
      activeRule: cleaningRule ?? null,
      handicapInfo,
    })
  }

  // Also check legacy street-cleaning rules (some zones have different schedules)
  const legacyStreetCleaning = rules.find(
    (rule) => rule.type === "street-cleaning" && isRuleActive(rule, now)
  )
  if (legacyStreetCleaning) {
    const timeRemainingMins = getTimeRemainingForRule(legacyStreetCleaning, now)
    return buildResult({
      status: "prohibited",
      headline: "Don't park here.",
      reason: `${legacyStreetCleaning.description}. Move your vehicle. Fine: $${legacyStreetCleaning.fine}.`,
      confidence,
      timeRemaining: timeRemainingMins * 60,
      restrictions: ["Street cleaning in progress"],
      warnings: legacyWarnings,
      streetName: resolvedStreet,
      city: resolvedCity,
      activeRule: legacyStreetCleaning,
      handicapInfo,
    })
  }

  // ---------------------------------------------------------------
  // 6) Legacy no-parking & permit-only checks
  // ---------------------------------------------------------------
  const noParking = rules.find(
    (rule) => rule.type === "no-parking" && isRuleActive(rule, now)
  )
  if (noParking) {
    const timeRemainingMins = getTimeRemainingForRule(noParking, now)
    return buildResult({
      status: "prohibited",
      headline: "Don't park here.",
      reason: `${noParking.description}. This area is enforced. Fine: $${noParking.fine}.`,
      confidence,
      timeRemaining: timeRemainingMins * 60,
      restrictions: ["No parking zone"],
      warnings: legacyWarnings,
      streetName: resolvedStreet,
      city: resolvedCity,
      activeRule: noParking,
      handicapInfo,
    })
  }

  const permitOnly = rules.find(
    (rule) => rule.type === "permit-only" && isRuleActive(rule, now)
  )
  if (permitOnly) {
    return buildResult({
      status: "prohibited",
      headline: "Don't park here.",
      reason: `${permitOnly.description}. Visitors may be ticketed. Fine: $${permitOnly.fine}.`,
      confidence,
      timeRemaining: null,
      restrictions: ["Residential permit required"],
      warnings: [
        ...legacyWarnings,
        { type: "permit", severity: "warning", message: "Residential permit required" },
      ],
      streetName: resolvedStreet,
      city: resolvedCity,
      activeRule: permitOnly,
      handicapInfo,
    })
  }

  // ---------------------------------------------------------------
  // 7) Sunday or after 6 PM → free parking, no meter
  // ---------------------------------------------------------------
  if (isSunday || hour >= 18) {
    // Time until next restriction: Mon 8 AM (for Sunday), or next morning 8 AM
    let secsUntilNext: number | null = null
    if (isSunday) {
      // seconds until Monday 8 AM
      const monday8am = new Date(now)
      monday8am.setDate(monday8am.getDate() + 1)
      monday8am.setHours(8, 0, 0, 0)
      secsUntilNext = Math.round((monday8am.getTime() - now.getTime()) / 1000)
    } else {
      // After 6 PM on a weekday/Saturday — until 8 AM tomorrow
      secsUntilNext = secondsUntilTime(8, 0, now)
    }

    // Check for upcoming street cleaning warning
    const cleaningWarnings: ParkingWarning[] = []
    const cleaningDayName = evenSide ? "Tuesday" : "Thursday"
    const tomorrowDay = (day + 1) % 7
    if (tomorrowDay === cleaningDay) {
      cleaningWarnings.push({
        type: "street-cleaning",
        severity: "warning",
        message: `Street cleaning tomorrow ${cleaningDayName} 8-10 AM`,
      })
    }

    // Accessible parking with placard
    if (handicapInfo?.isHandicapZone && userAccessibility?.hasHandicapPlacard) {
      return buildResult({
        status: "allowed",
        headline: "Yes — park here.",
        reason: "You can use this accessible parking spot with your placard. No time limit.",
        confidence,
        timeRemaining: null,
        restrictions: [],
        warnings: [],
        streetName: resolvedStreet,
        city: resolvedCity,
        handicapInfo,
      })
    }

    return buildResult({
      status: "allowed",
      headline: "Yes — park here.",
      reason: "Free parking. No meter required.",
      confidence,
      timeRemaining: secsUntilNext,
      restrictions: [],
      warnings: [...cleaningWarnings, ...legacyWarnings.filter((w) => w.severity !== "critical")],
      streetName: resolvedStreet,
      city: resolvedCity,
      handicapInfo,
    })
  }

  // ---------------------------------------------------------------
  // 8) Mon-Sat 9 AM - 6 PM → metered, 2-hour limit
  // ---------------------------------------------------------------
  if ((isWeekday || isSaturday) && hour >= 9 && hour < 18) {
    const secsUntil6pm = secondsUntilTime(18, 0, now)
    const twoHoursInSecs = 2 * 3600
    // Effective time remaining is the lesser of 2h or time until 6 PM
    const effectiveRemaining = Math.min(twoHoursInSecs, secsUntil6pm)

    // Build a human headline based on remaining time
    const endHour = Math.min(hour + 2, 18)
    const headline = endHour >= 18
      ? "Yes — until 6 PM."
      : `Yes — until ${formatClockHour(endHour, minute)}.`

    const restrictions: string[] = ["2-hour limit", "Meter active"]
    const meterRule = rules.find((r) => r.type === "metered" && isRuleActive(r, now))
    const timeLimitRule = rules.find((r) => r.type === "time-limit" && isRuleActive(r, now))

    // Upcoming street cleaning warning
    const upcomingWarnings: ParkingWarning[] = []
    const cleaningDayName = evenSide ? "Tuesday" : "Thursday"
    if (day === cleaningDay && hour < 8) {
      upcomingWarnings.push({
        type: "street-cleaning",
        severity: "warning",
        message: `Street cleaning today ${cleaningDayName} 8-10 AM`,
      })
    }

    // Check for upcoming tow-away on major streets
    if (onMajorStreet && isWeekday && hour < 15) {
      const secsUntilRush = secondsUntilTime(15, 0, now)
      if (secsUntilRush < 4 * 3600) {
        upcomingWarnings.push({
          type: "tow",
          severity: "warning",
          message: `Rush hour tow-away begins at 3 PM`,
          timeUntil: Math.round(secsUntilRush / 60),
        })
      }
    }

    const nextRestriction = getNextRestrictionStart(
      rules.filter((r) => r.type === "street-cleaning" || r.type === "no-parking" || r.type === "tow-zone"),
      now
    )

    return buildResult({
      status: "restricted",
      headline,
      reason: "2-hour limit. Meter active.",
      confidence,
      timeRemaining: effectiveRemaining,
      restrictions,
      warnings: [...upcomingWarnings, ...legacyWarnings],
      streetName: resolvedStreet,
      city: resolvedCity,
      activeRule: meterRule ?? timeLimitRule ?? null,
      nextRestriction,
      handicapInfo,
    })
  }

  // ---------------------------------------------------------------
  // 9) Mon-Fri 8-9 AM — 2-hour residential limit (no meter yet)
  // ---------------------------------------------------------------
  if (isWeekday && hour >= 8 && hour < 9) {
    const secsUntil9am = secondsUntilTime(9, 0, now)
    const timeLimitRule = rules.find((r) => r.type === "time-limit" && isRuleActive(r, now))

    return buildResult({
      status: "restricted",
      headline: "Yes — until 6 PM.",
      reason: "2-hour residential limit. Meters start at 9 AM.",
      confidence,
      timeRemaining: 2 * 3600,
      restrictions: ["2-hour limit", "Meter starts at 9 AM"],
      warnings: legacyWarnings,
      streetName: resolvedStreet,
      city: resolvedCity,
      activeRule: timeLimitRule ?? null,
      nextRestriction: getNextRestrictionStart(rules, now),
      handicapInfo,
    })
  }

  // ---------------------------------------------------------------
  // 10) Loading zone check (legacy)
  // ---------------------------------------------------------------
  const loadingZone = rules.find(
    (rule) => rule.type === "loading-zone" && isRuleActive(rule, now)
  )
  if (loadingZone) {
    return buildResult({
      status: "restricted",
      headline: "Only 30 minutes.",
      reason: `${loadingZone.description}. Commercial vehicles only.`,
      confidence,
      timeRemaining: 30 * 60,
      restrictions: ["Loading zone", "30-minute limit"],
      warnings: legacyWarnings,
      streetName: resolvedStreet,
      city: resolvedCity,
      activeRule: loadingZone,
      handicapInfo,
    })
  }

  // ---------------------------------------------------------------
  // 11) Default — no active restrictions
  // ---------------------------------------------------------------
  const nextRestriction = getNextRestrictionStart(rules, now)

  if (nextRestriction && nextRestriction.startsIn <= 240) {
    const secsUntil = nextRestriction.startsIn * 60
    return buildResult({
      status: "restricted",
      headline: `Yes — for ${formatTimeRemaining(nextRestriction.startsIn)}.`,
      reason: `Parking is free now. ${nextRestriction.rule.description} begins in ${formatMinutes(nextRestriction.startsIn)}.`,
      confidence,
      timeRemaining: secsUntil,
      restrictions: ["Upcoming restriction"],
      warnings: legacyWarnings,
      streetName: resolvedStreet,
      city: resolvedCity,
      nextRestriction,
      handicapInfo,
    })
  }

  // Accessible parking with placard
  if (handicapInfo?.isHandicapZone && userAccessibility?.hasHandicapPlacard) {
    return buildResult({
      status: "allowed",
      headline: "Yes — park here.",
      reason: "You can use this accessible parking spot with your placard. No time limit.",
      confidence,
      timeRemaining: null,
      restrictions: [],
      warnings: [],
      streetName: resolvedStreet,
      city: resolvedCity,
      handicapInfo,
    })
  }

  return buildResult({
    status: "allowed",
    headline: "Yes — park here.",
    reason: "No current or upcoming restrictions in this area.",
    confidence,
    timeRemaining: null,
    restrictions: [],
    warnings: legacyWarnings,
    streetName: resolvedStreet,
    city: resolvedCity,
    nextRestriction,
    handicapInfo,
  })
}

// ---------------------------------------------------------------------------
// Format a clock hour for headlines — "2 PM", "4:30 PM"
// ---------------------------------------------------------------------------
function formatClockHour(hour24: number, minuteOffset: number = 0): string {
  const totalMinutes = hour24 * 60 + minuteOffset
  // Round to nearest 2-hour block end for clean display
  const targetHour = Math.min(Math.ceil(totalMinutes / 60), 18)
  const suffix = targetHour >= 12 ? "PM" : "AM"
  const display = targetHour > 12 ? targetHour - 12 : targetHour === 0 ? 12 : targetHour
  return `${display} ${suffix}`
}

function formatMinutes(minutes: number): string {
  const rounded = Math.round(minutes)
  if (rounded < 60) {
    return `${rounded} minute${rounded !== 1 ? "s" : ""}`
  }

  const hours = Math.floor(rounded / 60)
  const mins = rounded % 60

  if (mins === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`
  }

  return `${hours}h ${mins}m`
}

function formatTimeFromMinutes(minutesFromNow: number, fromDate: Date): string {
  const targetDate = new Date(fromDate.getTime() + minutesFromNow * 60 * 1000)
  return targetDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatTimeRemaining(minutes: number): string {
  if (minutes <= 0) return "0 min"
  const rounded = Math.round(minutes)
  const hours = Math.floor(rounded / 60)
  const mins = rounded % 60

  if (hours === 0) {
    return `${mins} min`
  }

  if (mins === 0) {
    return `${hours}h`
  }

  return `${hours}h ${mins.toString().padStart(2, "0")}m`
}

// Get user accessibility settings from localStorage
export function getUserAccessibility(): UserAccessibility {
  if (typeof window === "undefined") {
    return { hasHandicapPlacard: false }
  }
  
  const stored = localStorage.getItem("park_accessibility")
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return { hasHandicapPlacard: false }
    }
  }
  return { hasHandicapPlacard: false }
}

// Save user accessibility settings
export function setUserAccessibility(settings: UserAccessibility): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("park_accessibility", JSON.stringify(settings))
  }
}
