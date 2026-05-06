import type { CityId } from "./types"

/**
 * Detect which city a GPS coordinate is in.
 * Uses bounding boxes for supported cities.
 */

interface CityBounds {
  city: CityId
  name: string
  state: string
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

const CITY_BOUNDS: CityBounds[] = [
  // ── San Francisco Bay Area ──
  { city: "sf", name: "San Francisco", state: "CA", minLat: 37.708, maxLat: 37.812, minLng: -122.515, maxLng: -122.357 },
  { city: "oakland", name: "Oakland", state: "CA", minLat: 37.733, maxLat: 37.840, minLng: -122.330, maxLng: -122.169 },
  { city: "berkeley", name: "Berkeley", state: "CA", minLat: 37.850, maxLat: 37.905, minLng: -122.324, maxLng: -122.234 },
  { city: "san-jose", name: "San Jose", state: "CA", minLat: 37.200, maxLat: 37.440, minLng: -122.050, maxLng: -121.780 },

  // ── Miami Metro ──
  { city: "miami", name: "Miami", state: "FL", minLat: 25.700, maxLat: 25.860, minLng: -80.320, maxLng: -80.150 },
  { city: "miami-beach", name: "Miami Beach", state: "FL", minLat: 25.760, maxLat: 25.880, minLng: -80.150, maxLng: -80.110 },
  { city: "coral-gables", name: "Coral Gables", state: "FL", minLat: 25.690, maxLat: 25.760, minLng: -80.290, maxLng: -80.240 },
]

export interface CityDetectionResult {
  city: CityId
  name: string
  state: string
  supported: true
}

export interface CityNotSupported {
  city: null
  name: null
  state: null
  supported: false
  nearestCity?: string
}

export type CityResult = CityDetectionResult | CityNotSupported

/**
 * Detect city from GPS coordinates.
 * Returns the city info if supported, or { supported: false } if not.
 */
export function detectCity(lat: number, lng: number): CityResult {
  for (const bounds of CITY_BOUNDS) {
    if (lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng) {
      return {
        city: bounds.city,
        name: bounds.name,
        state: bounds.state,
        supported: true,
      }
    }
  }

  // Not in a supported city — find nearest for the message
  let nearest = ""
  let minDist = Infinity
  for (const bounds of CITY_BOUNDS) {
    const centerLat = (bounds.minLat + bounds.maxLat) / 2
    const centerLng = (bounds.minLng + bounds.maxLng) / 2
    const dist = Math.sqrt((lat - centerLat) ** 2 + (lng - centerLng) ** 2)
    if (dist < minDist) {
      minDist = dist
      nearest = bounds.name
    }
  }

  return { city: null, name: null, state: null, supported: false, nearestCity: nearest }
}

/**
 * Check if a city is in California (different parking laws than Florida)
 */
export function isCalifornia(city: CityId): boolean {
  return ["sf", "oakland", "berkeley", "san-jose"].includes(city)
}

/**
 * Check if a city is in Florida
 */
export function isFlorida(city: CityId): boolean {
  return ["miami", "miami-beach", "coral-gables"].includes(city)
}
