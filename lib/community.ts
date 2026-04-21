"use client"

/**
 * Community Data Layer
 * Uses the database abstraction layer for persistence.
 */

import {
  dbGetNearbySightings,
  dbAddSighting,
  dbVoteSighting,
  dbGetPhotoEvidence,
  dbAddPhotoEvidence,
  dbDeletePhotoEvidence,
  type DBEnforcementSighting,
  type DBPhotoEvidence,
} from "./db"

// Types for community-reported data
export interface EnforcementSighting {
  id: string
  type: "parking_enforcement" | "tow_truck" | "meter_maid" | "police"
  coordinates: { lat: number; lng: number }
  address: string
  reportedAt: Date
  reportedBy: string
  upvotes: number
  downvotes: number
  expiresAt: Date
}

export interface MeterStatus {
  id: string
  meterId: string
  coordinates: { lat: number; lng: number }
  address: string
  status: "working" | "broken" | "card_only" | "coin_only" | "free"
  reportedAt: Date
  reportedBy: string
  confirmations: number
  lastConfirmed: Date
}

export interface ParkingAvailability {
  id: string
  coordinates: { lat: number; lng: number }
  address: string
  spotsAvailable: "none" | "few" | "some" | "many"
  reportedAt: Date
  reportedBy: string
}

export interface DataCorrection {
  id: string
  type: "wrong_hours" | "wrong_restrictions" | "sign_missing" | "sign_changed" | "other"
  coordinates: { lat: number; lng: number }
  address: string
  description: string
  photoUrl?: string
  reportedAt: Date
  reportedBy: string
  status: "pending" | "reviewed" | "fixed" | "rejected"
}

export interface PhotoEvidence {
  id: string
  photoUrl: string
  caption: string
  coordinates?: { lat: number; lng: number }
  address?: string
  capturedAt: Date
  tags: string[]
}

const USER_ID_KEY = "park_anonymous_user_id"

// Generate anonymous user ID
export function getAnonymousUserId(): string {
  if (typeof window === "undefined") return "server"

  let userId = localStorage.getItem(USER_ID_KEY)
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem(USER_ID_KEY, userId)
  }
  return userId
}

// Convert DB sighting to enforcement sighting
function toEnforcementSighting(sighting: DBEnforcementSighting): EnforcementSighting {
  return {
    id: sighting.id,
    type: sighting.type === "parking_officer" ? "parking_enforcement" : sighting.type,
    coordinates: { lat: sighting.latitude, lng: sighting.longitude },
    address: sighting.address || "",
    reportedAt: new Date(sighting.created_at),
    reportedBy: sighting.user_id || "anonymous",
    upvotes: sighting.upvotes,
    downvotes: sighting.downvotes,
    expiresAt: new Date(sighting.expires_at || Date.now() + 2 * 60 * 60 * 1000),
  }
}

// Convert DB photo to photo evidence
function toPhotoEvidence(photo: DBPhotoEvidence): PhotoEvidence {
  return {
    id: photo.id,
    photoUrl: photo.storage_path,
    caption: photo.notes || "",
    coordinates: photo.latitude != null && photo.longitude != null
      ? { lat: photo.latitude, lng: photo.longitude }
      : undefined,
    address: photo.address ?? undefined,
    capturedAt: new Date(photo.created_at),
    tags: photo.tags ?? [],
  }
}

// Enforcement Sightings
export async function reportEnforcement(
  type: EnforcementSighting["type"],
  coordinates: { lat: number; lng: number },
  address: string
): Promise<EnforcementSighting> {
  const dbType = type === "parking_enforcement" ? "parking_officer" : type
  const report = await dbAddSighting({
    type: dbType as DBEnforcementSighting["type"],
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    address,
    notes: null,
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  })

  return toEnforcementSighting(report)
}

export async function getEnforcementSightings(): Promise<EnforcementSighting[]> {
  const reports = await dbGetNearbySightings(0, 0, 1000)
  return reports.map(toEnforcementSighting)
}

export async function getNearbyEnforcement(
  lat: number,
  lng: number,
  radiusKm: number = 1
): Promise<EnforcementSighting[]> {
  const reports = await dbGetNearbySightings(lat, lng, radiusKm)
  return reports
    .map(toEnforcementSighting)
    .sort((a, b) =>
      getDistanceKm(lat, lng, a.coordinates.lat, a.coordinates.lng) -
      getDistanceKm(lat, lng, b.coordinates.lat, b.coordinates.lng)
    )
}

export async function voteEnforcement(id: string, isUpvote: boolean): Promise<void> {
  await dbVoteSighting(id, isUpvote ? "up" : "down")
}

// Meter Status (still uses localStorage for quick lookups)
const METERS_KEY = "park_meter_status"

