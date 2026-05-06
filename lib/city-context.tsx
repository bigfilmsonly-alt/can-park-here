"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { detectCity, isCalifornia, isFlorida } from "@/lib/parking-data/city-detect"

type Region = "sf" | "miami"

interface CityContextValue {
  region: Region
  setRegion: (r: Region) => void
  regionName: string
  regionState: string
}

const REGION_META: Record<Region, { name: string; state: string }> = {
  sf: { name: "San Francisco Bay Area", state: "CA" },
  miami: { name: "Miami Metro", state: "FL" },
}

const STORAGE_KEY = "park.region"

const CityContext = createContext<CityContextValue | null>(null)

export function CityProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<Region>("sf")
  const [hydrated, setHydrated] = useState(false)

  // On mount: read from localStorage, or auto-detect from GPS
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "sf" || stored === "miami") {
      setRegionState(stored)
      setHydrated(true)
      return
    }

    // No stored preference — try GPS auto-detect
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const result = detectCity(pos.coords.latitude, pos.coords.longitude)
          if (result.supported) {
            const detected: Region =
              isFlorida(result.city) ? "miami" : isCalifornia(result.city) ? "sf" : "sf"
            setRegionState(detected)
            localStorage.setItem(STORAGE_KEY, detected)
          }
          setHydrated(true)
        },
        () => {
          // Geolocation denied or failed — keep default "sf"
          setHydrated(true)
        },
        { timeout: 5000, maximumAge: 300000 }
      )
    } else {
      setHydrated(true)
    }
  }, [])

  const setRegion = (r: Region) => {
    setRegionState(r)
    localStorage.setItem(STORAGE_KEY, r)
  }

  const meta = REGION_META[region]

  // Render children even before hydration to avoid layout shift;
  // context values will update once hydrated.
  return (
    <CityContext.Provider
      value={{
        region,
        setRegion,
        regionName: meta.name,
        regionState: meta.state,
      }}
    >
      {children}
    </CityContext.Provider>
  )
}

export function useCity(): CityContextValue {
  const ctx = useContext(CityContext)
  if (!ctx) {
    throw new Error("useCity must be used within a <CityProvider>")
  }
  return ctx
}
