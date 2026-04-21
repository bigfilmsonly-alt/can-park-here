"use client"

import { useState, useEffect, useCallback } from "react"

export interface SavedLocation {
  id: string
  name: string
  street: string
  address: string
  coordinates: { lat: number; lng: number }
  createdAt: Date
}

const STORAGE_KEY = "park-saved-locations"

export function useSavedLocations() {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    // SSR guard
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        const locations = parsed.map((loc: SavedLocation) => ({
          ...loc,
          createdAt: new Date(loc.createdAt),
        }))
        setSavedLocations(locations)
      }
    } catch {
      console.error("Failed to load saved locations")
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever locations change
  useEffect(() => {
    if (!isLoaded) return
    // SSR guard
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLocations))
    } catch {
      // localStorage may be full or unavailable
    }
  }, [savedLocations, isLoaded])

  const saveLocation = useCallback(
    (location: Omit<SavedLocation, "id" | "createdAt">) => {
      const newLocation: SavedLocation = {
        ...location,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      }

      setSavedLocations((prev) => [newLocation, ...prev])
      return newLocation
    },
    []
  )

  const removeLocation = useCallback((id: string) => {
    setSavedLocations((prev) => prev.filter((loc) => loc.id !== id))
  }, [])

  const updateLocationName = useCallback((id: string, name: string) => {
    setSavedLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, name } : loc))
    )
  }, [])

  const isLocationSaved = useCallback(
    (lat: number, lng: number) => {
      return savedLocations.some(
        (loc) =>
          Math.abs(loc.coordinates.lat - lat) < 0.0001 &&
          Math.abs(loc.coordinates.lng - lng) < 0.0001
      )
    },
    [savedLocations]
  )

  const getLocationByCoords = useCallback(
    (lat: number, lng: number) => {
      return savedLocations.find(
        (loc) =>
          Math.abs(loc.coordinates.lat - lat) < 0.0001 &&
          Math.abs(loc.coordinates.lng - lng) < 0.0001
      )
    },
    [savedLocations]
  )

  return {
    savedLocations,
    saveLocation,
    removeLocation,
    updateLocationName,
    isLocationSaved,
    getLocationByCoords,
    isLoaded,
  }
}
