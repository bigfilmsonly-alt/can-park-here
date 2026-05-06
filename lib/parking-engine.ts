/**
 * Park — v2 parking check engine.
 * Uses the comprehensive parking-data database for SF Bay Area + Miami Metro.
 * Replaces the hard-coded logic in parking-rules.ts checkParking().
 */

import {
  detectCity, isCalifornia, isFlorida,
  type CityId, type SweepingSchedule, type MeterZone, type TowZone,
} from "./parking-data"
import { getHolidayForDate } from "./parking-data/holidays"
import { HANDICAP_RULES } from "./parking-data/handicap"
import { SF_TOW_ZONES, MIAMI_TOW_ZONES } from "./parking-data/tow-zones"
import { SF_METER_ZONES, MIAMI_METER_ZONES } from "./parking-data/meters"
import { SF_SWEEPING } from "./parking-data/sweeping-sf"
import { MIAMI_SWEEPING } from "./parking-data/sweeping-miami"
import type { ParkingResult, ParkingWarning, UserAccessibility, HandicapInfo, ParkingRule } from "./parking-rules"

// Re-export types
export type { ParkingResult }

/** Helper: parse "HH:MM" to minutes since midnight */
function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

/** Helper: current minutes since midnight */
function nowMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

/** Helper: seconds until a given time today (or tomorrow if past) */
function secondsUntil(targetHour: number, targetMin: number, now: Date): number {
  const target = new Date(now)
  target.setHours(targetHour, targetMin, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000))
}

/** Helper: check if current time is within a window */
function isInWindow(startTime: string, endTime: string, now: Date): boolean {
  const current = nowMinutes(now)
  const start = parseTime(startTime)
  let end = parseTime(endTime)

  // Handle overnight windows (e.g. "22:00" - "03:00")
  if (end <= start) {
    return current >= start || current < end
  }
  return current >= start && current < end
}

/** Helper: get week of month (1-4) */
function weekOfMonth(date: Date): number {
  return Math.ceil(date.getDate() / 7)
}

/** Helper: match street name against a pattern (pipe-separated) */
function matchesStreet(street: string, pattern: string): boolean {
  if (pattern === "*") return true
  const normalized = street.toLowerCase().trim()
  return pattern.split("|").some(p => normalized.includes(p.trim().toLowerCase()))
}

/** Helper: determine if address is on even or odd side */
function getAddressSide(street: string): "even" | "odd" | null {
  const match = street.match(/^(\d+)/)
  if (!match) return null
  return parseInt(match[1], 10) % 2 === 0 ? "even" : "odd"
}

/** Format time for display */
function formatClockTime(hour: number, minute: number = 0): string {
  const period = hour >= 12 ? "PM" : "AM"
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return minute > 0 ? `${h}:${minute.toString().padStart(2, "0")} ${period}` : `${h} ${period}`
}

// ─────────────────────────────────────────────────────────────
// Main engine
// ─────────────────────────────────────────────────────────────

