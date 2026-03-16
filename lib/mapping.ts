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

// Generate mock data for demo
function generateMockSpots(centerLat: number, centerLng: number, count: number): ParkingSpot[] {
  const spots: ParkingSpot[] = []
  const types: ParkingSpot["type"][] = ["street", "metered", "free", "handicap"]
  const statuses: ParkingSpot["status"][] = ["available", "occupied", "unknown"]
  
  for (let i = 0; i < count; i++) {
    const latOffset = (Math.random() - 0.5) * 0.02
    const lngOffset = (Math.random() - 0.5) * 0.02
    
    spots.push({
      id: `spot-${i}`,
      lat: centerLat + latOffset,
      lng: centerLng + lngOffset,
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timeLimit: Math.random() > 0.5 ? [30, 60, 120, 240][Math.floor(Math.random() * 4)] : undefined,
      rate: Math.random() > 0.3 ? Math.round(Math.random() * 4 + 1) : undefined,
      lastUpdated: new Date(Date.now() - Math.random() * 3600000),
    })
  }
  
  return spots
}

function generateMockGarages(centerLat: number, centerLng: number): ParkingGarage[] {
  const garageNames = [
    "City Center Parking",
    "Main Street Garage",
    "Downtown Plaza",
    "Metro Park",
    "Central Station Parking",
  ]
  
  return garageNames.map((name, i) => {
    const latOffset = (Math.random() - 0.5) * 0.015
    const lngOffset = (Math.random() - 0.5) * 0.015
    const total = [200, 350, 150, 500, 280][i]
    const available = Math.floor(Math.random() * total * 0.4)
    
    return {
      id: `garage-${i}`,
      name,
      lat: centerLat + latOffset,
      lng: centerLng + lngOffset,
      address: `${100 + i * 100} ${["Main", "Oak", "Elm", "Park", "Center"][i]} St`,
      totalSpaces: total,
      availableSpaces: available,
      rate: [3, 4, 2.5, 5, 3.5][i],
      maxRate: [25, 30, 20, 40, 28][i],
      hours: i % 2 === 0 ? "24/7" : "6am - 11pm",
      features: [
        ["Covered", "Security", "EV Charging"],
        ["Covered", "Valet", "Car Wash"],
        ["Security", "Handicap Access"],
        ["Covered", "Security", "EV Charging", "Valet"],
        ["Covered", "Handicap Access"],
      ][i],
      lastUpdated: new Date(),
    }
  })
}

function generateMockEVStations(centerLat: number, centerLng: number): EVStation[] {
  const stations = [
    { name: "ChargePoint Station", network: "ChargePoint" },
    { name: "Tesla Supercharger", network: "Tesla" },
    { name: "Electrify America", network: "Electrify America" },
    { name: "EVgo Fast Charging", network: "EVgo" },
  ]
  
  return stations.map((station, i) => {
    const latOffset = (Math.random() - 0.5) * 0.018
    const lngOffset = (Math.random() - 0.5) * 0.018
    const total = [4, 8, 6, 4][i]
    
    return {
      id: `ev-${i}`,
      name: station.name,
      lat: centerLat + latOffset,
      lng: centerLng + lngOffset,
      address: `${200 + i * 150} ${["Broadway", "1st Ave", "Market St", "Union St"][i]}`,
      networkName: station.network,
      chargerTypes: [
        ["Level2", "DCFast"],
        ["Tesla"],
        ["DCFast"],
        ["Level2", "DCFast"],
      ][i] as EVStation["chargerTypes"],
      totalPorts: total,
      availablePorts: Math.floor(Math.random() * total),
      pricePerKwh: station.network === "Tesla" ? undefined : [0.35, 0.43, 0.39, 0.32][i],
      lastUpdated: new Date(),
    }
  })
}

// Get parking spots near a location
export function getNearbyParkingSpots(lat: number, lng: number, radiusKm: number = 1): ParkingSpot[] {
  // In production, this would fetch from an API
  // For demo, generate mock data
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
  // Check if iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  
  if (isIOS) {
    return `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
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
