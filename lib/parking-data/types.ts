/**
 * Park — Comprehensive parking rules data types.
 * Covers SF Bay Area and Miami metro.
 */

export type CityId = "sf" | "oakland" | "berkeley" | "san-jose" | "miami" | "miami-beach" | "coral-gables"

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0=Sun, 6=Sat

export type SweepingSide = "even" | "odd" | "both"

/** A street sweeping schedule for a specific block or zone */
export interface SweepingSchedule {
  /** Block or zone identifier */
  id: string
  /** City */
  city: CityId
  /** Neighborhood or district name */
  neighborhood: string
  /** Street name pattern (e.g. "Valencia St" or "100-300 Valencia St") */
  streetPattern: string
  /** Which side of the street */
  side: SweepingSide
  /** Day of week (0=Sun) */
  day: DayOfWeek
  /** Week of month: 1=first, 2=second, 3=third, 4=fourth, 0=every week */
  weekOfMonth: 0 | 1 | 2 | 3 | 4
  /** Start time "HH:MM" 24hr */
  startTime: string
  /** End time "HH:MM" 24hr */
  endTime: string
  /** Fine amount in dollars */
  fine: number
}

/** Meter enforcement configuration for a zone/area */
export interface MeterZone {
  id: string
  city: CityId
  neighborhood: string
  /** Street or area pattern */
  streetPattern: string
  /** Days meters are enforced */
  days: DayOfWeek[]
  startTime: string
  endTime: string
  /** Rate in dollars per hour */
  ratePerHour: number
  /** Max time in minutes */
  maxMinutes: number
  /** Payment methods */
  paymentMethods: string[]
}

/** Tow-away zone */
export interface TowZone {
  id: string
  city: CityId
  /** Street name */
  street: string
  /** Direction: "inbound", "outbound", "both" */
  direction: "inbound" | "outbound" | "both"
  days: DayOfWeek[]
  startTime: string
  endTime: string
  /** Description */
  description: string
  fine: number
}

/** Residential Permit Parking zone */
export interface PermitZone {
  id: string
  city: CityId
  /** Zone letter/number */
  zoneName: string
  neighborhood: string
  /** Days permit is enforced */
  days: DayOfWeek[]
  startTime: string
  endTime: string
  /** Time limit for non-permit holders (minutes) */
  nonResidentLimit: number
}

/** Holiday definition */
export interface ParkingHoliday {
  /** Holiday name */
  name: string
  /** Month (1-12) */
  month: number
  /** Day of month, or null for floating holidays */
  day: number | null
  /** For floating holidays: which occurrence of which weekday */
  weekday?: DayOfWeek
  weekdayOccurrence?: 1 | 2 | 3 | 4 | -1 // -1 = last
  /** What's suspended */
  metersSuspended: boolean
  sweepingSuspended: boolean
  /** Which cities observe this */
  cities: CityId[]
}

/** Handicap parking rules for a city/state */
export interface HandicapRules {
  city: CityId
  /** Free meter parking? */
  freeMeters: boolean
  /** Time limit at meters (minutes), null = unlimited */
  meterTimeLimit: number | null
  /** Can park in green zones? */
  greenZoneAccess: boolean
  /** Can park in residential permit zones? */
  rppExempt: boolean
  /** Additional rules text */
  notes: string
}

/** Color curb zone type */
export type CurbColor = "red" | "yellow" | "white" | "green" | "blue"

export interface CurbZoneRules {
  color: CurbColor
  /** What it means */
  meaning: string
  /** Time limit in minutes, 0 = no stopping */
  timeLimit: number
  /** Hours enforced */
  enforcedDays: DayOfWeek[]
  enforcedStart: string
  enforcedEnd: string
  /** After hours, open to all? */
  openAfterHours: boolean
}
