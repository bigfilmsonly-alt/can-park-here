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
  title: string
  description: string
  activeRule: ParkingRule | null
  timeRemaining: number | null // minutes until rule ends/starts
  nextRestriction: { rule: ParkingRule; startsIn: number } | null
  warnings: ParkingWarning[]
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
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(":").map(Number)
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

export function checkParking(
  lat: number, 
  lng: number, 
  userAccessibility?: UserAccessibility
): ParkingResult {
  const now = new Date()
  const zone = getZoneForLocation(lat, lng)
  const rules = rulesDatabase[zone] || rulesDatabase.default
  const warnings = generateWarnings(rules, now)

  // Check for handicap zones first
  const handicapRule = rules.find(
    (rule) => rule.type === "handicap-only" && isRuleActive(rule, now)
  )
  
  let handicapInfo: HandicapInfo | undefined
  
  if (handicapRule) {
    const hasValidPlacard = userAccessibility?.hasHandicapPlacard === true
    
    handicapInfo = {
      isHandicapZone: true,
      requiresPlacard: true,
      timeLimit: hasValidPlacard ? undefined : undefined,
      message: hasValidPlacard 
        ? "You have a valid placard - parking allowed"
        : "Handicap placard required to park here",
    }
    
    if (!hasValidPlacard) {
      return {
        status: "prohibited",
        title: "Accessible parking only",
        description: `This spot requires a handicap placard. Fine: $${handicapRule.fine}.`,
        activeRule: handicapRule,
        timeRemaining: null,
        nextRestriction: null,
        warnings: [{
          type: "tow",
          severity: "critical",
          message: `$${handicapRule.fine} fine - placard required`,
        }],
        handicapInfo,
      }
    }
  }

  // Check for tow zones
  const towZone = rules.find(
    (rule) => rule.type === "tow-zone" && isRuleActive(rule, now)
  )
  if (towZone) {
    return {
      status: "prohibited",
      title: "Tow-away zone",
      description: `Your car will be towed. Fine: $${towZone.fine} plus towing fees.`,
      activeRule: towZone,
      timeRemaining: getTimeRemainingForRule(towZone, now),
      nextRestriction: null,
      warnings,
      handicapInfo,
    }
  }

  // Check for fire hydrant / bus stop
  const safetyZone = rules.find(
    (rule) => 
      (rule.type === "fire-hydrant" || rule.type === "bus-stop") && 
      isRuleActive(rule, now)
  )
  if (safetyZone) {
    return {
      status: "prohibited",
      title: safetyZone.type === "fire-hydrant" ? "Fire hydrant zone" : "Bus stop",
      description: `${safetyZone.description}. Fine: $${safetyZone.fine}.`,
      activeRule: safetyZone,
      timeRemaining: null,
      nextRestriction: null,
      warnings,
      handicapInfo,
    }
  }

  // Find active restricting rules
  const activeRestrictingRules = rules.filter(
    (rule) =>
      isRuleActive(rule, now) &&
      (rule.type === "no-parking" || rule.type === "permit-only")
  )

  // Check for hard no-parking
  const noParking = activeRestrictingRules.find(
    (rule) => rule.type === "no-parking"
  )
  if (noParking) {
    return {
      status: "prohibited",
      title: "No parking",
      description: `${noParking.description}. This area is enforced. Fine: $${noParking.fine}.`,
      activeRule: noParking,
      timeRemaining: getTimeRemainingForRule(noParking, now),
      nextRestriction: null,
      warnings,
      handicapInfo,
    }
  }

  // Check for permit-only
  const permitOnly = activeRestrictingRules.find(
    (rule) => rule.type === "permit-only"
  )
  if (permitOnly) {
    return {
      status: "prohibited",
      title: "Permit required",
      description: `${permitOnly.description}. Visitors may be ticketed. Fine: $${permitOnly.fine}.`,
      activeRule: permitOnly,
      timeRemaining: null,
      nextRestriction: null,
      warnings: [...warnings, {
        type: "permit",
        severity: "warning",
        message: "Residential permit required",
      }],
      handicapInfo,
    }
  }

  // Find active soft restrictions (time limits, street cleaning, metered)
  const activeSoftRules = rules.filter(
    (rule) =>
      isRuleActive(rule, now) &&
      (rule.type === "time-limit" ||
        rule.type === "street-cleaning" ||
        rule.type === "metered" ||
        rule.type === "loading-zone")
  )

  // Street cleaning takes precedence
  const streetCleaning = activeSoftRules.find(
    (rule) => rule.type === "street-cleaning"
  )
  if (streetCleaning) {
    const timeRemaining = getTimeRemainingForRule(streetCleaning, now)
    return {
      status: "prohibited",
      title: "No parking - Street cleaning",
      description: `${streetCleaning.description}. Move your vehicle. Fine: $${streetCleaning.fine}.`,
      activeRule: streetCleaning,
      timeRemaining,
      nextRestriction: null,
      warnings,
      handicapInfo,
    }
  }

  // Loading zone
  const loadingZone = activeSoftRules.find(
    (rule) => rule.type === "loading-zone"
  )
  if (loadingZone) {
    return {
      status: "restricted",
      title: "Loading zone",
      description: `${loadingZone.description}. Commercial vehicles only.`,
      activeRule: loadingZone,
      timeRemaining: 30,
      nextRestriction: null,
      warnings,
      handicapInfo,
    }
  }

  // Time limit or metered
  const timedRule = activeSoftRules.find(
    (rule) => rule.type === "time-limit" || rule.type === "metered"
  )
  if (timedRule) {
    const nextRestriction = getNextRestrictionStart(
      rules.filter(
        (r) => r.type === "street-cleaning" || r.type === "no-parking" || r.type === "tow-zone"
      ),
      now
    )

    // Calculate max parking time (2 hours for time limit, or until next restriction)
    const maxParkingMinutes = timedRule.type === "time-limit" ? 120 : null
    const restrictionStartsIn = nextRestriction?.startsIn || null

    let timeRemaining = maxParkingMinutes
    if (restrictionStartsIn && (!timeRemaining || restrictionStartsIn < timeRemaining)) {
      timeRemaining = restrictionStartsIn
    }

    const description =
      timedRule.type === "metered"
        ? `${timedRule.description}.${
            nextRestriction
              ? ` Street cleaning begins in ${formatMinutes(nextRestriction.startsIn)}.`
              : ""
          }`
        : `${timedRule.description}.${
            nextRestriction
              ? ` Move before street cleaning at ${formatTimeFromMinutes(nextRestriction.startsIn, now)}.`
              : ""
          }`

    return {
      status: "restricted",
      title: "Parking allowed with restrictions",
      description,
      activeRule: timedRule,
      timeRemaining,
      nextRestriction,
      warnings,
      handicapInfo,
    }
  }

  // No active restrictions - check for upcoming ones
  const nextRestriction = getNextRestrictionStart(rules, now)

  if (nextRestriction && nextRestriction.startsIn <= 240) {
    // Within 4 hours
    return {
      status: "restricted",
      title: "Parking allowed",
      description: `Parking is free now. ${nextRestriction.rule.description} begins in ${formatMinutes(nextRestriction.startsIn)}.`,
      activeRule: null,
      timeRemaining: nextRestriction.startsIn,
      nextRestriction,
      warnings,
      handicapInfo,
    }
  }

  // If user has handicap placard and this is a handicap zone, provide that info
  if (handicapInfo?.isHandicapZone && userAccessibility?.hasHandicapPlacard) {
    return {
      status: "allowed",
      title: "Accessible parking available",
      description: "You can use this accessible parking spot with your placard. No time limit.",
      activeRule: null,
      timeRemaining: null,
      nextRestriction,
      warnings: [],
      handicapInfo,
    }
  }

  return {
    status: "allowed",
    title: "Yes, you can park here",
    description: "No current or upcoming restrictions in this area.",
    activeRule: null,
    timeRemaining: null,
    nextRestriction,
    warnings,
    handicapInfo,
  }
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`
  }

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

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
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}m`
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
