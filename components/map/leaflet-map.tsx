"use client"

import { useEffect } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"

// Fix the default Leaflet marker icon issue in Next.js
// Leaflet's default icons reference images via CSS which breaks with bundlers
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
}

// Custom colored icons using divIcon with inline SVG
function createMarkerIcon(type: MapMarker["type"]): L.DivIcon {
  const config: Record<string, { color: string; bg: string; svg: string }> = {
    street: {
      color: "#16a34a",
      bg: "#dcfce7",
      svg: `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" fill="currentColor"/><circle cx="12" cy="10" r="3" fill="white"/>`,
    },
    garage: {
      color: "#2563eb",
      bg: "#dbeafe",
      svg: `<rect x="4" y="8" width="16" height="12" rx="1" fill="currentColor"/><rect x="7" y="4" width="10" height="4" rx="1" fill="currentColor"/><rect x="7" y="11" width="4" height="3" rx="0.5" fill="white"/><rect x="13" y="11" width="4" height="3" rx="0.5" fill="white"/>`,
    },
    ev: {
      color: "#ca8a04",
      bg: "#fef9c3",
      svg: `<polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="currentColor"/>`,
    },
    enforcement: {
      color: "#dc2626",
      bg: "#fee2e2",
      svg: `<path d="M12 2L2 22h20L12 2z" fill="currentColor"/><line x1="12" y1="9" x2="12" y2="15" stroke="white" stroke-width="2"/><circle cx="12" cy="18" r="1" fill="white"/>`,
    },
    user: {
      color: "#3b82f6",
      bg: "#3b82f6",
      svg: "",
    },
  }

  const c = config[type] || config.street

  if (type === "user") {
    return L.divIcon({
      className: "leaflet-user-marker",
      html: `<div style="
        width: 18px;
        height: 18px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 2px #3b82f6, 0 2px 6px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    })
  }

  return L.divIcon({
    className: "leaflet-custom-marker",
    html: `<div style="
      width: 36px;
      height: 36px;
      background: ${c.bg};
      border: 2px solid ${c.color};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" style="color: ${c.color};">
        ${c.svg}
      </svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

// Component to recenter the map when center prop changes
function RecenterMap({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap()

  useEffect(() => {
    map.setView([center.lat, center.lng])
  }, [center.lat, center.lng, map])

  return null
}

export function LeafletMap({ center, zoom = 14, markers, onMarkerClick }: LeafletMapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ height: "100%", width: "100%", minHeight: "250px" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap center={center} />

      {markers.map((marker, idx) => (
        <Marker
          key={`${marker.type}-${marker.lat}-${marker.lng}-${idx}`}
          position={[marker.lat, marker.lng]}
          icon={createMarkerIcon(marker.type)}
          eventHandlers={{
            click: () => onMarkerClick?.(marker),
          }}
        >
          <Popup>
            <div style={{ minWidth: 140 }}>
              <strong style={{ fontSize: 14 }}>{marker.label}</strong>
              {marker.details && (
                <p style={{ fontSize: 12, color: "#666", margin: "4px 0 0" }}>
                  {marker.details}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
