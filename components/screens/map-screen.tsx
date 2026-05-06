"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  MapPin,
  Navigation,
  X,
  Clock,
  DollarSign,
  Building2,
  Check,
  ShieldAlert,
  Zap,
  Search,
  LocateFixed,
  Bookmark,
  BookmarkCheck,
  Car,
  Footprints,
  Flag,
  ArrowUp,
  ArrowDown,
  Loader2,
  List,
  Truck,
  AlertTriangle,
  Timer,
  ParkingCircle,
} from "lucide-react"
import {
  getNearbyParkingSpots,
  getNearbyGarages,
  getNearbyEVStations,
  calculateDistance,
  formatDistance,
  estimateWalkingTime,
  estimateDrivingTime,
  getDirectionsUrl,
  type ParkingSpot,
  type ParkingGarage,
  type EVStation,
} from "@/lib/mapping"
import {
  getEnforcementSightings,
  getEnforcementTypeLabel,
  getTimeAgo,
  reportEnforcement,
  voteEnforcement,
  type EnforcementSighting,
} from "@/lib/community"
import {
  getNearbyTips,
  getNearbyVacatingSpots,
  getSpotRating,
  SPOT_TAG_LABELS,
  type SpotTip,
  type VacatingSpot,
} from "@/lib/spot-tips"
import { useSavedLocations } from "@/hooks/use-saved-locations"
import { MapWrapper } from "@/components/map/map-wrapper"
import type { MapMarker } from "@/components/map/leaflet-map"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MapScreenProps {
  onBack: () => void
  currentLocation?: { lat: number; lng: number }
}

type ViewMode = "all" | "street" | "garages" | "ev" | "enforcement"
type SheetState = "summary" | "detail" | "list" | "search" | "report"

interface SearchResult {
  displayName: string
  lat: number
  lng: number
}

type SelectedItem = ParkingSpot | ParkingGarage | EVStation | EnforcementSighting

type ReportType = "parking_enforcement" | "tow_truck" | "meter_maid" | "police"

/* ------------------------------------------------------------------ */
/*  Type guards                                                        */
/* ------------------------------------------------------------------ */

const isEnforcement = (item: SelectedItem): item is EnforcementSighting =>
  "coordinates" in item && "reportedAt" in item && "expiresAt" in item
const isSpot = (item: SelectedItem): item is ParkingSpot =>
  "status" in item && "type" in item && !("totalSpaces" in item) && !("chargerTypes" in item) && !isEnforcement(item)
const isGarage = (item: SelectedItem): item is ParkingGarage => "totalSpaces" in item
const isEV = (item: SelectedItem): item is EVStation => "chargerTypes" in item

/* ------------------------------------------------------------------ */
/*  MapScreen                                                          */
/* ------------------------------------------------------------------ */

