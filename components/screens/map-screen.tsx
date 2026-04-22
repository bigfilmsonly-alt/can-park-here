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
  ShieldAlert,
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
import {
  getEnforcementSightings,
  getEnforcementTypeLabel,
  getTimeAgo,
  type EnforcementSighting,
} from "@/lib/community"
import { MapWrapper } from "@/components/map/map-wrapper"
import type { MapMarker } from "@/components/map/leaflet-map"

interface MapScreenProps {
  onBack: () => void
  currentLocation?: { lat: number; lng: number }
}

type ViewMode = "all" | "street" | "garages" | "ev" | "enforcement"

export function MapScreen({ onBack, currentLocation }: MapScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("all")
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [garages, setGarages] = useState<ParkingGarage[]>([])
  const [evStations, setEVStations] = useState<EVStation[]>([])
  const [enforcementSightings, setEnforcementSightings] = useState<EnforcementSighting[]>([])
  const [selectedItem, setSelectedItem] = useState<ParkingSpot | ParkingGarage | EVStation | EnforcementSighting | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const defaultLocation = { lat: 37.7749, lng: -122.4194 }
  const location = currentLocation || defaultLocation

  const loadData = useCallback(async () => {
    setLoading(true)
    setSpots(getNearbyParkingSpots(location.lat, location.lng))
    setGarages(getNearbyGarages(location.lat, location.lng))
    setEVStations(getNearbyEVStations(location.lat, location.lng))
    try {
      const sightings = await getEnforcementSightings()
      setEnforcementSightings(sightings)
    } catch {
      // Enforcement sightings are non-critical; continue without them
    }
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

  const getItemDistance = (item: { lat: number; lng: number } | EnforcementSighting) => {
    if ("coordinates" in item && "reportedAt" in item) {
      return calculateDistance(location.lat, location.lng, item.coordinates.lat, item.coordinates.lng)
    }
    const p = item as { lat: number; lng: number }
    return calculateDistance(location.lat, location.lng, p.lat, p.lng)
  }

  const availableSpots = spots.filter(s => s.status === "available").sort((a, b) => getItemDistance(a) - getItemDistance(b))
  const sortedGarages = [...garages].sort((a, b) => getItemDistance(a) - getItemDistance(b))
  const sortedEVStations = [...evStations].sort((a, b) => getItemDistance(a) - getItemDistance(b))
  const sortedEnforcement = [...enforcementSightings].sort((a, b) =>
    calculateDistance(location.lat, location.lng, a.coordinates.lat, a.coordinates.lng) -
    calculateDistance(location.lat, location.lng, b.coordinates.lat, b.coordinates.lng)
  )

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
    if (viewMode === "all" || viewMode === "enforcement") {
      sortedEnforcement.forEach((sighting) => {
        const dist = calculateDistance(location.lat, location.lng, sighting.coordinates.lat, sighting.coordinates.lng)
        markers.push({
          lat: sighting.coordinates.lat,
          lng: sighting.coordinates.lng,
          type: "enforcement",
          label: getEnforcementTypeLabel(sighting.type),
          details: [getTimeAgo(sighting.reportedAt), formatDistance(dist) + " away"].join(" · "),
        })
      })
    }
    return markers
  }, [viewMode, availableSpots, sortedGarages, sortedEVStations, sortedEnforcement, location.lat, location.lng])

  const handleMarkerClick = (marker: MapMarker) => {
    if (marker.type === "user") return
    // Find the real data item matching this marker's coordinates
    if (marker.type === "street") {
      const spot = availableSpots.find(s => s.lat === marker.lat && s.lng === marker.lng)
      if (spot) setSelectedItem(spot)
    } else if (marker.type === "garage") {
      const garage = sortedGarages.find(g => g.lat === marker.lat && g.lng === marker.lng)
      if (garage) setSelectedItem(garage)
    } else if (marker.type === "ev") {
      const station = sortedEVStations.find(s => s.lat === marker.lat && s.lng === marker.lng)
      if (station) setSelectedItem(station)
    } else if (marker.type === "enforcement") {
      const sighting = sortedEnforcement.find(s => s.coordinates.lat === marker.lat && s.coordinates.lng === marker.lng)
      if (sighting) setSelectedItem(sighting)
    }
  }

  const handleNavigate = (lat: number, lng: number) => {
    window.open(getDirectionsUrl(lat, lng), "_blank")
  }

  type SelectedItem = ParkingSpot | ParkingGarage | EVStation | EnforcementSighting
  const isEnforcement = (item: SelectedItem): item is EnforcementSighting =>
    "coordinates" in item && "reportedAt" in item && "expiresAt" in item
  const isSpot = (item: SelectedItem): item is ParkingSpot =>
    "status" in item && "type" in item && !("totalSpaces" in item) && !("chargerTypes" in item) && !isEnforcement(item)
  const isGarage = (item: SelectedItem): item is ParkingGarage =>
    "totalSpaces" in item
  const isEVStation = (item: SelectedItem): item is EVStation =>
    "chargerTypes" in item

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapWrapper center={location} zoom={14} markers={mapMarkers} onMarkerClick={handleMarkerClick} />
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
            { id: "garages", label: "Limited", dot: "var(--status-warning)" },
            { id: "ev", label: "Prohibited", dot: "var(--status-error)" },
            { id: "enforcement", label: "Enforcement", dot: "#dc2626" },
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
            className="animate-fade-in-up bg-card card-elevated rounded-[18px] p-4"
            style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: isEnforcement(selectedItem) ? "#fee2e2" : isSpot(selectedItem) ? "var(--status-success-bg)" : isGarage(selectedItem) ? "var(--status-warning-bg)" : "var(--accent-pale)",
                  color: isEnforcement(selectedItem) ? "#dc2626" : isSpot(selectedItem) ? "var(--status-success-foreground)" : isGarage(selectedItem) ? "var(--status-warning-foreground)" : "var(--accent)",
                }}
              >
                {isEnforcement(selectedItem) ? <ShieldAlert className="w-5 h-5" /> : isSpot(selectedItem) ? <Check className="w-5 h-5" /> : isGarage(selectedItem) ? <Building2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold">
                  {isEnforcement(selectedItem) ? getEnforcementTypeLabel(selectedItem.type) : isSpot(selectedItem) ? `${selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)} parking` : (selectedItem as ParkingGarage | EVStation).name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {isEnforcement(selectedItem)
                    ? `${getTimeAgo(selectedItem.reportedAt)} · ${formatDistance(getItemDistance(selectedItem))} away`
                    : `${formatDistance(getItemDistance(selectedItem))} · ${estimateWalkingTime(getItemDistance(selectedItem))} walk`}
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
                onClick={() => {
                  if (isEnforcement(selectedItem)) {
                    handleNavigate(selectedItem.coordinates.lat, selectedItem.coordinates.lng)
                  } else {
                    handleNavigate(selectedItem.lat, selectedItem.lng)
                  }
                }}
                className="flex-[2] py-2.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2 press-effect"
                style={{ background: "var(--accent)" }}
              >
                <Navigation className="w-3.5 h-3.5" /> {isEnforcement(selectedItem) ? "View on map" : "Navigate here"}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="bg-card card-elevated rounded-[18px] p-3.5 flex items-center gap-2.5"
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
