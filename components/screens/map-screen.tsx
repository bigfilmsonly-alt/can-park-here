"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  MapPin, 
  Car, 
  Zap, 
  Navigation, 
  RefreshCw,
  Filter,
  X,
  Clock,
  DollarSign,
  Building2,
  ChevronRight,
  Locate
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

  const defaultLocation = { lat: 37.7749, lng: -122.4194 } // San Francisco
  const location = currentLocation || defaultLocation

  const loadData = useCallback(() => {
    setLoading(true)
    
    const parkingSpots = getNearbyParkingSpots(location.lat, location.lng)
    const parkingGarages = getNearbyGarages(location.lat, location.lng)
    const chargingStations = getNearbyEVStations(location.lat, location.lng)
    
    setSpots(parkingSpots)
    setGarages(parkingGarages)
    setEVStations(chargingStations)
    setLoading(false)
  }, [location.lat, location.lng])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Clear localStorage to get fresh mock data
    localStorage.removeItem("park_parking_spots")
    localStorage.removeItem("park_garages")
    localStorage.removeItem("park_ev_stations")
    loadData()
    setTimeout(() => setRefreshing(false), 500)
  }

  const getAvailableStreetSpots = () => spots.filter(s => s.status === "available")
  
  const getItemDistance = (item: { lat: number; lng: number }) => {
    return calculateDistance(location.lat, location.lng, item.lat, item.lng)
  }

  const sortedGarages = [...garages].sort((a, b) => getItemDistance(a) - getItemDistance(b))
  const sortedEVStations = [...evStations].sort((a, b) => getItemDistance(a) - getItemDistance(b))
  const availableSpots = getAvailableStreetSpots().sort((a, b) => getItemDistance(a) - getItemDistance(b))

  const handleNavigate = (lat: number, lng: number) => {
    window.open(getDirectionsUrl(lat, lng), "_blank")
  }

  const isSpot = (item: unknown): item is ParkingSpot => {
    return (item as ParkingSpot).type !== undefined && (item as ParkingSpot).status !== undefined
  }

  const isGarage = (item: unknown): item is ParkingGarage => {
    return (item as ParkingGarage).totalSpaces !== undefined
  }

  const isEVStation = (item: unknown): item is EVStation => {
    return (item as EVStation).chargerTypes !== undefined
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground flex-1">Parking Map</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {[
            { id: "all", label: "All", icon: Filter },
            { id: "street", label: "Street", icon: MapPin },
            { id: "garages", label: "Garages", icon: Building2 },
            { id: "ev", label: "EV Charging", icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as ViewMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                viewMode === tab.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map placeholder - in production would use Mapbox/Google Maps */}
      <div className="relative flex-1 bg-muted/30 min-h-[200px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Interactive map would display here
            </p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              (Requires Mapbox or Google Maps integration)
            </p>
          </div>
        </div>

        {/* Current location indicator */}
        <button className="absolute bottom-4 right-4 p-3 bg-card rounded-full shadow-lg border border-border hover:bg-muted transition-colors">
          <Locate className="h-5 w-5 text-foreground" />
        </button>

        {/* Stats overlay */}
        <div className="absolute top-4 left-4 right-4 flex gap-2">
          <div className="bg-card/95 backdrop-blur-sm rounded-xl px-3 py-2 border border-border shadow-sm">
            <p className="text-xs text-muted-foreground">Street Spots</p>
            <p className="text-lg font-semibold text-foreground">{availableSpots.length}</p>
          </div>
          <div className="bg-card/95 backdrop-blur-sm rounded-xl px-3 py-2 border border-border shadow-sm">
            <p className="text-xs text-muted-foreground">Garages</p>
            <p className="text-lg font-semibold text-foreground">{garages.length}</p>
          </div>
          <div className="bg-card/95 backdrop-blur-sm rounded-xl px-3 py-2 border border-border shadow-sm">
            <p className="text-xs text-muted-foreground">EV Stations</p>
            <p className="text-lg font-semibold text-foreground">{evStations.length}</p>
          </div>
        </div>
      </div>

      {/* Results list */}
      <div className="flex-1 bg-background">
        {loading ? (
          <div className="p-6 text-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading nearby parking...</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Street Parking */}
            {(viewMode === "all" || viewMode === "street") && availableSpots.length > 0 && (
              <div className="p-4">
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  Street Parking ({availableSpots.length} available)
                </h2>
                <div className="space-y-2">
                  {availableSpots.slice(0, 5).map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => setSelectedItem(spot)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        spot.type === "handicap" ? "bg-blue-100 text-blue-600" :
                        spot.type === "metered" ? "bg-amber-100 text-amber-600" :
                        "bg-emerald-100 text-emerald-600"
                      }`}>
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground capitalize">
                          {spot.type} parking
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistance(getItemDistance(spot))} away
                          {spot.timeLimit && ` • ${spot.timeLimit} min limit`}
                          {spot.rate && ` • $${spot.rate}/hr`}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Garages */}
            {(viewMode === "all" || viewMode === "garages") && sortedGarages.length > 0 && (
              <div className="p-4">
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  Parking Garages ({sortedGarages.length})
                </h2>
                <div className="space-y-2">
                  {sortedGarages.map((garage) => (
                    <button
                      key={garage.id}
                      onClick={() => setSelectedItem(garage)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{garage.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistance(getItemDistance(garage))} • {garage.availableSpaces}/{garage.totalSpaces} spots • ${garage.rate}/hr
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        garage.availableSpaces > 50 
                          ? "bg-emerald-100 text-emerald-700"
                          : garage.availableSpaces > 10
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {garage.availableSpaces}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* EV Stations */}
            {(viewMode === "all" || viewMode === "ev") && sortedEVStations.length > 0 && (
              <div className="p-4">
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  EV Charging ({sortedEVStations.length})
                </h2>
                <div className="space-y-2">
                  {sortedEVStations.map((station) => (
                    <button
                      key={station.id}
                      onClick={() => setSelectedItem(station)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{station.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistance(getItemDistance(station))} • {station.chargerTypes.join(", ")}
                          {station.pricePerKwh && ` • $${station.pricePerKwh}/kWh`}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        station.availablePorts > 2
                          ? "bg-emerald-100 text-emerald-700"
                          : station.availablePorts > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {station.availablePorts}/{station.totalPorts}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected item detail panel */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSelectedItem(null)}>
          <div 
            className="w-full max-w-lg bg-card rounded-t-3xl p-6 animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                {isSpot(selectedItem) && (
                  <>
                    <h3 className="text-lg font-semibold text-foreground capitalize">
                      {selectedItem.type} Parking
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDistance(getItemDistance(selectedItem))} away • {estimateWalkingTime(getItemDistance(selectedItem))} walk
                    </p>
                  </>
                )}
                {isGarage(selectedItem) && (
                  <>
                    <h3 className="text-lg font-semibold text-foreground">{selectedItem.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedItem.address}</p>
                  </>
                )}
                {isEVStation(selectedItem) && (
                  <>
                    <h3 className="text-lg font-semibold text-foreground">{selectedItem.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedItem.address}</p>
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              {isSpot(selectedItem) && (
                <>
                  {selectedItem.timeLimit && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{selectedItem.timeLimit} minute limit</span>
                    </div>
                  )}
                  {selectedItem.rate && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">${selectedItem.rate}/hour</span>
                    </div>
                  )}
                </>
              )}
              {isGarage(selectedItem) && (
                <>
                  <div className="flex items-center gap-3">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {selectedItem.availableSpaces} of {selectedItem.totalSpaces} spots available
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      ${selectedItem.rate}/hr (max ${selectedItem.maxRate}/day)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedItem.hours}</span>
                  </div>
                  {selectedItem.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedItem.features.map((feature) => (
                        <span key={feature} className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
              {isEVStation(selectedItem) && (
                <>
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {selectedItem.availablePorts} of {selectedItem.totalPorts} ports available
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Charger types:</span>
                    <span className="text-sm text-foreground">{selectedItem.chargerTypes.join(", ")}</span>
                  </div>
                  {selectedItem.pricePerKwh && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">${selectedItem.pricePerKwh}/kWh</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <Button
              onClick={() => handleNavigate(selectedItem.lat, selectedItem.lng)}
              className="w-full h-12 text-base font-medium rounded-2xl"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Get Directions
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
