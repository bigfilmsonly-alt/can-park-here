import dynamic from "next/dynamic"
import type { MapMarker } from "./leaflet-map"

export const MapWrapper = dynamic(
  () => import("./leaflet-map").then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="animate-pulse bg-muted"
        style={{ height: "100%", width: "100%" }}
      />
    ),
  }
) as React.ComponentType<{
  center: { lat: number; lng: number }
  zoom?: number
  markers: MapMarker[]
  onMarkerClick?: (marker: MapMarker) => void
}>
