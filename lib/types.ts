import type { ParkingResult } from "@/lib/parking-rules"
import type { ProtectionSession } from "@/lib/protection"
import type { User } from "@/lib/auth"

export interface HistoryItem {
  id: string
  location: string
  street: string
  date: Date
  status: "allowed" | "restricted" | "prohibited"
  result: ParkingResult
  coordinates: { lat: number; lng: number }
}

export interface LocationData {
  latitude: number
  longitude: number
  address: string
  street: string
  city: string
  timestamp: Date
}

export type Tab = "home" | "community" | "history" | "settings"

export interface AppState {
  user: User | null
  parkingResult: ParkingResult | null
  currentLocation: LocationData | null
  history: HistoryItem[]
  activeSession: ProtectionSession | null
  sessionTimeRemaining: number | null
  remainingChecks: number
  reminderSet: boolean
  showUpgrade: boolean
  showTimer: boolean
  showScanSign: boolean
  showPhotoVault: boolean
  showReportIssue: boolean
}
