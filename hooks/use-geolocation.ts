"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export interface LocationData {
  latitude: number
  longitude: number
  address: string
  street: string
  city: string
  timestamp: Date
}

export interface GeolocationState {
  location: LocationData | null
  loading: boolean
  error: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
  })
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const reverseGeocode = async (
    lat: number,
    lng: number
  ): Promise<{ address: string; street: string; city: string }> => {
    try {
      // Using OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            "User-Agent": "ParkingApp/1.0",
          },
        }
      )

      if (!response.ok) {
        throw new Error("Geocoding failed")
      }

      const data = await response.json()
      const address = data.address || {}

      return {
        address: data.display_name || "Unknown location",
        street:
          address.road ||
          address.street ||
          address.pedestrian ||
          "Unknown street",
        city:
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          "Unknown city",
      }
    } catch {
      // Fallback to formatted coordinates
      return {
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        street: "Current location",
        city: "Unknown",
      }
    }
  }

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    // SSR guard
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return null
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    if (!navigator.geolocation) {
      setState({
        location: null,
        loading: false,
        error: "Geolocation is not supported by your browser",
      })
      return null
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const geocoded = await reverseGeocode(latitude, longitude)

          // Guard against setState after unmount
          if (!mountedRef.current) {
            resolve(null)
            return
          }

          const locationData: LocationData = {
            latitude,
            longitude,
            address: geocoded.address,
            street: geocoded.street,
            city: geocoded.city,
            timestamp: new Date(),
          }

          setState({
            location: locationData,
            loading: false,
            error: null,
          })

          resolve(locationData)
        },
        (error) => {
          // Guard against setState after unmount
          if (!mountedRef.current) {
            resolve(null)
            return
          }

          let errorMessage = "Unable to retrieve your location"

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location services."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable."
              break
            case error.TIMEOUT:
              errorMessage = "Location request timed out."
              break
          }

          setState({
            location: null,
            loading: false,
            error: errorMessage,
          })

          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      )
    })
  }, [])

  return {
    ...state,
    getCurrentLocation,
  }
}
