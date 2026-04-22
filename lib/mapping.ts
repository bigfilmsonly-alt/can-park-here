"use client"

// Types for parking spots, garages, and EV stations
export interface ParkingSpot {
  id: string
  lat: number
  lng: number
  type: "street" | "metered" | "free" | "handicap"
  status: "available" | "occupied" | "unknown"
  timeLimit?: number // minutes
  rate?: number // per hour
  lastUpdated: Date
  reportedBy?: string
}

export interface ParkingGarage {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  totalSpaces: number
  availableSpaces: number
  rate: number // per hour
  maxRate?: number // daily max
  hours: string
  features: string[]
  lastUpdated: Date
}

export interface EVStation {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  networkName: string
  chargerTypes: ("Level2" | "DCFast" | "Tesla")[]
  totalPorts: number
  availablePorts: number
  pricePerKwh?: number
  lastUpdated: Date
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

// Storage keys
const SPOTS_KEY = "park_parking_spots"
const GARAGES_KEY = "park_garages"
const EV_STATIONS_KEY = "park_ev_stations"

// Curated San Francisco street parking data
const SF_STREET_SPOTS: Omit<ParkingSpot, "status" | "lastUpdated">[] = [
  { id: "spot-0", lat: 37.7588, lng: -122.4213, type: "metered", timeLimit: 120, rate: 2.50 },
  { id: "spot-1", lat: 37.7576, lng: -122.4218, type: "metered", timeLimit: 120, rate: 2.50 },
  { id: "spot-2", lat: 37.7617, lng: -122.4350, type: "metered", timeLimit: 60, rate: 3.50 },
  { id: "spot-3", lat: 37.7650, lng: -122.4196, type: "metered", timeLimit: 120, rate: 2.00 },
  { id: "spot-4", lat: 37.7525, lng: -122.4183, type: "metered", timeLimit: 120, rate: 2.00 },
  { id: "spot-5", lat: 37.7615, lng: -122.4260, type: "free", timeLimit: 120 },
  { id: "spot-6", lat: 37.7763, lng: -122.4262, type: "metered", timeLimit: 120, rate: 3.00 },
  { id: "spot-7", lat: 37.7710, lng: -122.4370, type: "metered", timeLimit: 120, rate: 2.50 },
  { id: "spot-8", lat: 37.7985, lng: -122.4340, type: "metered", timeLimit: 120, rate: 3.50 },
  { id: "spot-9", lat: 37.7960, lng: -122.4220, type: "metered", timeLimit: 60, rate: 3.00 },
  { id: "spot-10", lat: 37.7660, lng: -122.4490, type: "free", timeLimit: 120 },
  { id: "spot-11", lat: 37.7635, lng: -122.4665, type: "metered", timeLimit: 120, rate: 2.00 },
]

// Generate realistic SF street parking spots
function generateMockSpots(_centerLat: number, _centerLng: number, _count: number): ParkingSpot[] {
  const statuses: ParkingSpot["status"][] = ["available", "occupied", "unknown"]

  return SF_STREET_SPOTS.map((spot) => ({
    ...spot,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastUpdated: new Date(Date.now() - Math.random() * 3600000),
  }))
}

// Curated San Francisco parking garage data
const SF_GARAGES: Omit<ParkingGarage, "availableSpaces" | "lastUpdated">[] = [
  { id: "garage-0", name: "Sutter Stockton Garage", lat: 37.7880, lng: -122.4070, address: "444 Stockton St", totalSpaces: 1865, rate: 5, maxRate: 36, hours: "24/7", features: ["Covered", "Security", "Handicap Access"] },
  { id: "garage-1", name: "5th & Mission Garage", lat: 37.7835, lng: -122.4055, address: "833 Mission St", totalSpaces: 2585, rate: 4, maxRate: 30, hours: "6am - 12am", features: ["Covered", "Security", "EV Charging"] },
  { id: "garage-2", name: "Civic Center Garage", lat: 37.7790, lng: -122.4175, address: "355 McAllister St", totalSpaces: 840, rate: 3.50, maxRate: 25, hours: "24/7", features: ["Covered", "Security", "Handicap Access"] },
  { id: "garage-3", name: "Japan Center Garage", lat: 37.7855, lng: -122.4295, address: "1610 Geary Blvd", totalSpaces: 500, rate: 4, maxRate: 28, hours: "8am - 10pm", features: ["Covered", "Security"] },
  { id: "garage-4", name: "Ghirardelli Square", lat: 37.8060, lng: -122.4225, address: "900 North Point St", totalSpaces: 300, rate: 6, maxRate: 40, hours: "7am - 11pm", features: ["Covered", "Security", "Valet"] },
]

function generateMockGarages(_centerLat: number, _centerLng: number): ParkingGarage[] {
  return SF_GARAGES.map((garage) => ({
    ...garage,
    availableSpaces: Math.floor(Math.random() * garage.totalSpaces * 0.4),
    lastUpdated: new Date(),
  }))
}

// Curated San Francisco EV charging station data
const SF_EV_STATIONS: Omit<EVStation, "availablePorts" | "lastUpdated">[] = [
  { id: "ev-0", name: "ChargePoint at Whole Foods Market", lat: 37.7645, lng: -122.4260, address: "399 4th St", networkName: "ChargePoint", chargerTypes: ["Level2", "DCFast"], totalPorts: 6, pricePerKwh: 0.35 },
  { id: "ev-1", name: "Tesla Supercharger SoMa", lat: 37.7755, lng: -122.3985, address: "180 Townsend St", networkName: "Tesla", chargerTypes: ["Tesla"], totalPorts: 12 },
  { id: "ev-2", name: "ChargePoint at Safeway", lat: 37.7640, lng: -122.4660, address: "730 Taraval St", networkName: "ChargePoint", chargerTypes: ["Level2"], totalPorts: 4, pricePerKwh: 0.32 },
  { id: "ev-3", name: "EVgo at Potrero Center", lat: 37.7610, lng: -122.4075, address: "2300 16th St", networkName: "EVgo", chargerTypes: ["DCFast"], totalPorts: 4, pricePerKwh: 0.39 },
  { id: "ev-4", name: "ChargePoint at Metreon", lat: 37.7840, lng: -122.4030, address: "135 4th St", networkName: "ChargePoint", chargerTypes: ["Level2", "DCFast"], totalPorts: 8, pricePerKwh: 0.35 },
]

function generateMockEVStations(_centerLat: number, _centerLng: number): EVStation[] {
  return SF_EV_STATIONS.map((station) => ({
    ...station,
    availablePorts: Math.floor(Math.random() * station.totalPorts),
    lastUpdated: new Date(),
  }))
}

// Get parking spots near a location
export function getNearbyParkingSpots(lat: number, lng: number, _radiusKm: number = 1): ParkingSpot[] {
  // In production, this would fetch from an API
  // For demo, generate mock data
  if (typeof window === "undefined") return generateMockSpots(lat, lng, 30)
  const stored = localStorage.getItem(SPOTS_KEY)

  if (!stored) {
    const spots = generateMockSpots(lat, lng, 30)
    localStorage.setItem(SPOTS_KEY, JSON.stringify(spots))
    return spots
  }

  try {
    const spots = JSON.parse(stored) as ParkingSpot[]
    return spots.map(s => ({ ...s, lastUpdated: new Date(s.lastUpdated) }))
  } catch {
    const spots = generateMockSpots(lat, lng, 30)
    localStorage.setItem(SPOTS_KEY, JSON.stringify(spots))
    return spots
  }
}

// Get parking garages near a location
export function getNearbyGarages(lat: number, lng: number): ParkingGarage[] {
  if (typeof window === "undefined") return generateMockGarages(lat, lng)
  const stored = localStorage.getItem(GARAGES_KEY)

  if (!stored) {
    const garages = generateMockGarages(lat, lng)
    localStorage.setItem(GARAGES_KEY, JSON.stringify(garages))
    return garages
  }

  try {
    const garages = JSON.parse(stored) as ParkingGarage[]
    return garages.map(g => ({ ...g, lastUpdated: new Date(g.lastUpdated) }))
  } catch {
    const garages = generateMockGarages(lat, lng)
    localStorage.setItem(GARAGES_KEY, JSON.stringify(garages))
    return garages
  }
}

// Get EV charging stations near a location
export function getNearbyEVStations(lat: number, lng: number): EVStation[] {
  if (typeof window === "undefined") return generateMockEVStations(lat, lng)
  const stored = localStorage.getItem(EV_STATIONS_KEY)

  if (!stored) {
    const stations = generateMockEVStations(lat, lng)
    localStorage.setItem(EV_STATIONS_KEY, JSON.stringify(stations))
    return stations
  }

  try {
    const stations = JSON.parse(stored) as EVStation[]
    return stations.map(s => ({ ...s, lastUpdated: new Date(s.lastUpdated) }))
  } catch {
    const stations = generateMockEVStations(lat, lng)
    localStorage.setItem(EV_STATIONS_KEY, JSON.stringify(stations))
    return stations
  }
}

// Report a parking spot status
export function reportSpotStatus(spotId: string, status: ParkingSpot["status"]): void {
  if (typeof window === "undefined") return
  const stored = localStorage.getItem(SPOTS_KEY)
  if (!stored) return

  try {
    const spots = JSON.parse(stored) as ParkingSpot[]
    const updated = spots.map(s =>
      s.id === spotId
        ? { ...s, status, lastUpdated: new Date() }
        : s
    )
    localStorage.setItem(SPOTS_KEY, JSON.stringify(updated))
  } catch {
    // Ignore errors
  }
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Format distance for display
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  }
  return `${distanceKm.toFixed(1)}km`
}

// Get directions URL for navigation
export function getDirectionsUrl(lat: number, lng: number): string {
  // Check if iOS (only in browser context)
  if (typeof navigator !== "undefined") {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (isIOS) {
      return `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
    }
  }

  // Default to Google Maps
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
}

// Get walking time estimate (rough estimate: 5km/h walking speed)
export function estimateWalkingTime(distanceKm: number): string {
  const minutes = Math.ceil(distanceKm / 5 * 60)
  if (minutes < 1) return "< 1 min"
  if (minutes === 1) return "1 min"
  return `${minutes} min`
}

// Get driving time estimate (rough estimate: 30km/h city driving)
export function estimateDrivingTime(distanceKm: number): string {
  const minutes = Math.ceil(distanceKm / 30 * 60)
  if (minutes < 1) return "< 1 min"
  if (minutes === 1) return "1 min"
  return `${minutes} min`
}
