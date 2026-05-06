import dynamic from "next/dynamic"
import type { MapMarker } from "./leaflet-map"

export const MapWrapper = dynamic(
  () => import("./leaflet-map").then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="animate-pulse"
        style={{ height: "100%", width: "100%", background: "var(--park-surface)" }}
      />
    ),
  }
) as React.ComponentType<{
  center: { lat: number; lng: number }
  zoom?: number
  markers: MapMarker[]
  onMarkerClick?: (marker: MapMarker) => void
  onMoveEnd?: (center: { lat: number; lng: number }, zoom: number) => void
}>
