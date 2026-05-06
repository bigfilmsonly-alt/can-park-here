import type { ParkingHoliday, CityId } from "./types"

/**
 * Parking enforcement holidays — verified from official sources.
 *
 * SF (SFMTA):
 *   - Meters suspended: ONLY 3 days (New Year's, Thanksgiving, Christmas)
 *   - Residential sweeping suspended: 11 days
 *   - Commercial/night sweeping suspended: ONLY 3 days (same as meters)
 *   Source: sfmta.com/getting-around/drive-park/holiday-enforcement-schedule
 *
 * Miami / Miami Beach:
 *   - Meters: NEVER suspended (enforced 7 days/week including holidays)
 *   - Miami Beach: meters enforced 24/7 in Entertainment District
 *   - City of Miami: holiday promotional programs (extra free hour late Nov-Jan 1)
 */
export const PARKING_HOLIDAYS: ParkingHoliday[] = [
  // ═══════════════════════════════════════════════
  // FULL SUSPENSION (meters + sweeping)
  // Only these 3 days suspend SF meters
  // ═══════════════════════════════════════════════
  {
    name: "New Year's Day",
    month: 1, day: 1,
    metersSuspended: true, sweepingSuspended: true,
    cities: ["sf", "oakland", "berkeley", "san-jose"],
  },
  {
    name: "Thanksgiving Day",
    month: 11, day: null, weekday: 4, weekdayOccurrence: 4,
    metersSuspended: true, sweepingSuspended: true,
    cities: ["sf", "oakland", "berkeley", "san-jose"],
  },
  {
    name: "Christmas Day",
    month: 12, day: 25,
    metersSuspended: true, sweepingSuspended: true,
    cities: ["sf", "oakland", "berkeley", "san-jose"],
  },

  // ═══════════════════════════════════════════════
  // PARTIAL SUSPENSION (sweeping only, meters still enforced)
  // SF: These 8 additional holidays suspend residential sweeping
  // but meters and tow-away are STILL enforced
  // ═══════════════════════════════════════════════
  {
    name: "Martin Luther King Jr. Day",
    month: 1, day: null, weekday: 1, weekdayOccurrence: 3,
    metersSuspended: false, sweepingSuspended: true,
    cities: ["sf", "oakland", "berkeley", "san-jose"],
  },
  {
    name: "Presidents' Day",
    month: 2, day: null, weekday: 1, weekdayOccurrence: 3,
    metersSuspended: false, sweepingSuspended: true,
    cities: ["sf", "oakland", "berkeley", "san-jose"],
  },
  {
    name: "Memorial Day",
    month: 5, day: null, weekday: 1, weekdayOccurrence: -1,
    metersSuspended: false, sweepingSuspended: true,
    cities: ["sf", "oakland", "berkeley", "san-jose"],
  },
  {
    name: "Independence Day",
    month: 7, day: 4,
    metersSuspended: false, sweepingSuspended: true,
    cities: ["sf", "oakland", "berkeley", "san-jose"],
  },
  {
    name: "Labor Day",
    month: 9, day: null, weekday: 1, weekdayOccurrence: 1,
    metersSuspended: false, sweepingSuspended: true,
    cities: ["sf", "oakland", "berkeley", "san-jose"],
  },
  {
    name: "Indigenous Peoples' Day",
    month: 10, day: null, weekday: 1, weekdayOccurrence: 2,
    metersSuspended: false, sweepingSuspended: true,
    cities: ["sf", "oakland", "berkeley", "san-jose"],
  },
  {
    name: "Veterans Day",
    month: 11, day: 11,
    metersSuspended: false, sweepingSuspended: true,
    cities: ["sf", "oakland", "berkeley", "san-jose"],
  },
  {
    name: "Day After Thanksgiving",
    month: 11, day: null, weekday: 5, weekdayOccurrence: 4,
    metersSuspended: false, sweepingSuspended: true,
    cities: ["sf"],
  },

  // ═══════════════════════════════════════════════
  // MIAMI — NO HOLIDAYS SUSPEND METERS
  // Miami Beach enforces meters 7 days/week, 365 days/year
  // City of Miami offers promotional extra free hour late Nov-Jan 1
  // ═══════════════════════════════════════════════
  // (No entries — meters are never suspended in Miami)
]

/**
 * Check if a given date is a parking holiday for a city.
 */
export function getHolidayForDate(date: Date, city: CityId): ParkingHoliday | null {
  const month = date.getMonth() + 1
  const dayOfMonth = date.getDate()
  const dayOfWeek = date.getDay()

  for (const h of PARKING_HOLIDAYS) {
    if (!h.cities.includes(city)) continue
    if (h.month !== month) continue

    if (h.day !== null) {
      if (h.day === dayOfMonth) return h
      // Observed: Saturday holiday → observed Friday; Sunday holiday → observed Monday
      if (h.day === dayOfMonth + 1 && dayOfWeek === 5) return h
      if (h.day === dayOfMonth - 1 && dayOfWeek === 1) return h
      continue
    }

    if (h.weekday !== undefined && h.weekdayOccurrence !== undefined) {
      if (dayOfWeek !== h.weekday) continue
      if (h.weekdayOccurrence === -1) {
        const nextSame = new Date(date)
        nextSame.setDate(dayOfMonth + 7)
        if (nextSame.getMonth() + 1 !== month) return h
      } else {
        const occurrence = Math.ceil(dayOfMonth / 7)
        if (occurrence === h.weekdayOccurrence) return h
      }
    }
  }

  return null
}
