"use client"

import { useState, useEffect, useCallback } from "react"

interface CachedParkingData {
  coordinates: { lat: number; lng: number }
  address: string
  result: {
    canPark: boolean
    status: string
    message: string
    timeRemaining?: number
  }
  timestamp: number
}

const CACHE_KEY = "park_offline_cache"
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [cachedLocations, setCachedLocations] = useState<CachedParkingData[]>([])

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Load cached data
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        const data = JSON.parse(cached) as CachedParkingData[]
        // Filter out expired entries
        const validData = data.filter(
          (item) => Date.now() - item.timestamp < CACHE_DURATION
        )
        setCachedLocations(validData)
      } catch {
        // Invalid cache, clear it
        localStorage.removeItem(CACHE_KEY)
      }
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const cacheLocation = useCallback(
    (data: Omit<CachedParkingData, "timestamp">) => {
      const newEntry: CachedParkingData = {
        ...data,
        timestamp: Date.now(),
      }

      setCachedLocations((prev) => {
        // Check if location already exists (within ~100 meters)
        const existingIndex = prev.findIndex((item) => {
          const latDiff = Math.abs(item.coordinates.lat - data.coordinates.lat)
          const lngDiff = Math.abs(item.coordinates.lng - data.coordinates.lng)
          return latDiff < 0.001 && lngDiff < 0.001
        })

        let updated: CachedParkingData[]
        if (existingIndex >= 0) {
          // Update existing
          updated = [...prev]
          updated[existingIndex] = newEntry
        } else {
          // Add new, keep last 50 locations
          updated = [newEntry, ...prev].slice(0, 50)
        }

        localStorage.setItem(CACHE_KEY, JSON.stringify(updated))
        return updated
      })
    },
    []
  )

  const getCachedResult = useCallback(
    (lat: number, lng: number): CachedParkingData | null => {
      // Find closest cached location within ~100 meters
      const match = cachedLocations.find((item) => {
        const latDiff = Math.abs(item.coordinates.lat - lat)
        const lngDiff = Math.abs(item.coordinates.lng - lng)
        return latDiff < 0.001 && lngDiff < 0.001
      })

      if (match && Date.now() - match.timestamp < CACHE_DURATION) {
        return match
      }

      return null
    },
    [cachedLocations]
  )

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY)
    setCachedLocations([])
  }, [])

  return {
    isOnline,
    cachedLocations,
    cacheLocation,
    getCachedResult,
    clearCache,
    cachedCount: cachedLocations.length,
  }
}
