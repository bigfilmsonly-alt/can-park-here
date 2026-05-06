"use client"

import { getAnonymousUserId } from "./community"

export interface SpotTip {
  id: string
  lat: number
  lng: number
  tag: SpotTag
  customText?: string
  rating: number // 1-5
  reportedBy: string
  reportedAt: Date
  upvotes: number
  downvotes: number
}

export type SpotTag =
  | "easy_to_find"
  | "hard_to_find"
  | "meter_works"
  | "meter_broken"
  | "free_after_6pm"
  | "free_sundays"
  | "enforcement_frequent"
  | "enforcement_rare"
  | "good_lighting"
  | "tight_space"
  | "shade_available"
  | "street_cleaning"

export interface VacatingSpot {
  id: string
  lat: number
  lng: number
  address: string
  vacatingAt: Date
  reportedBy: string
  expiresAt: Date
}

const TIPS_KEY = "park_spot_tips"
const VACATING_KEY = "park_vacating_spots"
const RATINGS_KEY = "park_spot_ratings"

export const SPOT_TAG_LABELS: Record<SpotTag, string> = {
  easy_to_find: "Easy to find",
  hard_to_find: "Hard to find",
  meter_works: "Meter works",
  meter_broken: "Meter broken",
  free_after_6pm: "Free after 6pm",
  free_sundays: "Free Sundays",
  enforcement_frequent: "Enforcement frequent",
  enforcement_rare: "Enforcement rare",
  good_lighting: "Good lighting",
  tight_space: "Tight space",
  shade_available: "Shade available",
  street_cleaning: "Street cleaning",
}

export const SPOT_TAG_TONE: Record<SpotTag, "ok" | "warn" | "err" | "info"> = {
  easy_to_find: "ok",
  hard_to_find: "warn",
  meter_works: "ok",
  meter_broken: "err",
  free_after_6pm: "ok",
  free_sundays: "ok",
  enforcement_frequent: "err",
  enforcement_rare: "ok",
  good_lighting: "ok",
  tight_space: "warn",
  shade_available: "info",
  street_cleaning: "warn",
}

// Save a spot tip/rating
export function addSpotTip(
  lat: number,
  lng: number,
  tag: SpotTag,
  rating: number,
  customText?: string
): SpotTip {
  const tip: SpotTip = {
    id: `tip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    lat,
    lng,
    tag,
    customText,
    rating: Math.max(1, Math.min(5, Math.round(rating))),
    reportedBy: getAnonymousUserId(),
    reportedAt: new Date(),
    upvotes: 0,
    downvotes: 0,
  }

  const tips = getSpotTips()
  tips.push(tip)
  if (typeof window !== "undefined") {
    localStorage.setItem(TIPS_KEY, JSON.stringify(tips.slice(-200)))
  }
  return tip
}

// Get all spot tips
export function getSpotTips(): SpotTip[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(TIPS_KEY)
  if (!stored) return []
  try {
    const tips: SpotTip[] = JSON.parse(stored)
    // Filter out tips older than 7 days
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return tips
      .map(t => ({ ...t, reportedAt: new Date(t.reportedAt) }))
      .filter(t => t.reportedAt.getTime() > weekAgo)
  } catch { return [] }
}

// Get tips near a location
export function getNearbyTips(lat: number, lng: number, radiusKm: number = 0.2): SpotTip[] {
  return getSpotTips().filter(t => {
    const dLat = t.lat - lat
    const dLng = t.lng - lng
    const approxKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111
    return approxKm <= radiusKm
  })
}

// Get average rating for a location
export function getSpotRating(lat: number, lng: number): { avg: number; count: number } | null {
  const tips = getNearbyTips(lat, lng, 0.05) // ~50m radius
  if (tips.length === 0) return null
  const avg = tips.reduce((sum, t) => sum + t.rating, 0) / tips.length
  return { avg: Math.round(avg * 10) / 10, count: tips.length }
}

// Vote on a tip
export function voteTip(tipId: string, isUpvote: boolean): void {
  if (typeof window === "undefined") return
  const tips = getSpotTips()
  const tip = tips.find(t => t.id === tipId)
  if (!tip) return
  if (isUpvote) tip.upvotes++
  else tip.downvotes++
  localStorage.setItem(TIPS_KEY, JSON.stringify(tips))
}

// "I'm leaving" - broadcast a vacating spot
export function broadcastVacatingSpot(lat: number, lng: number, address: string): VacatingSpot {
  const spot: VacatingSpot = {
    id: `vac_${Date.now()}`,
    lat,
    lng,
    address,
    vacatingAt: new Date(),
    reportedBy: getAnonymousUserId(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min expiry
  }

  const spots = getVacatingSpots()
  spots.push(spot)
  if (typeof window !== "undefined") {
    localStorage.setItem(VACATING_KEY, JSON.stringify(spots))
  }
  return spot
}

// Get active vacating spots nearby
export function getVacatingSpots(): VacatingSpot[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(VACATING_KEY)
  if (!stored) return []
  try {
    const spots: VacatingSpot[] = JSON.parse(stored)
    const now = Date.now()
    return spots
      .map(s => ({ ...s, vacatingAt: new Date(s.vacatingAt), expiresAt: new Date(s.expiresAt) }))
      .filter(s => s.expiresAt.getTime() > now)
  } catch { return [] }
}

export function getNearbyVacatingSpots(lat: number, lng: number, radiusKm: number = 0.5): VacatingSpot[] {
  return getVacatingSpots().filter(s => {
    const dLat = s.lat - lat
    const dLng = s.lng - lng
    const approxKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111
    return approxKm <= radiusKm
  })
}

// Save a spot rating (for computing aggregate ratings)
export function saveSpotRating(lat: number, lng: number, rating: number): void {
  if (typeof window === "undefined") return
  const ratings = getSpotRatings()
  ratings.push({ lat, lng, rating, timestamp: Date.now() })
  // Keep last 500 ratings
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings.slice(-500)))
}

function getSpotRatings(): Array<{ lat: number; lng: number; rating: number; timestamp: number }> {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(RATINGS_KEY)
  if (!stored) return []
  try { return JSON.parse(stored) } catch { return [] }
}