export function checkParkingV2(
  lat: number,
  lng: number,
  userAccessibility?: UserAccessibility,
  street?: string,
  cityName?: string,
): ParkingResult {
  const now = new Date()
  const day = now.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6
  const hour = now.getHours()
  const isWeekday = day >= 1 && day <= 5
  const isSunday = day === 0

  // 1) Detect city from GPS
  const cityResult = detectCity(lat, lng)
  const city: CityId = cityResult.supported ? cityResult.city : "sf"
  const resolvedCity = cityResult.supported ? cityResult.name! : (cityName || "Unknown")
  const resolvedStreet = street || "Current location"
  const confidence = street ? 93 : 78
  const addressSide = street ? getAddressSide(street) : null

  // 2) Check if today is a holiday
  const holiday = getHolidayForDate(now, city)
  const metersFreeToday = holiday?.metersSuspended ?? false
  const sweepingSuspendedToday = holiday?.sweepingSuspended ?? false

  // Warnings accumulator
  const warnings: ParkingWarning[] = []

  // ─────────────────────────────────────────
  // CHECK 1: Tow-away zones (highest priority)
  // ─────────────────────────────────────────
  const towZones = city.startsWith("miami") ? MIAMI_TOW_ZONES : SF_TOW_ZONES
  for (const tz of towZones) {
    if (tz.city !== city) continue
    if (!tz.days.includes(day)) continue
    if (!matchesStreet(resolvedStreet, tz.street)) continue
    if (!isInWindow(tz.startTime, tz.endTime, now)) continue

    // Miami Beach overnight ban — check for residential permit
    if (tz.id === "mb-overnight-ban") {
      return buildParkingResult({
        status: "prohibited",
        headline: "Don\u2019t park here.",
        reason: `Miami Beach overnight parking ban (2-6 AM). Vehicles without a residential permit will be towed. Tow fee: $${city === "miami-beach" ? "516" : "258"}.`,
        confidence: 97,
        timeRemaining: secondsUntil(6, 0, now),
        restrictions: ["Overnight parking ban", "Residential permit required"],
        warnings: [{ type: "tow", severity: "critical", message: `Tow-away zone until 6 AM. Tow fee $516.` }],
        streetName: resolvedStreet,
        city: resolvedCity,
      })
    }

    const endParts = tz.endTime.split(":").map(Number)
    return buildParkingResult({
      status: "prohibited",
      headline: "Don\u2019t park here.",
      reason: `${tz.description}. Your car will be towed. Fine: $${tz.fine}+.`,
      confidence: 95,
      timeRemaining: secondsUntil(endParts[0], endParts[1], now),
      restrictions: ["Tow-away zone", tz.description],
      warnings: [{ type: "tow", severity: "critical", message: `Tow-away until ${formatClockTime(endParts[0], endParts[1])}` }],
      streetName: resolvedStreet,
      city: resolvedCity,
    })
  }

  // ─────────────────────────────────────────
  // CHECK 2: Street sweeping
  // ─────────────────────────────────────────
  if (!sweepingSuspendedToday) {
    const sweepingData = isCalifornia(city) ? SF_SWEEPING : MIAMI_SWEEPING
    for (const sw of sweepingData) {
      if (sw.city !== city) continue
      if (sw.day !== day) continue
      if (sw.weekOfMonth !== 0 && sw.weekOfMonth !== weekOfMonth(now)) continue
      if (!matchesStreet(resolvedStreet, sw.streetPattern)) continue
      if (sw.side !== "both" && addressSide && sw.side !== addressSide) continue
      if (!isInWindow(sw.startTime, sw.endTime, now)) continue

      const endParts = sw.endTime.split(":").map(Number)
      return buildParkingResult({
        status: "prohibited",
        headline: "Don\u2019t park here.",
        reason: `Street cleaning in progress on ${sw.neighborhood}. Fine: $${sw.fine}.`,
        confidence: 94,
        timeRemaining: secondsUntil(endParts[0], endParts[1], now),
        restrictions: ["Street sweeping", `Until ${formatClockTime(endParts[0], endParts[1])}`],
        warnings: [{ type: "street-cleaning", severity: "critical", message: `Street cleaning until ${formatClockTime(endParts[0], endParts[1])}` }],
        streetName: resolvedStreet,
        city: resolvedCity,
      })
    }

    // Check for UPCOMING sweeping (within next 2 hours)
    for (const sw of sweepingData) {
      if (sw.city !== city) continue
      if (sw.day !== day) continue
      if (sw.weekOfMonth !== 0 && sw.weekOfMonth !== weekOfMonth(now)) continue
      if (!matchesStreet(resolvedStreet, sw.streetPattern)) continue
      if (sw.side !== "both" && addressSide && sw.side !== addressSide) continue

      const startMins = parseTime(sw.startTime)
      const currentMins = nowMinutes(now)
      const minsUntilSweeping = startMins - currentMins
      if (minsUntilSweeping > 0 && minsUntilSweeping <= 120) {
        warnings.push({
          type: "street-cleaning",
          severity: "warning",
          message: `Street cleaning starts in ${minsUntilSweeping} min (${formatClockTime(Math.floor(startMins / 60), startMins % 60)})`,
          timeUntil: minsUntilSweeping,
        })
      }
    }
  }

  // ─────────────────────────────────────────
  // CHECK 3: Meter enforcement
  // ─────────────────────────────────────────
  const meterZones = isCalifornia(city) ? SF_METER_ZONES : MIAMI_METER_ZONES
  let activeMeter: MeterZone | null = null

  if (!metersFreeToday) {
    for (const mz of meterZones) {
      if (mz.city !== city) continue
      if (!mz.days.includes(day)) continue
      if (!matchesStreet(resolvedStreet, mz.streetPattern)) continue
      if (isInWindow(mz.startTime, mz.endTime, now)) {
        activeMeter = mz
        break
      }
    }
  }

  // Handicap check for meters
  const hasValidPlacard = userAccessibility?.hasHandicapPlacard === true
  const handicapRules = HANDICAP_RULES[city]

  if (hasValidPlacard && activeMeter && handicapRules?.freeMeters) {
    const timeLimitMsg = handicapRules.meterTimeLimit
      ? `${handicapRules.meterTimeLimit / 60} hours free with placard`
      : "Unlimited free parking with placard"

    return buildParkingResult({
      status: "allowed",
      headline: "Yes \u2014 park here.",
      reason: `${timeLimitMsg}. ${handicapRules.notes}`,
      confidence,
      timeRemaining: handicapRules.meterTimeLimit ? handicapRules.meterTimeLimit * 60 : null,
      restrictions: [],
      warnings,
      streetName: resolvedStreet,
      city: resolvedCity,
      handicapInfo: {
        isHandicapZone: false,
        requiresPlacard: false,
        timeLimit: handicapRules.meterTimeLimit ?? undefined,
        message: timeLimitMsg,
      },
    })
  }

  // ─────────────────────────────────────────
  // CHECK 4: Holiday — meters free
  // ─────────────────────────────────────────
  if (metersFreeToday && holiday) {
    return buildParkingResult({
      status: "allowed",
      headline: "Yes \u2014 park here.",
      reason: `Meters are free today (${holiday.name}). Time limits may still apply.`,
      confidence: 97,
      timeRemaining: null,
      restrictions: [],
      warnings,
      streetName: resolvedStreet,
      city: resolvedCity,
    })
  }

  // ─────────────────────────────────────────
  // CHECK 5: Active meter
  // ─────────────────────────────────────────
  if (activeMeter) {
    const endParts = activeMeter.endTime.split(":").map(Number)
    let endH = endParts[0]
    let endM = endParts[1]
    // Handle "03:00" end meaning 3 AM next day for overnight meters
    if (endH < parseTime(activeMeter.startTime) / 60) {
      // Overnight meter — time remaining wraps
    }
    const secsRemaining = secondsUntil(endH, endM, now)
    const timeLimit = activeMeter.maxMinutes
    const timeLimitDisplay = timeLimit >= 60
      ? `${Math.floor(timeLimit / 60)}-hour limit`
      : `${timeLimit}-minute limit`

    warnings.push({
      type: "time-limit",
      severity: "info",
      message: `${timeLimitDisplay}. $${activeMeter.ratePerHour.toFixed(2)}/hr.`,
    })

    return buildParkingResult({
      status: "restricted",
      headline: `Yes \u2014 until ${formatClockTime(endH, endM)}.`,
      reason: `Metered parking. ${timeLimitDisplay} at $${activeMeter.ratePerHour.toFixed(2)}/hr. Pay via ${activeMeter.paymentMethods.join(", ")}.`,
      confidence,
      timeRemaining: Math.min(secsRemaining, timeLimit * 60),
      restrictions: [`${timeLimitDisplay}`, `$${activeMeter.ratePerHour.toFixed(2)}/hr`, `Meters until ${formatClockTime(endH, endM)}`],
      warnings,
      streetName: resolvedStreet,
      city: resolvedCity,
    })
  }

  // ─────────────────────────────────────────
  // CHECK 6: SF Sunday or after-hours — free parking
  // ─────────────────────────────────────────
  if (isCalifornia(city) && (isSunday || hour >= 18 || hour < 9)) {
    let headline = "Yes \u2014 park here."
    let reason = "Free parking. No meter required."

    if (hour >= 18) {
      reason = "Meters are off for the evening. Free parking until 9 AM."
    } else if (isSunday) {
      reason = "Free parking on Sundays. No meter required."
    } else if (hour < 9) {
      const secsUntil9 = secondsUntil(9, 0, now)
      headline = "Yes \u2014 until 9 AM."
      reason = `Free parking until meters start at 9 AM. ${Math.floor(secsUntil9 / 60)} minutes remaining.`
      return buildParkingResult({
        status: "allowed",
        headline,
        reason,
        confidence,
        timeRemaining: secsUntil9,
        restrictions: [],
        warnings,
        streetName: resolvedStreet,
        city: resolvedCity,
      })
    }

    return buildParkingResult({
      status: "allowed",
      headline,
      reason,
      confidence,
      timeRemaining: null,
      restrictions: [],
      warnings,
      streetName: resolvedStreet,
      city: resolvedCity,
    })
  }

  // ─────────────────────────────────────────
  // CHECK 7: Miami — check if outside meter hours
  // ─────────────────────────────────────────
  if (isFlorida(city)) {
    // If no active meter was found, we're outside meter hours
    return buildParkingResult({
      status: "allowed",
      headline: "Yes \u2014 park here.",
      reason: "Outside meter enforcement hours. Free parking.",
      confidence,
      timeRemaining: null,
      restrictions: [],
      warnings,
      streetName: resolvedStreet,
      city: resolvedCity,
    })
  }

  // ─────────────────────────────────────────
  // DEFAULT: Allowed with any upcoming warnings
  // ─────────────────────────────────────────
  return buildParkingResult({
    status: "allowed",
    headline: "Yes \u2014 park here.",
    reason: "No active restrictions at this location right now.",
    confidence,
    timeRemaining: null,
    restrictions: [],
    warnings,
    streetName: resolvedStreet,
    city: resolvedCity,
  })
}

// ─────────────────────────────────────────
// Result builder (backward compat)
// ─────────────────────────────────────────
interface BuildArgs {
  status: "allowed" | "restricted" | "prohibited"
  headline: string
  reason: string
  confidence: number
  timeRemaining: number | null
  restrictions: string[]
  warnings: ParkingWarning[]
  streetName: string
  city: string
  handicapInfo?: HandicapInfo
}

function buildParkingResult(args: BuildArgs): ParkingResult {
  return {
    status: args.status,
    headline: args.headline,
    reason: args.reason,
    confidence: args.confidence,
    timeRemaining: args.timeRemaining,
    restrictions: args.restrictions,
    warnings: args.warnings,
    streetName: args.streetName,
    city: args.city,
    // backward compat
    title: args.headline,
    description: args.reason,
    activeRule: null,
    nextRestriction: null,
    handicapInfo: args.handicapInfo,
  }
}
