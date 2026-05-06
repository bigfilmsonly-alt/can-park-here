"use client"

import { useEffect } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

export interface MapMarker {
  lat: number
  lng: number
  type: "street" | "garage" | "ev" | "enforcement" | "user"
  label: string
  details?: string
}

interface LeafletMapProps {
  center: { lat: number; lng: number }
  zoom?: number
  markers: MapMarker[]
  onMarkerClick?: (marker: MapMarker) => void
  onMoveEnd?: (center: { lat: number; lng: number }, zoom: number) => void
}

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'

function createMarkerIcon(type: MapMarker["type"]): L.DivIcon {
  if (type === "user") {
    return L.divIcon({
      className: "",
      html: `<div style="position:relative;width:22px;height:22px">
        <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(59,130,246,0.18);animation:park-sonar 2s ease-out infinite"></div>
        <div style="position:absolute;inset:-4px;border-radius:50%;background:rgba(59,130,246,0.1);animation:park-sonar 2s ease-out 0.5s infinite"></div>
        <div style="width:22px;height:22px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 2px rgba(59,130,246,0.4),0 2px 8px rgba(0,0,0,0.3);position:relative;z-index:1"></div>
      </div>
      <style>@keyframes park-sonar{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.8);opacity:0}}</style>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    })
  }

  const cfg: Record<string, { color: string; bg: string; icon: string }> = {
    street: {
      color: "#10b981",
      bg: "rgba(16,185,129,0.15)",
      icon: `<circle cx="12" cy="12" r="4" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="#fff"/>`,
    },
    garage: {
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.15)",
      icon: `<rect x="5" y="7" width="14" height="10" rx="2" fill="currentColor"/><rect x="7" y="10" width="3" height="3" rx=".5" fill="#fff"/><rect x="14" y="10" width="3" height="3" rx=".5" fill="#fff"/><path d="M9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
    },
    ev: {
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.15)",
      icon: `<polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="currentColor"/>`,
    },
    enforcement: {
      color: "#ef4444",
      bg: "rgba(239,68,68,0.15)",
      icon: `<path d="M12 3L3 21h18L12 3z" fill="currentColor"/><line x1="12" y1="10" x2="12" y2="15" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="18" r="1.2" fill="#fff"/>`,
    },
  }

  const c = cfg[type] || cfg.street

  return L.divIcon({
    className: "",
    html: `<div style="
      width:34px;height:34px;
      background:${c.bg};
      border:2px solid ${c.color};
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      backdrop-filter:blur(4px);
      transition:transform .15s;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" style="color:${c.color}">${c.icon}</svg>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}

function RecenterMap({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng], undefined, { animate: true, duration: 0.4 })
  }, [center.lat, center.lng, map])
  return null
}

function MapEvents({ onMoveEnd }: { onMoveEnd?: LeafletMapProps["onMoveEnd"] }) {
  useMapEvents({
    moveend: (e) => {
      if (onMoveEnd) {
        const c = e.target.getCenter()
        onMoveEnd({ lat: c.lat, lng: c.lng }, e.target.getZoom())
      }
    },
  })
  return null
}

export function LeafletMap({ center, zoom = 14, markers, onMarkerClick, onMoveEnd }: LeafletMapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer attribution={TILE_ATTR} url={TILE_URL} />
      <RecenterMap center={center} />
      <MapEvents onMoveEnd={onMoveEnd} />
      {markers.map((marker, idx) => (
        <Marker
          key={`${marker.type}-${marker.lat}-${marker.lng}-${idx}`}
          position={[marker.lat, marker.lng]}
          icon={createMarkerIcon(marker.type)}
          eventHandlers={{ click: () => onMarkerClick?.(marker) }}
        />
      ))}
    </MapContainer>
  )
}
