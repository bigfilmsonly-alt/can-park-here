"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  MapPin,
  Zap,
  Navigation,
  RefreshCw,
  X,
  Clock,
  DollarSign,
  Building2,
  ChevronRight,
  Check,
  AlertTriangle,
  Compass,
} from "lucide-react"
import {
  getNearbyParkingSpots,
  getNearbyGarages,
  getNearbyEVStations,
  calculateDistance,
  formatDistance,
  estimateWalkingTime,
  getDirectionsUrl,
  type ParkingSpot,
  type ParkingGarage,
  type EVStation,
} from "@/lib/mapping"
import { MapWrapper } from "@/components/map/map-wrapper"
import type { MapMarker } from "@/components/map/leaflet-map"

interface MapScreenProps {
  onBack: () => void
  currentLocation?: { lat: number; lng: number }
}

type ViewMode = "all" | "street" | "garages" | "ev"

export function MapScreen({ onBack, currentLocation }: MapScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("all")
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [garages, setGarages] = useState<ParkingGarage[]>([])
  const [evStations, setEVStations] = useState<EVStation[]>([])
  const [selectedItem, setSelectedItem] = useState<ParkingSpot | ParkingGarage | EVStation | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const defaultLocation = { lat: 37.7749, lng: -122.4194 }
  const location = currentLocation || defaultLocation

  const loadData = useCallback(() => {
    setLoading(true)
    setSpots(getNearbyParkingSpots(location.lat, location.lng))
    setGarages(getNearbyGarages(location.lat, location.lng))
    setEVStations(getNearbyEVStations(location.lat, location.lng))
    setLoading(false)
  }, [location.lat, location.lng])

  useEffect(() => { loadData() }, [loadData])

  const handleRefresh = async () => {
    setRefreshing(true)
    localStorage.removeItem("park_parking_spots")
    localStorage.removeItem("park_garages")
    localStorage.removeItem("park_ev_stations")
    loadData()
    setTimeout(() => setRefreshing(false), 500)
  }

  const getItemDistance = (item: { lat: number; lng: number }) =>
    calculateDistance(location.lat, location.lng, item.lat, item.lng)

  const availableSpots = spots.filter(s => s.status === "available").sort((a, b) => getItemDistance(a) - getItemDistance(b))
  const sortedGarages = [...garages].sort((a, b) => getItemDistance(a) - getItemDistance(b))
  const sortedEVStations = [...evStations].sort((a, b) => getItemDistance(a) - getItemDistance(b))

  const mapMarkers = useMemo(() => {
    const markers: MapMarker[] = [
      { lat: location.lat, lng: location.lng, type: "user", label: "You are here" },
    ]
    if (viewMode === "all" || viewMode === "street") {
      availableSpots.forEach((spot) => {
        markers.push({
          lat: spot.lat, lng: spot.lng, type: "street",
          label: `${spot.type.charAt(0).toUpperCase() + spot.type.slice(1)} Parking`,
          details: [formatDistance(getItemDistance(spot)) + " away", spot.timeLimit ? `${spot.timeLimit} min limit` : null, spot.rate ? `$${spot.rate}/hr` : null].filter(Boolean).join(" | "),
        })
      })
    }
    if (viewMode === "all" || viewMode === "garages") {
      sortedGarages.forEach((garage) => {
        markers.push({ lat: garage.lat, lng: garage.lng, type: "garage", label: garage.name, details: `${garage.availableSpaces}/${garage.totalSpaces} spots | $${garage.rate}/hr` })
      })
    }
    if (viewMode === "all" || viewMode === "ev") {
      sortedEVStations.forEach((station) => {
        markers.push({ lat: station.lat, lng: station.lng, type: "ev", label: station.name, details: `${station.availablePorts}/${station.totalPorts} ports | ${station.chargerTypes.join(", ")}` })
      })
    }
    return markers
  }, [viewMode, availableSpots, sortedGarages, sortedEVStations, location.lat, location.lng])

  const handleNavigate = (lat: number, lng: number) => {
    window.open(getDirectionsUrl(lat, lng), "_blank")
  }

  const isSpot = (item: ParkingSpot | ParkingGarage | EVStation): item is ParkingSpot =>
    "status" in item && "type" in item && !("totalSpaces" in item) && !("chargerTypes" in item)
  const isGarage = (item: ParkingSpot | ParkingGarage | EVStation): item is ParkingGarage =>
    "totalSpaces" in item
  const isEVStation = (item: ParkingSpot | ParkingGarage | EVStation): item is EVStation =>
    "chargerTypes" in item

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapWrapper center={location} zoom={14} markers={mapMarkers} />
      </div>

      {/* Top search bar */}
      <div className="absolute top-16 left-3.5 right-3.5 z-[1000]">
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-full border border-border"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <MapPin className="w-[18px] h-[18px] text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">Valencia & 20th</div>
            <div className="text-[11px] text-muted-foreground">San Francisco</div>
          </div>
          <button
            onClick={handleRefresh}
            className="w-[30px] h-[30px] rounded-full bg-muted flex items-center justify-center shrink-0"
          >
            <Compass className={`w-4 h-4 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Legend pills */}
        <div className="flex gap-1.5 mt-2.5 justify-center">
          {[
            { id: "all", label: "Open", dot: "var(--status-success)" },
            { id: "garages", label: "Garages", dot: "var(--status-warning)" },
            { id: "ev", label: "EV", dot: "var(--accent)" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setViewMode(item.id as ViewMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-[11px] font-semibold"
              style={{
                background: viewMode === item.id ? "var(--foreground)" : "rgba(255,255,255,0.9)",
                color: viewMode === item.id ? "var(--background)" : "var(--foreground)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: item.dot }} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="absolute bottom-24 left-3.5 right-3.5 z-[1000]">
        {selectedItem ? (
          <div
            className="animate-fade-in-up bg-card border border-border rounded-[18px] p-4"
            style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: isSpot(selectedItem) ? "var(--status-success-bg)" : isGarage(selectedItem) ? "var(--status-warning-bg)" : "var(--accent-pale)",
                  color: isSpot(selectedItem) ? "var(--status-success-foreground)" : isGarage(selectedItem) ? "var(--status-warning-foreground)" : "var(--accent)",
                }}
              >
                {isSpot(selectedItem) ? <Check className="w-5 h-5" /> : isGarage(selectedItem) ? <Building2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold">
                  {isSpot(selectedItem) ? `${selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)} parking` : (selectedItem as ParkingGarage | EVStation).name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatDistance(getItemDistance(selectedItem))} · {estimateWalkingTime(getItemDistance(selectedItem))} walk
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-2 mt-3.5">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-2.5 rounded-full border border-border text-sm font-semibold press-effect"
              >
                Close
              </button>
              <button
                onClick={() => handleNavigate(selectedItem.lat, selectedItem.lng)}
                className="flex-[2] py-2.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2 press-effect"
                style={{ background: "var(--accent)" }}
              >
                <Navigation className="w-3.5 h-3.5" /> Navigate here
              </button>
            </div>
          </div>
        ) : (
          <div
            className="bg-card border border-border rounded-[18px] p-3.5 flex items-center gap-2.5"
            style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}
          >
            <div className="text-[13px] flex-1" style={{ color: "var(--fg2)" }}>
              Tap a pin to see details · {availableSpots.length} open spots nearby
            </div>
            <button
              className="px-3 py-2 rounded-full text-xs font-semibold text-white shrink-0 press-effect"
              style={{ background: "var(--accent)" }}
            >
              Report spot
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