export function MapScreen({ onBack, currentLocation }: MapScreenProps) {
  const defaultLocation = { lat: 37.7749, lng: -122.4194 }
  const location = currentLocation || defaultLocation

  const [viewMode, setViewMode] = useState<ViewMode>("all")
  const [sheetState, setSheetState] = useState<SheetState>("summary")
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null)
  const [mapCenter, setMapCenter] = useState(location)
  const [loading, setLoading] = useState(true)

  // Data
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [garages, setGarages] = useState<ParkingGarage[]>([])
  const [evStations, setEVStations] = useState<EVStation[]>([])
  const [enforcement, setEnforcement] = useState<EnforcementSighting[]>([])

  // Search
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchAbortRef = useRef<AbortController>(null)

  // Report
  const [reportType, setReportType] = useState<ReportType | null>(null)
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  // Vacating spots
  const [vacatingSpots, setVacatingSpots] = useState<VacatingSpot[]>([])

  // Saved locations
  const { isLocationSaved, saveLocation, removeLocation, getLocationByCoords } = useSavedLocations()

  /* ── Load data ── */
  const loadData = useCallback(async () => {
    setLoading(true)
    setSpots(getNearbyParkingSpots(location.lat, location.lng))
    setGarages(getNearbyGarages(location.lat, location.lng))
    setEVStations(getNearbyEVStations(location.lat, location.lng))
    try {
      const sightings = await getEnforcementSightings()
      setEnforcement(sightings)
    } catch {
      // Non-critical
    }
    setVacatingSpots(getNearbyVacatingSpots(location.lat, location.lng))
    setLoading(false)
  }, [location.lat, location.lng])

  useEffect(() => { loadData() }, [loadData])

  /* ── Distance helper ── */
  const getDist = useCallback((item: SelectedItem) => {
    if (isEnforcement(item)) {
      return calculateDistance(location.lat, location.lng, item.coordinates.lat, item.coordinates.lng)
    }
    return calculateDistance(location.lat, location.lng, (item as { lat: number }).lat, (item as { lng: number }).lng)
  }, [location.lat, location.lng])

  /* ── Sorted data ── */
  const availableSpots = useMemo(
    () => spots.filter(s => s.status === "available").sort((a, b) => getDist(a) - getDist(b)),
    [spots, getDist]
  )
  const sortedGarages = useMemo(
    () => [...garages].sort((a, b) => getDist(a) - getDist(b)),
    [garages, getDist]
  )
  const sortedEV = useMemo(
    () => [...evStations].sort((a, b) => getDist(a) - getDist(b)),
    [evStations, getDist]
  )
  const sortedEnforcement = useMemo(
    () => [...enforcement].sort((a, b) => getDist(a) - getDist(b)),
    [enforcement, getDist]
  )

  /* ── Search via Nominatim ── */
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 3) { setSearchResults([]); return }
    searchAbortRef.current?.abort()
    const controller = new AbortController()
    searchAbortRef.current = controller
    setSearchLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", San Francisco")}&limit=5`,
        { signal: controller.signal, headers: { "User-Agent": "ParkApp/1.0" } }
      )
      const data = await res.json()
      if (!controller.signal.aborted) {
        setSearchResults(data.map((r: Record<string, string>) => ({
          displayName: r.display_name.split(",").slice(0, 2).join(",").trim(),
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
        })))
      }
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") setSearchResults([])
    }
    if (!controller.signal.aborted) setSearchLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) handleSearch(searchQuery)
      else setSearchResults([])
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  const selectSearchResult = (result: SearchResult) => {
    setMapCenter({ lat: result.lat, lng: result.lng })
    setSheetState("summary")
    setSearchQuery("")
    setSearchResults([])
  }

  /* ── Recenter ── */
  const handleRecenter = () => setMapCenter({ ...location })

  /* ── Map markers ── */
  const mapMarkers = useMemo(() => {
    const markers: MapMarker[] = [
      { lat: location.lat, lng: location.lng, type: "user", label: "You are here" },
    ]
    if (viewMode === "all" || viewMode === "street") {
      availableSpots.forEach(s => {
        markers.push({
          lat: s.lat, lng: s.lng, type: "street",
          label: `${s.type.charAt(0).toUpperCase() + s.type.slice(1)} parking`,
          details: [formatDistance(getDist(s)), s.timeLimit ? `${s.timeLimit}min` : null, s.rate ? `$${s.rate}/hr` : "Free"].filter(Boolean).join(" · "),
        })
      })
    }
    if (viewMode === "all" || viewMode === "garages") {
      sortedGarages.forEach(g => {
        markers.push({ lat: g.lat, lng: g.lng, type: "garage", label: g.name, details: `${g.availableSpaces} spots · $${g.rate}/hr` })
      })
    }
    if (viewMode === "all" || viewMode === "ev") {
      sortedEV.forEach(s => {
        markers.push({ lat: s.lat, lng: s.lng, type: "ev", label: s.name, details: `${s.availablePorts} ports · ${s.chargerTypes.join(", ")}` })
      })
    }
    if (viewMode === "all" || viewMode === "enforcement") {
      sortedEnforcement.forEach(s => {
        markers.push({
          lat: s.coordinates.lat, lng: s.coordinates.lng, type: "enforcement",
          label: getEnforcementTypeLabel(s.type), details: getTimeAgo(s.reportedAt),
        })
      })
    }
    return markers
  }, [viewMode, availableSpots, sortedGarages, sortedEV, sortedEnforcement, location.lat, location.lng, getDist])

  /* ── Marker click ── */
  const handleMarkerClick = (marker: MapMarker) => {
    if (marker.type === "user") return
    let item: SelectedItem | undefined
    if (marker.type === "street") item = availableSpots.find(s => s.lat === marker.lat && s.lng === marker.lng)
    else if (marker.type === "garage") item = sortedGarages.find(g => g.lat === marker.lat && g.lng === marker.lng)
    else if (marker.type === "ev") item = sortedEV.find(s => s.lat === marker.lat && s.lng === marker.lng)
    else if (marker.type === "enforcement") item = sortedEnforcement.find(s => s.coordinates.lat === marker.lat && s.coordinates.lng === marker.lng)
    if (item) { setSelectedItem(item); setSheetState("detail") }
  }

  /* ── Navigate ── */
  const handleNavigate = (lat: number, lng: number) => window.open(getDirectionsUrl(lat, lng), "_blank")

  /* ── Save / unsave ── */
  const handleToggleSave = (item: SelectedItem) => {
    if (isEnforcement(item)) return
    const lat = item.lat
    const lng = item.lng
    if (isLocationSaved(lat, lng)) {
      const saved = getLocationByCoords(lat, lng)
      if (saved) removeLocation(saved.id)
    } else {
      const name = isSpot(item)
        ? `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} parking`
        : (item as ParkingGarage | EVStation).name
      saveLocation({ name, street: name, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, coordinates: { lat, lng } })
    }
  }

  /* ── Report ── */
  const handleSubmitReport = async () => {
    if (!reportType) return
    setReportSubmitting(true)
    try {
      await reportEnforcement(reportType, { lat: location.lat, lng: location.lng }, "Current location")
      setReportSuccess(true)
      setTimeout(() => { setSheetState("summary"); setReportType(null); setReportSuccess(false) }, 1500)
      loadData()
    } catch { /* silent */ }
    setReportSubmitting(false)
  }

  /* ── Vote ── */
  const handleVote = async (id: string, up: boolean) => {
    try { await voteEnforcement(id, up) } catch { /* */ }
  }

  /* ── Item coordinates helper ── */
  const itemCoords = (item: SelectedItem) =>
    isEnforcement(item) ? item.coordinates : { lat: item.lat, lng: item.lng }

  const totalNearby = availableSpots.length + sortedGarages.length + sortedEV.length

  /* ── Glass style ── */
  const glass: React.CSSProperties = {
    background: "var(--card-glass)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid var(--park-border)",
  }

  const filterPill = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 5,
    padding: "6px 12px", borderRadius: 999, border: "1px solid var(--park-border)",
    fontSize: 11, fontWeight: 600, cursor: "pointer",
    background: active ? "var(--park-fg)" : "var(--card-glass)",
    color: active ? "var(--park-bg)" : "var(--park-fg)",
    backdropFilter: "blur(12px)",
    transition: "all .2s",
  })

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="flex flex-col min-h-screen relative" style={{ background: "var(--park-bg)" }}>
      {/* ── Full-screen map ── */}
      <div style={{ position: "absolute", inset: 0 }}>
        <MapWrapper center={mapCenter} zoom={14} markers={mapMarkers} onMarkerClick={handleMarkerClick} />
      </div>

      {/* ================================================================ */}
      {/*  SEARCH OVERLAY                                                   */}
      {/* ================================================================ */}
      {sheetState === "search" && (
        <div className="fade-in" style={{ position: "absolute", inset: 0, zIndex: 2000, background: "var(--park-bg)" }}>
          <div style={{ padding: "60px 16px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => { setSheetState("summary"); setSearchQuery(""); setSearchResults([]) }}
                className="press"
                style={{ width: 36, height: 36, borderRadius: 999, background: "var(--park-surface)", border: "1px solid var(--park-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--park-fg)", cursor: "pointer" }}
              >
                <X style={{ width: 18, height: 18 }} strokeWidth={1.75} />
              </button>
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search address or place..."
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 16,
                  background: "var(--park-surface)", border: "1px solid var(--park-border)",
                  color: "var(--park-fg)", fontSize: 15, outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {searchLoading && (
              <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
                <Loader2 style={{ width: 20, height: 20, color: "var(--park-accent)" }} className="animate-spin" />
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectSearchResult(r)}
                  className="press"
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "transparent", border: "none", borderBottom: "1px solid var(--park-hairline)", textAlign: "left", color: "var(--park-fg)", cursor: "pointer" }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--park-accent-pale)", color: "var(--park-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin style={{ width: 16, height: 16 }} strokeWidth={1.75} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{r.displayName}</span>
                </button>
              ))}
              {searchQuery.length >= 3 && !searchLoading && searchResults.length === 0 && (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--park-muted-fg)", fontSize: 14 }}>No results found</div>
              )}
            </div>

            {searchQuery.length < 3 && (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--park-muted-fg)", fontSize: 13 }}>
                Type at least 3 characters to search
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  TOP BAR: Search + Filters                                        */}
      {/* ================================================================ */}
      {sheetState !== "search" && (
        <div style={{ position: "absolute", top: 56, left: 14, right: 14, zIndex: 1000 }}>
          {/* Search bar */}
          <button
            onClick={() => setSheetState("search")}
            className="press"
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", borderRadius: 999, cursor: "pointer",
              ...glass, boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <Search style={{ width: 16, height: 16, color: "var(--park-muted-fg)" }} strokeWidth={1.75} />
            <span style={{ flex: 1, fontSize: 14, color: "var(--park-muted-fg)", textAlign: "left" }}>Search this area...</span>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: "var(--park-surface2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin style={{ width: 14, height: 14, color: "var(--park-accent)" }} strokeWidth={1.75} />
            </div>
          </button>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {([
              { id: "all" as ViewMode, label: "All", dot: null },
              { id: "street" as ViewMode, label: "Street", dot: "#10b981" },
              { id: "garages" as ViewMode, label: "Garages", dot: "#3b82f6" },
              { id: "ev" as ViewMode, label: "EV", dot: "#f59e0b" },
              { id: "enforcement" as ViewMode, label: "Alerts", dot: "#ef4444" },
            ]).map(f => (
              <button key={f.id} onClick={() => setViewMode(f.id)} className="press" style={filterPill(viewMode === f.id)}>
                {f.dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: viewMode === f.id ? "var(--park-bg)" : f.dot, display: "inline-block" }} />}
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  MY LOCATION BUTTON                                               */}
      {/* ================================================================ */}
      {sheetState !== "search" && (
        <button
          onClick={handleRecenter}
          className="press"
          style={{
            position: "absolute", bottom: 210, right: 14, zIndex: 1000,
            width: 44, height: 44, borderRadius: 14, cursor: "pointer",
            ...glass, boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--park-accent)",
          }}
        >
          <LocateFixed style={{ width: 20, height: 20 }} strokeWidth={1.75} />
        </button>
      )}

      {/* ================================================================ */}
      {/*  BOTTOM SHEET AREA                                                */}
      {/* ================================================================ */}
      {sheetState !== "search" && (
        <div style={{ position: "absolute", bottom: 90, left: 14, right: 14, zIndex: 1000 }}>

          {/* ── SUMMARY BAR ── */}
          {sheetState === "summary" && (
            <div className="fade-in" style={{ ...glass, borderRadius: 18, padding: "12px 14px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--park-ok-bg)", color: "var(--park-ok-ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ParkingCircle style={{ width: 16, height: 16 }} strokeWidth={1.75} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--park-fg)" }}>
                    {loading ? "Loading..." : `${availableSpots.length} open spots`}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--park-muted-fg)" }}>
                    {sortedGarages.length} garages · {sortedEV.length} EV{vacatingSpots.length > 0 ? ` · ${vacatingSpots.length} opening` : ""}{sortedEnforcement.length > 0 ? ` · ${sortedEnforcement.length} alerts` : ""}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSheetState("list")}
                className="press"
                style={{ width: 34, height: 34, borderRadius: 10, background: "var(--park-surface2)", border: "1px solid var(--park-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--park-fg)", cursor: "pointer" }}
              >
                <List style={{ width: 16, height: 16 }} strokeWidth={1.75} />
              </button>
              <button
                onClick={() => setSheetState("report")}
                className="press"
                style={{ padding: "8px 14px", borderRadius: 999, background: "var(--park-accent)", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}
              >
                <Flag style={{ width: 12, height: 12 }} strokeWidth={2} /> Report
              </button>
            </div>
          )}

          {/* ── DETAIL SHEET ── */}
          {sheetState === "detail" && selectedItem && (
            <DetailSheet
              item={selectedItem}
              getDist={getDist}
              onClose={() => { setSelectedItem(null); setSheetState("summary") }}
              onNavigate={handleNavigate}
              onToggleSave={handleToggleSave}
              onVote={handleVote}
              isLocationSaved={isLocationSaved}
              itemCoords={itemCoords}
            />
          )}

          {/* ── LIST PANEL ── */}
          {sheetState === "list" && (
            <ListPanel
              availableSpots={availableSpots}
              sortedGarages={sortedGarages}
              sortedEV={sortedEV}
              sortedEnforcement={sortedEnforcement}
              getDist={getDist}
              totalNearby={totalNearby}
              glass={glass}
              onSelect={(item, coords) => {
                setSelectedItem(item)
                setSheetState("detail")
                setMapCenter(coords)
              }}
              onClose={() => setSheetState("summary")}
            />
          )}

          {/* ── REPORT SHEET ── */}
          {sheetState === "report" && (
            <ReportSheet
              glass={glass}
              reportType={reportType}
              setReportType={setReportType}
              reportSubmitting={reportSubmitting}
              reportSuccess={reportSuccess}
              onSubmit={handleSubmitReport}
              onClose={() => { setSheetState("summary"); setReportType(null) }}
            />
          )}
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  DETAIL SHEET                                                       */
/* ================================================================== */

function DetailSheet({
  item, getDist, onClose, onNavigate, onToggleSave, onVote, isLocationSaved, itemCoords,
}: {
  item: SelectedItem
  getDist: (item: SelectedItem) => number
  onClose: () => void
  onNavigate: (lat: number, lng: number) => void
  onToggleSave: (item: SelectedItem) => void
  onVote: (id: string, up: boolean) => void
  isLocationSaved: (lat: number, lng: number) => boolean
  itemCoords: (item: SelectedItem) => { lat: number; lng: number }
}) {
  const coords = itemCoords(item)
  const saved = !isEnforcement(item) && isLocationSaved(coords.lat, coords.lng)

  return (
    <div className="animate-fade-in-up" style={{ background: "var(--card-glass)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid var(--park-border)", borderRadius: 22, padding: 18, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          background: isEnforcement(item) ? "var(--park-err-bg)" : isSpot(item) ? "var(--park-ok-bg)" : isGarage(item) ? "var(--park-accent-pale)" : "var(--park-warn-bg)",
          color: isEnforcement(item) ? "var(--park-err-ink)" : isSpot(item) ? "var(--park-ok-ink)" : isGarage(item) ? "var(--park-accent)" : "var(--park-warn-ink)",
        }}>
          {isEnforcement(item) ? <ShieldAlert style={{ width: 22, height: 22 }} strokeWidth={1.75} />
            : isSpot(item) ? <Check style={{ width: 22, height: 22 }} strokeWidth={1.75} />
            : isGarage(item) ? <Building2 style={{ width: 22, height: 22 }} strokeWidth={1.75} />
            : <Zap style={{ width: 22, height: 22 }} strokeWidth={1.75} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--park-fg)" }}>
            {isEnforcement(item) ? getEnforcementTypeLabel(item.type)
              : isSpot(item) ? `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} parking`
              : (item as ParkingGarage | EVStation).name}
          </div>
          <div style={{ fontSize: 12, color: "var(--park-muted-fg)", marginTop: 2 }}>
            {isEnforcement(item)
              ? `${getTimeAgo(item.reportedAt)} · ${formatDistance(getDist(item))} away`
              : `${formatDistance(getDist(item))} away · ${estimateWalkingTime(getDist(item))} walk`}
          </div>
        </div>
        <button onClick={onClose} className="press" style={{ width: 30, height: 30, borderRadius: 999, background: "var(--park-surface2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--park-muted-fg)", flexShrink: 0, cursor: "pointer" }}>
          <X style={{ width: 14, height: 14 }} strokeWidth={2} />
        </button>
      </div>

      {/* Stats row */}
      {isSpot(item) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
          <StatBox icon={<DollarSign style={{ width: 14, height: 14, color: "var(--park-accent)" }} strokeWidth={2} />} value={item.rate ? `$${item.rate}` : "Free"} label={item.rate ? "per hour" : "parking"} />
          <StatBox icon={<Timer style={{ width: 14, height: 14, color: "var(--park-accent)" }} strokeWidth={2} />} value={item.timeLimit ? `${item.timeLimit}m` : "--"} label="time limit" />
          <StatBox icon={<Footprints style={{ width: 14, height: 14, color: "var(--park-accent)" }} strokeWidth={2} />} value={estimateWalkingTime(getDist(item))} label="walk" />
        </div>
      )}
      {isGarage(item) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
          <StatBox icon={<DollarSign style={{ width: 14, height: 14, color: "var(--park-accent)" }} strokeWidth={2} />} value={`$${item.rate}`} label="per hour" />
          <StatBox icon={<Car style={{ width: 14, height: 14, color: "var(--park-accent)" }} strokeWidth={2} />} value={`${item.availableSpaces}`} label={`of ${item.totalSpaces}`} />
          <StatBox icon={<Clock style={{ width: 14, height: 14, color: "var(--park-accent)" }} strokeWidth={2} />} value={item.hours.split(" ")[0]} label="hours" />
        </div>
      )}
      {isEV(item) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
          <StatBox icon={<Zap style={{ width: 14, height: 14, color: "var(--park-warn-ink)" }} strokeWidth={2} />} value={`${item.availablePorts}`} label={`of ${item.totalPorts} ports`} />
          <StatBox icon={<DollarSign style={{ width: 14, height: 14, color: "var(--park-warn-ink)" }} strokeWidth={2} />} value={item.pricePerKwh ? `$${item.pricePerKwh}` : "Free"} label="per kWh" />
          <StatBox icon={<Car style={{ width: 14, height: 14, color: "var(--park-warn-ink)" }} strokeWidth={2} />} value={estimateDrivingTime(getDist(item))} label="drive" />
        </div>
      )}

      {/* Enforcement meta + votes */}
      {isEnforcement(item) && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, padding: "10px 12px", borderRadius: 12, background: "var(--park-surface2)" }}>
          <div style={{ flex: 1, fontSize: 13, color: "var(--park-muted-fg)" }}>
            {item.address || "Near your location"}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => onVote(item.id, true)} className="press" style={{ padding: "5px 10px", borderRadius: 8, background: "var(--park-ok-bg)", border: "none", color: "var(--park-ok-ink)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
              <ArrowUp style={{ width: 12, height: 12 }} strokeWidth={2} />{item.upvotes}
            </button>
            <button onClick={() => onVote(item.id, false)} className="press" style={{ padding: "5px 10px", borderRadius: 8, background: "var(--park-err-bg)", border: "none", color: "var(--park-err-ink)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
              <ArrowDown style={{ width: 12, height: 12 }} strokeWidth={2} />{item.downvotes}
            </button>
          </div>
        </div>
      )}

      {/* Feature / charger tags */}
      {isGarage(item) && item.features.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {item.features.map(f => (
            <span key={f} style={{ padding: "4px 10px", borderRadius: 999, background: "var(--park-accent-pale)", color: "var(--park-accent)", fontSize: 11, fontWeight: 600 }}>{f}</span>
          ))}
        </div>
      )}
      {isEV(item) && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {item.chargerTypes.map(t => (
            <span key={t} style={{ padding: "4px 10px", borderRadius: 999, background: "var(--park-warn-bg)", color: "var(--park-warn-ink)", fontSize: 11, fontWeight: 600 }}>{t}</span>
          ))}
          <span style={{ padding: "4px 10px", borderRadius: 999, background: "var(--park-surface2)", color: "var(--park-muted-fg)", fontSize: 11, fontWeight: 600 }}>{item.networkName}</span>
        </div>
      )}

      {/* Community tips */}
      {!isEnforcement(item) && (() => {
        const tips = getNearbyTips(coords.lat, coords.lng, 0.05)
        const rating = getSpotRating(coords.lat, coords.lng)
        if (tips.length === 0 && !rating) return null
        return (
          <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 12, background: "var(--park-surface2)", display: "flex", flexDirection: "column", gap: 4 }}>
            {rating && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--park-fg)" }}>
                <span style={{ color: "#f59e0b" }}>{"★".repeat(Math.round(rating.avg))}</span>
                <span style={{ fontWeight: 700 }}>{rating.avg}</span>
                <span style={{ color: "var(--park-muted-fg)" }}>({rating.count} ratings)</span>
              </div>
            )}
            {tips.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {tips.slice(0, 4).map(tip => (
                  <span key={tip.id} style={{ padding: "3px 8px", borderRadius: 999, background: "var(--park-accent-pale)", color: "var(--park-accent)", fontSize: 10, fontWeight: 600 }}>
                    {SPOT_TAG_LABELS[tip.tag]}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })()}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        {!isEnforcement(item) && (
          <button onClick={() => onToggleSave(item)} className="press" style={{
            width: 44, height: 44, borderRadius: 14, border: "1px solid var(--park-border)", cursor: "pointer",
            background: saved ? "var(--park-accent-pale)" : "var(--park-surface2)",
            color: saved ? "var(--park-accent)" : "var(--park-muted-fg)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {saved ? <BookmarkCheck style={{ width: 18, height: 18 }} strokeWidth={1.75} /> : <Bookmark style={{ width: 18, height: 18 }} strokeWidth={1.75} />}
          </button>
        )}
        <button onClick={() => onNavigate(coords.lat, coords.lng)} className="press" style={{
          flex: 1, padding: "12px 16px", borderRadius: 14, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, var(--park-accent), var(--park-accent-deep))",
          color: "#fff", fontSize: 14, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: "0 6px 20px rgba(59,130,246,0.3)",
        }}>
          <Navigation style={{ width: 16, height: 16 }} strokeWidth={2} />
          {isEnforcement(item) ? "View on map" : "Navigate here"}
        </button>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  STAT BOX                                                           */
/* ================================================================== */

function StatBox({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div style={{ background: "var(--park-surface2)", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--park-fg)" }}>{value}</div>
      <div style={{ fontSize: 10, color: "var(--park-muted-fg)" }}>{label}</div>
    </div>
  )
}

/* ================================================================== */
/*  LIST PANEL                                                         */
/* ================================================================== */

function ListPanel({
  availableSpots, sortedGarages, sortedEV, sortedEnforcement, getDist, totalNearby, glass, onSelect, onClose,
}: {
  availableSpots: ParkingSpot[]
  sortedGarages: ParkingGarage[]
  sortedEV: EVStation[]
  sortedEnforcement: EnforcementSighting[]
  getDist: (item: SelectedItem) => number
  totalNearby: number
  glass: React.CSSProperties
  onSelect: (item: SelectedItem, coords: { lat: number; lng: number }) => void
  onClose: () => void
}) {
  const rowStyle: React.CSSProperties = { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "transparent", border: "none", borderBottom: "1px solid var(--park-hairline)", textAlign: "left", color: "var(--park-fg)", cursor: "pointer" }
  const sectionLabel: React.CSSProperties = { padding: "10px 16px 4px", fontSize: 11, fontWeight: 700, color: "var(--park-muted-fg)", letterSpacing: 0.4, textTransform: "uppercase" }

  return (
    <div className="animate-fade-in-up" style={{ ...glass, borderRadius: 22, boxShadow: "0 10px 30px rgba(0,0,0,0.2)", maxHeight: "55vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px", borderBottom: "1px solid var(--park-hairline)", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--park-fg)" }}>Nearby parking</div>
        <button onClick={onClose} className="press" style={{ width: 28, height: 28, borderRadius: 999, background: "var(--park-surface2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--park-muted-fg)", cursor: "pointer" }}>
          <X style={{ width: 14, height: 14 }} strokeWidth={2} />
        </button>
      </div>
      <div style={{ overflow: "auto", flex: 1 }} className="park-scroll">
        {totalNearby === 0 && sortedEnforcement.length === 0 && (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--park-muted-fg)", fontSize: 14 }}>No spots found nearby</div>
        )}

        {availableSpots.length > 0 && (
          <div>
            <div style={sectionLabel}>Street Parking</div>
            {availableSpots.slice(0, 6).map(s => (
              <button key={s.id} onClick={() => onSelect(s, { lat: s.lat, lng: s.lng })} className="press" style={rowStyle}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--park-ok-bg)", color: "var(--park-ok-ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check style={{ width: 16, height: 16 }} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{s.type.charAt(0).toUpperCase() + s.type.slice(1)} parking</div>
                  <div style={{ fontSize: 12, color: "var(--park-muted-fg)", marginTop: 1 }}>{formatDistance(getDist(s))} · {estimateWalkingTime(getDist(s))} walk · {s.rate ? `$${s.rate}/hr` : "Free"}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {sortedGarages.length > 0 && (
          <div>
            <div style={sectionLabel}>Garages</div>
            {sortedGarages.map(g => (
              <button key={g.id} onClick={() => onSelect(g, { lat: g.lat, lng: g.lng })} className="press" style={rowStyle}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--park-accent-pale)", color: "var(--park-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Building2 style={{ width: 16, height: 16 }} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: "var(--park-muted-fg)", marginTop: 1 }}>{g.availableSpaces} spots · ${g.rate}/hr · {g.hours}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {sortedEV.length > 0 && (
          <div>
            <div style={sectionLabel}>EV Charging</div>
            {sortedEV.map(s => (
              <button key={s.id} onClick={() => onSelect(s, { lat: s.lat, lng: s.lng })} className="press" style={rowStyle}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--park-warn-bg)", color: "var(--park-warn-ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Zap style={{ width: 16, height: 16 }} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "var(--park-muted-fg)", marginTop: 1 }}>{s.availablePorts} ports · {s.chargerTypes.join(", ")} · {s.networkName}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {sortedEnforcement.length > 0 && (
          <div>
            <div style={sectionLabel}>Active Alerts</div>
            {sortedEnforcement.map(s => (
              <button key={s.id} onClick={() => onSelect(s, s.coordinates)} className="press" style={rowStyle}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--park-err-bg)", color: "var(--park-err-ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ShieldAlert style={{ width: 16, height: 16 }} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{getEnforcementTypeLabel(s.type)}</div>
                  <div style={{ fontSize: 12, color: "var(--park-muted-fg)", marginTop: 1 }}>{getTimeAgo(s.reportedAt)} · {formatDistance(getDist(s))} away</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div style={{ height: 8 }} />
      </div>
    </div>
  )
}

/* ================================================================== */
/*  REPORT SHEET                                                       */
/* ================================================================== */

function ReportSheet({
  glass, reportType, setReportType, reportSubmitting, reportSuccess, onSubmit, onClose,
}: {
  glass: React.CSSProperties
  reportType: ReportType | null
  setReportType: (t: ReportType) => void
  reportSubmitting: boolean
  reportSuccess: boolean
  onSubmit: () => void
  onClose: () => void
}) {
  return (
    <div className="animate-fade-in-up" style={{ ...glass, borderRadius: 22, padding: 18, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
      {reportSuccess ? (
        <div className="fade-in" style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ width: 48, height: 48, borderRadius: 999, background: "var(--park-ok-bg)", color: "var(--park-ok-ink)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <Check style={{ width: 24, height: 24 }} strokeWidth={2} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--park-fg)" }}>Report submitted</div>
          <div style={{ fontSize: 13, color: "var(--park-muted-fg)", marginTop: 4 }}>Thanks for keeping others safe</div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--park-fg)" }}>Report a sighting</div>
            <button onClick={onClose} className="press" style={{ width: 28, height: 28, borderRadius: 999, background: "var(--park-surface2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--park-muted-fg)", cursor: "pointer" }}>
              <X style={{ width: 14, height: 14 }} strokeWidth={2} />
            </button>
          </div>
          <div style={{ fontSize: 12, color: "var(--park-muted-fg)", marginBottom: 12 }}>What did you see?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {([
              { type: "meter_maid" as ReportType, label: "Meter Maid", Icon: AlertTriangle, tone: "err" },
              { type: "tow_truck" as ReportType, label: "Tow Truck", Icon: Truck, tone: "warn" },
              { type: "police" as ReportType, label: "Police", Icon: ShieldAlert, tone: "err" },
              { type: "parking_enforcement" as ReportType, label: "Enforcement", Icon: Flag, tone: "warn" },
            ] as const).map(opt => {
              const active = reportType === opt.type
              const errTone = opt.tone === "err"
              return (
                <button key={opt.type} onClick={() => setReportType(opt.type)} className="press" style={{
                  padding: "14px 12px", borderRadius: 14, cursor: "pointer",
                  background: active ? (errTone ? "var(--park-err-bg)" : "var(--park-warn-bg)") : "var(--park-surface2)",
                  border: active ? `2px solid ${errTone ? "var(--park-err-ink)" : "var(--park-warn-ink)"}` : "2px solid transparent",
                  color: active ? (errTone ? "var(--park-err-ink)" : "var(--park-warn-ink)") : "var(--park-fg)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all .2s",
                }}>
                  <opt.Icon style={{ width: 20, height: 20 }} strokeWidth={1.75} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{opt.label}</span>
                </button>
              )
            })}
          </div>
          <button onClick={onSubmit} disabled={!reportType || reportSubmitting} className="press" style={{
            width: "100%", marginTop: 14, padding: "14px 16px", borderRadius: 14, border: "none", cursor: "pointer",
            background: reportType ? "linear-gradient(135deg, var(--park-accent), var(--park-accent-deep))" : "var(--park-surface2)",
            color: reportType ? "#fff" : "var(--park-muted-fg)",
            fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: reportSubmitting ? 0.7 : 1,
            boxShadow: reportType ? "0 6px 20px rgba(59,130,246,0.3)" : "none",
            transition: "all .2s",
          }}>
            {reportSubmitting ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Flag style={{ width: 14, height: 14 }} strokeWidth={2} />}
            {reportSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </>
      )}
    </div>
  )
}