export function reportMeterStatus(
  meterId: string,
  status: MeterStatus["status"],
  coordinates: { lat: number; lng: number },
  address: string
): MeterStatus {
  const meters = getMeterStatuses()
  const existingIndex = meters.findIndex((m) => m.meterId === meterId)

  const meterReport: MeterStatus = {
    id: existingIndex !== -1 ? meters[existingIndex].id : `meter_${Date.now()}`,
    meterId,
    coordinates,
    address,
    status,
    reportedAt: new Date(),
    reportedBy: getAnonymousUserId(),
    confirmations:
      existingIndex !== -1 && meters[existingIndex].status === status
        ? meters[existingIndex].confirmations + 1
        : 1,
    lastConfirmed: new Date(),
  }

  if (existingIndex !== -1) {
    meters[existingIndex] = meterReport
  } else {
    meters.push(meterReport)
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(METERS_KEY, JSON.stringify(meters))
  }
  return meterReport
}

export function getMeterStatuses(): MeterStatus[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(METERS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function getNearbyMeters(
  lat: number,
  lng: number,
  radiusKm: number = 0.5
): MeterStatus[] {
  return getMeterStatuses().filter((m) => {
    const distance = getDistanceKm(lat, lng, m.coordinates.lat, m.coordinates.lng)
    return distance <= radiusKm
  })
}

// Parking Availability
const AVAILABILITY_KEY = "park_availability"

export function reportAvailability(
  coordinates: { lat: number; lng: number },
  address: string,
  spotsAvailable: ParkingAvailability["spotsAvailable"]
): ParkingAvailability {
  const report: ParkingAvailability = {
    id: `avail_${Date.now()}`,
    coordinates,
    address,
    spotsAvailable,
    reportedAt: new Date(),
    reportedBy: getAnonymousUserId(),
  }

  const existing = getAvailabilityReports()
  existing.push(report)
  if (typeof window !== "undefined") {
    localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(existing.slice(-100)))
  }

  return report
}

export function getAvailabilityReports(): ParkingAvailability[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(AVAILABILITY_KEY)
  if (!stored) return []

  const reports: ParkingAvailability[] = JSON.parse(stored)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  return reports.filter((r) => new Date(r.reportedAt) > oneHourAgo)
}

// Data Corrections
const CORRECTIONS_KEY = "park_corrections"

export function reportCorrection(
  type: DataCorrection["type"],
  coordinates: { lat: number; lng: number },
  address: string,
  description: string,
  photoUrl?: string
): DataCorrection {
  const correction: DataCorrection = {
    id: `corr_${Date.now()}`,
    type,
    coordinates,
    address,
    description,
    photoUrl,
    reportedAt: new Date(),
    reportedBy: getAnonymousUserId(),
    status: "pending",
  }

  const existing = getCorrections()
  existing.push(correction)
  if (typeof window !== "undefined") {
    localStorage.setItem(CORRECTIONS_KEY, JSON.stringify(existing))
  }

  return correction
}

export function getCorrections(): DataCorrection[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(CORRECTIONS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function getUserCorrections(): DataCorrection[] {
  const userId = getAnonymousUserId()
  return getCorrections().filter((c) => c.reportedBy === userId)
}

// Photo Evidence Vault
export async function savePhotoEvidence(
  photoUrl: string,
  caption: string,
  coordinates?: { lat: number; lng: number },
  address?: string,
  tags: string[] = []
): Promise<PhotoEvidence> {
  const photo = await dbAddPhotoEvidence({
    storage_path: photoUrl,
    latitude: coordinates?.lat ?? null,
    longitude: coordinates?.lng ?? null,
    address: address ?? null,
    tags: tags.length > 0 ? tags : ["sign"],
    notes: caption,
  })

  return toPhotoEvidence(photo)
}

export async function getPhotoEvidence(): Promise<PhotoEvidence[]> {
  const photos = await dbGetPhotoEvidence()
  return photos.map(toPhotoEvidence)
}

export async function deletePhotoEvidence(id: string): Promise<void> {
  await dbDeletePhotoEvidence(id)
}

// Utility: Calculate distance between two coordinates in km
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Labels
export function getEnforcementTypeLabel(type: EnforcementSighting["type"]): string {
  const labels: Record<string, string> = {
    parking_enforcement: "Parking Enforcement",
    tow_truck: "Tow Truck",
    meter_maid: "Meter Maid",
    police: "Police",
  }
  return labels[type] || "Unknown"
}

export function getMeterStatusLabel(status: MeterStatus["status"]): string {
  const labels: Record<string, string> = {
    working: "Working",
    broken: "Broken",
    card_only: "Card Only",
    coin_only: "Coins Only",
    free: "Free Parking",
  }
  return labels[status] || "Unknown"
}

export function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}
